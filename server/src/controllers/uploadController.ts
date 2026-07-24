import { Context } from "hono";
import { mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { AppError } from "../middleware/errorHandler";

const imageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const uploadImage = async (c: Context) => {
    const body = await c.req.parseBody();

    const file = body.image as File;
    const kind = body.kind as String;


  if (!imageTypes.has(file.type))
    throw new AppError("Only JPG, PNG, and WebP images are supported", 400);
  if (file.size > 5 * 1024 * 1024)
    throw new AppError("Images must be 5 MB or smaller", 400);

 

  const extension = imageTypes.get(file.type) ?? (extname(file.name) || ".jpg");
  const folder = join(
    process.cwd(),
    "uploads",
    kind === "restaurant"
      ? "restaurants"
      : kind === "category"
        ? "categories"
        : "menu",
  );
  await mkdir(folder, { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  await Bun.write(join(folder, filename), file);
  const url = `/uploads/${kind === "restaurant" ? "restaurants" : kind === "category" ? "categories" : "menu"}/${filename}`;

  return c.json({ success: true, data:{url} }, 201);
};
