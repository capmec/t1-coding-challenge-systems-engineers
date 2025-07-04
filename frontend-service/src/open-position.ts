import Kafka from 'kafkajs';
import { toTradeMessage } from './transformation';

let buyVolume = 0;
let sellVolume = 0;
export function getOpenPosition() {
	return buyVolume - sellVolume;
}

const kafka = new Kafka.Kafka({
	clientId: 'frontend-service',
	brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'frontend-service' });

async function startConsumer() {
	try {
		await consumer.connect();
		await consumer.subscribe({ topic: 'trades', fromBeginning: true });

		await consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				if (!message.value) {
					throw new Error('Invalid message');
				}

				const parsed = JSON.parse(message.value.toString());
				if (parsed.messageType !== 'trades') {
					return;
				}

				const tradeMessage = toTradeMessage(parsed);

				// Log the trade message for debugging
				console.log(
					'Received trade message:',
					JSON.stringify(tradeMessage, null, 2),
				);

				// Normalize trade type to handle case sensitivity and potential whitespace
				const normalizedTradeType = tradeMessage.tradeType
					?.toString()
					.trim()
					.toUpperCase();

				if (normalizedTradeType === 'BUY') {
					buyVolume += tradeMessage.volume;
					console.log(
						`Added BUY volume: ${tradeMessage.volume}, Total buy volume: ${buyVolume}`,
					);
				} else if (normalizedTradeType === 'SELL') {
					sellVolume += tradeMessage.volume;
					console.log(
						`Added SELL volume: ${tradeMessage.volume}, Total sell volume: ${sellVolume}`,
					);
				} else {
					// Instead of throwing an error, log the issue and continue processing
					console.warn(
						`Unknown trade type: "${tradeMessage.tradeType}" (normalized: "${normalizedTradeType}")`,
					);
					console.warn('Full message:', JSON.stringify(tradeMessage, null, 2));
					// Don't throw an error - just skip this message
					return;
				}
			},
		});
		console.log('Kafka consumer started and listening for messages.');
	} catch (err) {
		console.error('Error starting Kafka consumer:', err);
	}
}

startConsumer();
