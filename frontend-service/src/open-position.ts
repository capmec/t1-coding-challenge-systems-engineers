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
				if (tradeMessage.tradeType === 'BUY') {
					buyVolume += tradeMessage.volume;
				} else if (tradeMessage.tradeType === 'SELL') {
					sellVolume += tradeMessage.volume;
				} else {
					throw new Error('Invalid trade type');
				}
			},
		});
		console.log('Kafka consumer started and listening for messages.');
	} catch (err) {
		console.error('Error starting Kafka consumer:', err);
	}
}

startConsumer();
