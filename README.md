# Fullstack Developer Coding Challenge - Event-Driven Microservices

## Overview

This project implements a scalable, event-driven architecture using **Node.js**
and **TypeScript** to process high-throughput financial market messages. It
consists of microservices that handle real-time profit/loss calculations and
data streaming to a frontend application.

---

## Architecture

### 1. Calculation Service

- **Purpose:** Calculates profit/loss for trading timeframes using market data
  and trade volumes
- **Scalability:** Runs multiple instances with Kafka consumer groups to ensure
  each message is processed only once
- **Data Flow:** Consumes messages from `market-data` and `trades` Kafka topics,
  stores results in MongoDB

### 2. Frontend Service

- **Purpose:** Fetches calculated profit/loss data from the database and streams
  it to the frontend
- **Technology:** Next.js frontend with real-time data updates
- **API:** Provides REST endpoints and server-sent events for live data
  streaming

---

## Technology Stack

- **Backend:** Node.js, TypeScript
- **Message Broker:** Apache Kafka (using KafkaJS library)
- **Database:** MongoDB
- **Frontend:** Next.js, React
- **Containerization:** Docker & Docker Compose
- **Process Management:** PM2

---

## Windows Compatibility

Due to known compatibility issues with the `node-rdkafka` library on Windows,
this implementation uses **KafkaJS** where applicable:

✅ Better Windows compatibility ✅ Pure JavaScript implementation ✅ Excellent
TypeScript support ✅ Robust consumer group management

---

## Message Schemas

### Market Data Message

```json
{
	"messageType": "market",
	"buyPrice": "-243.0",
	"sellPrice": "-186.0",
	"startTime": "2024-08-29T14:47:13.815Z",
	"endTime": "2024-08-29T14:47:16.820Z"
}
```

### Trade Message

```json
{
	"messageType": "trades",
	"tradeType": "BUY",
	"volume": "0.2",
	"time": "2024-01-01T19:00:00.000Z"
}
```

---

## Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- npm or yarn
- Git

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/capmec/t1-coding-challenge-systems-engineers.git
cd t1-coding-challenge-systems-engineers
```

### 2. Install Dependencies

```bash
cd calculation-service
npm install
cd ../frontend-service
npm install
cd ..
```

### 3. Start the System

```bash
docker-compose up -d --build
```

### 4. Kafka Setup

```bash
npm run kafka:setup
```

---

## Access the Application

- Frontend: [http://localhost:3000](http://localhost:3000)
- MongoDB: `localhost:27017`
- Kafka: `localhost:9092`

---

## Project Structure

```
├── calculation-service/      # Profit/Loss calculation microservice
├── frontend-service/         # Frontend and API service
├── kafka-producer/           # Sample data generator
├── docker-compose.yml        # Service orchestration
└── package.json              # Root configuration
```

---

## Key Features

### Scalability

- Multiple calculation-service instances with Kafka consumer groups
- Load distribution prevents duplicate processing
- Easy horizontal scaling

### Fault Tolerance

- Automatic Kafka partition rebalancing
- Persistent data storage in MongoDB
- Comprehensive error handling and logging

### Real-Time Processing

- Event-driven architecture for low-latency updates
- Live profit/loss updates to frontend
- High throughput optimized for large message volumes

---

## Development

### Run Tests

```bash
cd calculation-service
npm test
```

### Debugging

```bash
DEBUG=* npm start
```

### Code Quality

```bash
npm run lint
npm run format
npm run type-check
```

---

## Monitoring & Logs

### Health Checks

- Calculation Service:
  [http://localhost:3001/health](http://localhost:3001/health)
- Frontend Service:
  [http://localhost:3000/api/health](http://localhost:3000/api/health)

### Logs

```bash
docker-compose logs -f
docker-compose logs -f calculation-service
```

---

## Troubleshooting

### Port Conflicts

Modify `docker-compose.yml` ports if needed:

```yaml
ports:
  - '3001:3000'
```

### Kafka Issues

```bash
docker-compose ps
docker-compose logs kafka
```

### MongoDB Issues

```bash
docker-compose ps
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

MIT License

---

## Support

For questions:

- Check Troubleshooting
- Review GitHub Issues
- Contact the capmec@gmail.com
