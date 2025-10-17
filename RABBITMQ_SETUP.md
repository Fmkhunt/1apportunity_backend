# RabbitMQ Integration Setup

This document explains how to set up RabbitMQ integration for wallet credit functionality between hunt-service and wallet-service.

## Overview

When a user completes a task in the hunt-service, the system automatically credits the reward amount to their wallet in the wallet-service via RabbitMQ messaging.

## Architecture

```
hunt-service (Publisher) → RabbitMQ → wallet-service (Consumer)
```

1. **hunt-service**: Publishes wallet credit messages when tasks are completed
2. **RabbitMQ**: Message broker that handles message queuing and delivery
3. **wallet-service**: Consumes messages and credits the wallet

## Setup Instructions

### 1. Start RabbitMQ Server

#### Option A: Using Docker Compose (Recommended)
```bash
# Start RabbitMQ server
docker-compose -f docker-compose.rabbitmq.yml up -d

# Check if RabbitMQ is running
docker-compose -f docker-compose.rabbitmq.yml ps
```

#### Option B: Using Docker directly
```bash
docker run -d --name rabbitmq-server \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3.12-management
```

#### Option C: Install RabbitMQ locally
Follow the official RabbitMQ installation guide for your operating system.

### 2. Environment Configuration

Add the following environment variables to your `.env` files:

#### hunt-service/.env
```env
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
```

#### wallet-service/.env
```env
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
```

### 3. Start the Services

```bash
# Start hunt-service
cd hunt-service
npm run dev

# Start wallet-service (in another terminal)
cd wallet-service
npm run dev
```

## Message Flow

### 1. Task Completion
When a user completes a task in hunt-service:

1. Task completion is recorded in the database
2. If the task has a reward > 0, a wallet credit message is published to RabbitMQ
3. The message includes:
   - `userId`: User who completed the task
   - `huntId`: Hunt ID
   - `taskId`: Task ID
   - `amount`: Reward amount
   - `rank`: User's rank for this task
   - `claimId`: Optional claim ID
   - `timestamp`: When the task was completed

### 2. Wallet Credit Processing
The wallet-service consumer:

1. Receives the wallet credit message
2. Creates a credit transaction in the wallet table
3. Logs the transaction details
4. Acknowledges the message

## Monitoring

### RabbitMQ Management UI
Access the RabbitMQ Management UI at: http://localhost:15672

- Username: `admin`
- Password: `admin123`

You can monitor:
- Queue status and message counts
- Message flow
- Connection status
- Performance metrics

### Logs
Both services log RabbitMQ-related activities:

- Connection status
- Message publishing/consuming
- Errors and retries

## Error Handling

### Retry Mechanism
- hunt-service retries message publishing up to 3 times with exponential backoff
- If publishing fails, the task completion still succeeds (message can be retried later)

### Message Acknowledgment
- wallet-service only acknowledges messages after successful processing
- Failed messages are requeued for retry

### Graceful Degradation
- Services continue to work even if RabbitMQ is unavailable
- Task completion works without wallet crediting if RabbitMQ is down

## Testing

### 1. Test Task Completion
```bash
# Complete a task via API
curl -X POST http://localhost:3002/api/tasks/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "huntId": "hunt-id",
    "taskId": "task-id",
    "answers": []
  }'
```

### 2. Check Wallet Balance
```bash
# Check user's wallet balance
curl -X GET http://localhost:3003/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Monitor Messages
Check the RabbitMQ Management UI to see message flow and queue status.

## Troubleshooting

### Common Issues

1. **RabbitMQ Connection Failed**
   - Check if RabbitMQ server is running
   - Verify connection URL and credentials
   - Check network connectivity

2. **Messages Not Being Processed**
   - Check wallet-service logs for errors
   - Verify queue exists and is bound to exchange
   - Check message format and validation

3. **Duplicate Credits**
   - Ensure proper message acknowledgment
   - Check for duplicate task completions
   - Verify idempotency in wallet service

### Debug Commands

```bash
# Check RabbitMQ status
docker-compose -f docker-compose.rabbitmq.yml logs rabbitmq

# Check service logs
cd hunt-service && npm run dev
cd wallet-service && npm run dev

# Test RabbitMQ connection
docker exec -it rabbitmq-server rabbitmq-diagnostics ping
```

## Production Considerations

1. **Security**: Change default RabbitMQ credentials
2. **Persistence**: Configure RabbitMQ for data persistence
3. **Clustering**: Set up RabbitMQ cluster for high availability
4. **Monitoring**: Implement proper monitoring and alerting
5. **Backup**: Regular backup of RabbitMQ data
6. **SSL/TLS**: Enable SSL/TLS for secure connections
7. **Resource Limits**: Configure appropriate memory and disk limits

## API Endpoints

### hunt-service
- `POST /api/tasks/complete` - Complete a task (triggers wallet credit)

### wallet-service
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history