import { connectToDatabase } from './db';
import { PnL } from './types';

export async function getPnls(): Promise<Array<PnL>> {
	// YOUR CODE HERE
	const db = await connectToDatabase();
	const results = await db
		.collection('calculationresults')
		.find()
		.sort({ startTime: -1 })
		.toArray();

	return results.map((doc: any) => ({
		startTime: doc.startTime,
		endTime: doc.endTime,
		pnl: doc.profitLoss,
	}));
}
