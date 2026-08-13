// src/controllers/authController.ts
import { Context } from "hono";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError } from "../middleware/errorHandler";

const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET || "secret", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

export const register = async (c: Context) => {
  const { name, email, password, role } = await c.req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(c.t("auth.emailExists"), 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "customer",
  });

  const token = generateToken(user._id.toString(), user.email, user.role);

  return c.json(
    {
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    },
    201,
  );
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json();

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new AppError(c.t("auth.invalidCredentials"), 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(c.t("auth.invalidCredentials"), 401);
  }

  const token = generateToken(user._id.toString(), user.email, user.role);

  return c.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    },
  });
};

export const changePassword = async (c: Context) => {
  const data = c.get("user");
  const { currentPassword, newPassword } = await c.req.json();
  const user = await User.findOne({ email: data.email });
  if (!user || !user.isActive) {
    throw new AppError(c.t("auth.invalidCredentials"), 401);
  }
  if (!newPassword || newPassword.length < 6) {
    throw new AppError(c.t("auth.passwordShort"), 400);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError(c.t("auth.invalidCredentials"), 401);
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  return c.json({ success: true, message: c.t("auth.passwordChanged") });
};

export const getMe = async (c: Context) => {
  const user = c.get("user");

  return c.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};
