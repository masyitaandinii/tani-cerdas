import mongoose, { Schema, Document, Model } from 'mongoose';
import { Kuartal } from '../data';

export interface ITengkulakRecord extends Document {
    nama: string;
    dusun: number;
    hargaBeras: number;
    hargaGabah: number;
    kuartal: Kuartal;
    timestamp: Date;
    totalPanen: number;
    authorId?: mongoose.Types.ObjectId;
}

const TengkulakRecordSchema = new Schema<ITengkulakRecord>({
    nama: { type: String, required: true },
    dusun: { type: Number, required: true, enum: [1, 2, 3, 4] },
    hargaBeras: { type: Number, required: true },
    hargaGabah: { type: Number, required: true },
    kuartal: { type: String, required: true, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
    timestamp: { type: Date, default: Date.now },
    totalPanen: { type: Number, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' }
});

export const TengkulakRecord: Model<ITengkulakRecord> = mongoose.models.TengkulakRecord || mongoose.model<ITengkulakRecord>('TengkulakRecord', TengkulakRecordSchema);
