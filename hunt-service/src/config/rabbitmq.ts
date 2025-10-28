import * as amqp from 'amqplib';

export interface RabbitMQConfig {
  url: string;
  exchange: string;
  queues: {
    walletCredit: string;
    tokenDebit: string;
  };
}

export const rabbitMQConfig: RabbitMQConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  exchange: 'task_completion_exchange',
  queues: {
    walletCredit: 'wallet_credit_queue',
    tokenDebit: 'wallet_token_debit_queue',
  },
};

export class RabbitMQConnection {
  private static connection: any = null;
  private static channel: any = null;

  static async connect(): Promise<any> {
    try {
      if (!this.connection) {
        console.log('Connecting to RabbitMQ...');
        this.connection = await amqp.connect(rabbitMQConfig.url);
        
        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.connection = null;
          this.channel = null;
        });

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed');
          this.connection = null;
          this.channel = null;
        });
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
        
        // Assert exchange
        await this.channel.assertExchange(rabbitMQConfig.exchange, 'direct', {
          durable: true,
        });

        // Assert queues
        await this.channel.assertQueue(rabbitMQConfig.queues.walletCredit, {
          durable: true,
        });
        await this.channel.assertQueue(rabbitMQConfig.queues.tokenDebit, {
          durable: true,
        });

        // Bind queues to exchange
        await this.channel.bindQueue(
          rabbitMQConfig.queues.walletCredit,
          rabbitMQConfig.exchange,
          'wallet.credit'
        );
        await this.channel.bindQueue(
          rabbitMQConfig.queues.tokenDebit,
          rabbitMQConfig.exchange,
          'wallet.token.debit'
        );

        console.log('RabbitMQ connected and configured');
      }

      return this.channel;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  static async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  static getChannel(): any {
    return this.channel;
  }
}