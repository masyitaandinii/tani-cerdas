import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password?: string;
    name: string;
    role: 'superadmin' | 'admin' | 'tengkulak' | 'user';
    assignedDusun?: number;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'tengkulak', 'user'], required: true },
    assignedDusun: { type: Number, enum: [1, 2, 3, 4] }
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
