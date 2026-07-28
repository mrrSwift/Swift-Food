// src/config/database.ts
import * as mongoose from "mongoose";
import User from "../models/User";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_app', {dbName: 'Rest-app'} );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
     // Seed default admin if no users exist
    await seedDefaultAdmin();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

async function seedDefaultAdmin() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('No users found. Creating default admin...');
    await User.create({
      name: 'Admin',
      email: 'admin@swiftfood.com',   // or just 'admin' if email not required? But we have email as unique.
      password: 'admin1234',
      role: 'admin',
      isActive: true,
    });
    console.log('Default admin created (admin@swiftfood.com / admin)');
  }
}


export default connectDB;


