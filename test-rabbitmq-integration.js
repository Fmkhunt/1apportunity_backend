const amqp = require('amqplib');

async function testRabbitMQConnection() {
  try {
    console.log('Testing RabbitMQ connection...');
    
    // Connect to RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
    const channel = await connection.createChannel();
    
    console.log('✅ Connected to RabbitMQ successfully');
    
    // Test exchange and queue creation
    const exchange = 'task_completion_exchange';
    const queue = 'wallet_credit_queue';
    
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, 'wallet.credit');
    
    console.log('✅ Exchange and queue created successfully');
    
    // Test message publishing
    const testMessage = {
      userId: 'test-user-123',
      huntId: 'test-hunt-456',
      taskId: 'test-task-789',
      amount: 100,
      rank: 1,
      timestamp: new Date()
    };
    
    const published = channel.publish(
      exchange,
      'wallet.credit',
      Buffer.from(JSON.stringify(testMessage)),
      { persistent: true }
    );
    
    if (published) {
      console.log('✅ Test message published successfully');
    } else {
      console.log('❌ Failed to publish test message');
    }
    
    // Test message consumption
    let messageReceived = false;
    
    await channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        console.log('✅ Test message received:', content);
        channel.ack(msg);
        messageReceived = true;
      }
    });
    
    // Wait a bit for message processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (messageReceived) {
      console.log('✅ Message consumption test passed');
    } else {
      console.log('❌ Message consumption test failed');
    }
    
    // Cleanup
    await channel.close();
    await connection.close();
    
    console.log('✅ RabbitMQ integration test completed successfully');
    
  } catch (error) {
    console.error('❌ RabbitMQ integration test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testRabbitMQConnection();