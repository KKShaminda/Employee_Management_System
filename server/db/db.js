import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.mongodb_uri 
        await mongoose.connect(uri)
        console.log('MongoDB connected')
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1)
    }
};
export default connectDB;