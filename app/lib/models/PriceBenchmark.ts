import mongoose, { Schema, Document, Model } from 'mongoose';
import { GOVERNMENT_PRICE_BENCHMARKS } from '../constants';

export interface IPriceItem {
    min: number;
    max: number;
    target: number;
    label: string;
    description: string;
    unit: string;
}

export interface IPriceBenchmark extends Document {
    beras: IPriceItem;
    gabah: IPriceItem;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const PriceItemSchema = new Schema<IPriceItem>({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    target: { type: Number, required: true },
    label: { type: String, default: 'Acuan Harga' },
    description: { type: String, default: 'Standar harga acuan' },
    unit: { type: String, default: 'Rp/kg' }
}, { _id: false });

const PriceBenchmarkSchema = new Schema<IPriceBenchmark>({
    beras: {
        type: PriceItemSchema,
        default: () => ({ ...GOVERNMENT_PRICE_BENCHMARKS.beras })
    },
    gabah: {
        type: PriceItemSchema,
        default: () => ({ ...GOVERNMENT_PRICE_BENCHMARKS.gabah })
    },
    updatedBy: { type: String }
}, { timestamps: true });

export const PriceBenchmark: Model<IPriceBenchmark> =
    mongoose.models.PriceBenchmark ||
    mongoose.model<IPriceBenchmark>('PriceBenchmark', PriceBenchmarkSchema);
