import { RabbitMQConnection, rabbitMQConfig } from '../config/rabbitmq';
import { AppError } from '../utils/AppError';

export interface WalletCreditMessage {
  userId: string;
  huntId: string;
  taskId: string;
  amount: number;
  rank: number;
  claimId?: string;
  timestamp: Date;
  taskName: string;
  huntName: string;
}

export interface WalletTokenDebitMessage {
  userId: string;
  clueId: string;
  token: number;
  description?: string;
  timestamp: Date;
}

export class MessagePublisherService {
  /**
   * Publish wallet credit message
   */
  static async publishWalletCredit(message: WalletCreditMessage): Promise<void> {
    try {
      const channel = await RabbitMQConnection.connect();
      
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = channel.publish(
        rabbitMQConfig.exchange,
        'wallet.credit',
        messageBuffer,
        {
          persistent: true,
          timestamp: Date.now(),
          messageId: `${message.userId}-${message.taskId}-${Date.now()}`,
        }
      );

      if (!published) {
        throw new AppError('Failed to publish message to RabbitMQ', 500);
      }

      console.log('Wallet credit message published:', {
        userId: message.userId,
        taskId: message.taskId,
        amount: message.amount,
        rank: message.rank,
        taskName: message.taskName,
        huntName: message.huntName,
      });
    } catch (error) {
      console.error('Error publishing wallet credit message:', error);
      throw new AppError('Failed to publish wallet credit message', 500);
    }
  }

  /**
   * Publish message with retry mechanism
   */
  static async publishWithRetry(
    message: WalletCreditMessage,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.publishWalletCredit(message);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new AppError(
      `Failed to publish message after ${maxRetries} attempts: ${lastError?.message}`,
      500
    );
  }
  
  /**
   * Publish token debit for clue purchase
   */
  static async publishWalletTokenDebit(message: WalletTokenDebitMessage): Promise<void> {
    try {
      const channel = await RabbitMQConnection.connect();
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const published = channel.publish(
        rabbitMQConfig.exchange,
        'wallet.token.debit',
        messageBuffer,
        {
          persistent: true,
          timestamp: Date.now(),
          messageId: `${message.userId}-${message.clueId}-${Date.now()}`,
        }
      );
      if (!published) {
        throw new AppError('Failed to publish token debit message to RabbitMQ', 500);
      }
      console.log('Wallet token debit message published:', {
        userId: message.userId,
        clueId: message.clueId,
        token: message.token,
      });
    } catch (error) {
      console.error('Error publishing wallet token debit message:', error);
      throw new AppError('Failed to publish wallet token debit message', 500);
    }
  }
}