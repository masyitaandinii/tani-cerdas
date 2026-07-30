import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Allow execution without throwing if MONGODB_URI is absent during some build/test steps
// but warn the developer.
if (!MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI environment variable is not defined.');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;
