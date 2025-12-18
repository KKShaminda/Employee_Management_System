
import User from "./models/User.js";
import bcrypt from "bcrypt";
import connectDB from "./db/db.js";

const userRegister = async () => {
    await connectDB();
    try { 
        const hashPassword = await bcrypt.hash("admin123", 10);

        const newUsers = new User(
            {
                name: "Admin User",
                email: "admin@gmail.com",
                password: hashPassword,
                role: "admin",
            },
        );
        await newUsers.save();
    } catch (error) {
        console.error("Error seeding users:", error);
    }
}

userRegister();

