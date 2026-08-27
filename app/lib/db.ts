import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix queryTxt ETIMEOUT on Windows / local ISP DNS for MongoDB Atlas SRV connection
if (typeof dns?.setServers === 'function') {
    try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
    } catch {
        // Ignore if environment prevents modifying DNS servers
    }
}

const MONGODB_URI = process.env.MONGODB_URI;

// Allow execution without throwing if MONGODB_URI is absent during some build/test steps
// but warn the developer.
if (!MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI environment variable is not defined.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            serverSelectionTimeoutMS: 10000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        }).catch((error) => {
            console.error('MongoDB connection error:', error);
            cached.promise = null;
            throw error;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectToDatabase;
