import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongodb_uri)
    } catch (error) {
        console.error("Database connection error:", error);
    }
};
export default connectDB;