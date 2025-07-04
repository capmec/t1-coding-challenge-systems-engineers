# Fullstack Developer Coding Challenge - Event-Driven Microservices

## Overview

This project implements a scalable, event-driven architecture using **Node.js**
and **TypeScript** for processing high-throughput financial market messages. The
system consists of two microservices that handle profit/loss calculations and
data streaming to a frontend application.

## Architecture

The system is built around two core microservices:

### 1. CalculationService

- **Purpose**: Calculates profit/loss for trading timeframes using market data
  and trade volumes
- **Scalability**: Runs multiple instances with Kafka consumer groups to ensure
  each message is processed only once
- **Data Flow**: Consumes from `market-data` and `trades` Kafka topics, stores
  results in MongoDB

### 2. FrontendService

- **Purpose**: Fetches calculated profit/loss data from the database and streams
  it to the frontend
- **Technology**: Next.js frontend with real-time data updates
- **API**: Provides REST endpoints for data retrieval

## Technology Stack

- **Backend**: Node.js, TypeScript
- **Message Broker**: Apache Kafka (using KafkaJS library)
- **Database**: MongoDB
- **Frontend**: Next.js, React
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 for production-ready process management

## Important Technical Notes

### Windows Compatibility

Due to compatibility issues with the `node-rdkafka` library on Windows systems,
this implementation uses **KafkaJS** where applicable. KafkaJS provides:

- Better Windows compatibility
- Pure JavaScript implementation (no native bindings)
- Excellent TypeScript support
- Robust consumer group management for scaling

This ensures the application runs reliably across different development
environments while maintaining the required functionality.

## Message Schemas

### Market Data Messages

```json
{
  "messageType": "market",
  "buyPrice": "-243.0",
  "sellPrice": "-186.0",
  "startTime": "2024-08-29T14:47:13.815Z",
  "endTime": "2024-08-29T14:47:16.820Z"
}
Trade Messages
json
Copy
Edit
{
  "messageType": "trades",
  "tradeType": "BUY",
  "volume": "0.2",
  "time": "2024-01-01T19:00:00.000+00:00"
}
Prerequisites
Ensure the following are installed:

Node.js (v18 or higher)

Docker and Docker Compose

npm or yarn

Git

Quick Start
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/capmec/t1-coding-challenge-systems-engineers.git
cd t1-coding-challenge-systems-engineers
2. Install Dependencies
bash
Copy
Edit
cd calculation-service
npm install
cd ../frontend-service
npm install
cd ..
3. Start the System
bash
Copy
Edit
docker-compose up -d --build
This starts:

Kafka and Zookeeper

MongoDB

Calculation service instances

Frontend service

Kafka producer for sample data

4. Access the Application
Frontend: http://localhost:3000

MongoDB: localhost:27017

Kafka: localhost:9092

Project Structure
graphql
Copy
Edit
├── calculation-service/          # Profit/Loss calculation microservice
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend-service/             # Frontend and API service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── kafka-producer/               # Sample data generator
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml            # Service orchestration
└── package.json                  # Root package configuration
Key Features
Scalability
Multiple CalculationService instances with Kafka consumer groups

Load distribution ensures no duplicate processing

Horizontal scaling is straightforward

Fault Tolerance
Automatic Kafka partition rebalancing

Persistent results in MongoDB

Error handling and logging throughout

Real-time Processing
Event-driven architecture for low-latency updates

Live profit/loss updates to frontend

High throughput optimized for large message volumes

Development
Tests
bash
Copy
Edit
# Run tests for a specific service
cd calculation-service
npm test
Debugging
bash
Copy
Edit
DEBUG=* npm start
Code Quality
bash
Copy
Edit
npm run lint
npm run format
npm run type-check
Monitoring
Health Checks
Calculation Service: http://localhost:3001/health

Frontend Service: http://localhost:3000/api/health

Logs
bash
Copy
Edit
docker-compose logs -f
docker-compose logs -f calculation-service
Troubleshooting
Port Conflicts
Modify ports in docker-compose.yml if needed:

yaml
Copy
Edit
ports:
  - "3001:3000"
Kafka Connection Issues
Ensure containers are running: docker-compose ps

Check logs: docker-compose logs kafka

Database Connection Issues
Confirm MongoDB is running: docker-compose ps

Verify connection strings

Contributing
Fork the repo

Create a feature branch: git checkout -b feature/new-feature

Commit changes

Push and open a PR

License
This project is licensed under the MIT License.

Support
For questions:

Check Troubleshooting

Review GitHub issues

Contact @capmec
```
