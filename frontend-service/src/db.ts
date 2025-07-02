// YOUR CODE HERE

import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = 'mongodb://t1-coding-challenge-database:27017';

let client: MongoClient;
let db: Db;

/**
 * Connects to MongoDB and reuses the connection
 */
export async function connectToDatabase(): Promise<Db> {
	if (db) return db;

	client = new MongoClient(mongoUri);
	await client.connect();
	db = client.db('calculations');

	console.log('Connected to MongoDB (frontend-service)');
	return db;
}
