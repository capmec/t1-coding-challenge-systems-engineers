import { Kafka } from 'kafkajs';
import { StreamProcessor } from './StreamProcessor';
import { RawMarketMessage, RawTradeMessage } from './types';

type RawMessage = RawMarketMessage | RawTradeMessage;

const kafka = new Kafka({
	clientId: 'kafka-producer',
	brokers: ['kafka:9092'],
});

const producer = kafka.producer();

async function onMessage(message: RawMessage) {
	let topic: string = message.messageType;
	if (topic === 'market') topic = 'market-data';
	await producer.send({
		topic,
		messages: [{ value: JSON.stringify(message) }],
	});
}

async function fetchStreamAndProduce() {
	const response = await fetch(
		'https://t1-coding-challenge-9snjm.ondigitalocean.app/stream',
	);

	if (!response.ok) {
		console.error('Failed to fetch stream:', response.statusText);
		return;
	}

	if (!response.body) {
		console.error('Response body is null');
		return;
	}

	const streamProcessor = new StreamProcessor(onMessage);

	await streamProcessor.processStream(response.body);

	console.log('Streaming ended');
	await producer.disconnect();
}

async function run() {
	await producer.connect();
	console.log('Kafka Producer is ready');
	await fetchStreamAndProduce();
}

run().catch(console.error);
