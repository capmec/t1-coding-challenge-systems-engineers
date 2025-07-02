// YOUR CODE HERE
import { Kafka, EachMessagePayload } from 'kafkajs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CalculationResult } from './db'; // Import the model from db.ts

dotenv.config();

// Define structure of a Trade message
interface TradeMessage {
	messageType: 'trades';
	tradeType: 'BUY' | 'SELL';
	volume: string;
	time: string;
}

// Define structure of a Market Data message
interface MarketDataMessage {
	messageType: 'market';
	buyPrice: string;
	sellPrice: string;
	startTime: string;
	endTime: string;
}

// Internal Trade representation for easier calculations
interface Trade {
	tradeType: 'BUY' | 'SELL';
	volume: number;
	time: Date;
}

// Initialize Kafka connection with instance-specific client ID
const kafka = new Kafka({
	clientId: `calculation-service-${
		process.env.INSTANCE_ID || Math.random().toString(36).substr(2, 9)
	}`,
	brokers: ['kafka:9092'],
});

// Create Kafka consumer within a group to enable scalable consumption
const consumer = kafka.consumer({
	groupId: 'calculation-service-group',
	sessionTimeout: 30000,
	heartbeatInterval: 3000,
});

// Store trades with cleanup based on time
const tradesMap = new Map<string, Trade[]>();
const TRADE_RETENTION_HOURS = 24; // Keep trades for 24 hours

// Memory cleanup function
function cleanupOldTrades(): void {
	const cutoffTime = new Date(
		Date.now() - TRADE_RETENTION_HOURS * 60 * 60 * 1000,
	);

	for (const [key, tradeList] of tradesMap.entries()) {
		const filteredTrades = tradeList.filter(
			(trade) => trade.time >= cutoffTime,
		);

		if (filteredTrades.length === 0) {
			tradesMap.delete(key);
		} else if (filteredTrades.length !== tradeList.length) {
			tradesMap.set(key, filteredTrades);
		}
	}

	console.log(`Cleanup completed. Active trade groups: ${tradesMap.size}`);
}

//  Better trade storage with time-based keys
function storeTrade(trade: Trade): void {
	// Use hour-based key for grouping trades
	const hourKey = new Date(trade.time).toISOString().slice(0, 13); // YYYY-MM-DDTHH

	if (!tradesMap.has(hourKey)) {
		tradesMap.set(hourKey, []);
	}

	tradesMap.get(hourKey)!.push(trade);
}

// Optimized trade retrieval
function getRelevantTrades(startTime: Date, endTime: Date): Trade[] {
	const relevantTrades: Trade[] = [];

	// Get all hour keys that might contain relevant trades
	const startHour = new Date(startTime).toISOString().slice(0, 13);
	const endHour = new Date(endTime).toISOString().slice(0, 13);

	for (const [hourKey, trades] of tradesMap.entries()) {
		if (hourKey >= startHour && hourKey <= endHour) {
			const filteredTrades = trades.filter(
				(t) => t.time >= startTime && t.time <= endTime,
			);
			relevantTrades.push(...filteredTrades);
		}
	}

	return relevantTrades;
}

async function run(): Promise<void> {
	try {
		// Connect to MongoDB with error handling
		await mongoose.connect(
			'mongodb://t1-coding-challenge-database:27017/calculations',
			{
				serverSelectionTimeoutMS: 5000,
			},
		);
		console.log('MongoDB connected successfully');

		// Connect to Kafka and subscribe to topics
		await consumer.connect();
		await consumer.subscribe({ topic: 'market-data', fromBeginning: false });

		// Start from latest
		await consumer.subscribe({ topic: 'trades', fromBeginning: false });

		console.log('Kafka consumer connected and subscribed to topics');

		// Set up periodic cleanup
		const cleanupInterval = setInterval(cleanupOldTrades, 60 * 60 * 1000); // Every hour

		// Start consuming messages
		await consumer.run({
			eachMessage: async ({
				topic,
				message,
				partition,
			}: EachMessagePayload): Promise<void> => {
				if (!message.value) return; // Skip empty messages

				try {
					const parsed = JSON.parse(message.value.toString());

					// Handle Trade messages
					if (topic === 'trades' && parsed.messageType === 'trades') {
						const tradeMsg = parsed as TradeMessage;

						// Validate trade data
						if (!tradeMsg.volume || !tradeMsg.time || !tradeMsg.tradeType) {
							console.warn('Invalid trade message received:', tradeMsg);
							return;
						}

						const trade: Trade = {
							tradeType: tradeMsg.tradeType,
							volume: parseFloat(tradeMsg.volume),
							time: new Date(tradeMsg.time),
						};

						// Validate parsed values
						if (isNaN(trade.volume) || isNaN(trade.time.getTime())) {
							console.warn('Invalid trade data after parsing:', trade);
							return;
						}

						storeTrade(trade);
						console.log(
							`Stored trade: ${trade.tradeType} ${
								trade.volume
							} at ${trade.time.toISOString()}`,
						);
					}

					// Handle Market Data messages
					if (topic === 'market-data' && parsed.messageType === 'market') {
						const marketMsg = parsed as MarketDataMessage;

						// Validate market data
						if (
							!marketMsg.buyPrice ||
							!marketMsg.sellPrice ||
							!marketMsg.startTime ||
							!marketMsg.endTime
						) {
							console.warn('Invalid market data message received:', marketMsg);
							return;
						}

						const startTime = new Date(marketMsg.startTime);
						const endTime = new Date(marketMsg.endTime);
						const buyPrice = parseFloat(marketMsg.buyPrice);
						const sellPrice = parseFloat(marketMsg.sellPrice);

						// Validate parsed values
						if (
							isNaN(startTime.getTime()) ||
							isNaN(endTime.getTime()) ||
							isNaN(buyPrice) ||
							isNaN(sellPrice)
						) {
							console.warn('Invalid market data after parsing:', {
								startTime,
								endTime,
								buyPrice,
								sellPrice,
							});
							return;
						}

						// Find trades that occurred within the market timeframe
						const relevantTrades = getRelevantTrades(startTime, endTime);

						// Sum BUY and SELL trade volumes separately
						const buyVolume = relevantTrades
							.filter((t) => t.tradeType === 'BUY')
							.reduce((sum, t) => sum + t.volume, 0);

						const sellVolume = relevantTrades
							.filter((t) => t.tradeType === 'SELL')
							.reduce((sum, t) => sum + t.volume, 0);

						// Enhanced P&L calculation with logging
						const profitLoss = sellVolume * sellPrice - buyVolume * buyPrice;

						console.log(`P&L Calculation:
              Timeframe: ${startTime.toISOString()} - ${endTime.toISOString()}
              Prices: Buy=${buyPrice}, Sell=${sellPrice}
              Volumes: Buy=${buyVolume}, Sell=${sellVolume}
              Relevant Trades: ${relevantTrades.length}
              P&L: ${profitLoss}`);

						// Store result in MongoDB with upsert to avoid duplicates
						await CalculationResult.updateOne(
							{ startTime, endTime },
							{
								startTime,
								endTime,
								buyPrice,
								sellPrice,
								buyVolume,
								sellVolume,
								profitLoss,
								calculatedAt: new Date(),
							},
							{ upsert: true },
						);

						console.log(
							`✅ Stored P&L result: ${profitLoss} for timeframe ${startTime.toISOString()} - ${endTime.toISOString()}`,
						);
					}
				} catch (error) {
					console.error(
						`Error processing message from ${topic}:${partition}:`,
						error,
					);
				}
			},
		});

		// shutdown handling
		const shutdownHandling = async (signal: string) => {
			console.log(`Received ${signal}, shutting down...`);

			clearInterval(cleanupInterval);

			try {
				await consumer.disconnect();
				await mongoose.disconnect();
				console.log('Shutdown completed');
				process.exit(0);
			} catch (error) {
				console.error('Error during shutdown:', error);
				process.exit(1);
			}
		};

		process.on('SIGINT', () => shutdownHandling('SIGINT'));
		process.on('SIGTERM', () => shutdownHandling('SIGTERM'));
	} catch (error) {
		console.error('Fatal error starting calculation service:', error);
		process.exit(1);
	}
}

// Start the service
run().catch((error) => {
	console.error('Unhandled error in calculation service:', error);
	process.exit(1);
});
