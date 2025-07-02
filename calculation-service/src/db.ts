// models/CalculationResult.ts
import mongoose from 'mongoose';

const calculationResultSchema = new mongoose.Schema({
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	buyPrice: { type: Number, required: true },
	sellPrice: { type: Number, required: true },
	buyVolume: { type: Number, required: true },
	sellVolume: { type: Number, required: true },
	profitLoss: { type: Number, required: true },
	calculatedAt: { type: Date, default: Date.now },
});

// Create compound index for upsert operations
calculationResultSchema.index({ startTime: 1, endTime: 1 }, { unique: true });

export const CalculationResult = mongoose.model(
	'CalculationResult',
	calculationResultSchema,
);
