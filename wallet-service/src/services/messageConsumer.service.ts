import { RabbitMQConnection, rabbitMQConfig } from '../config/rabbitmq';
import { WalletService } from './wallet.service';
import { AppError } from '../utils/AppError';

export interface WalletCreditMessage {
  userId: string;
  huntId: string;
  taskId: string;
  taskName: string;
  huntName: string;
  amount: number;
  rank: number;
  claimId?: string;
  timestamp: Date;
}

export class MessageConsumerService {
  private static isConsuming = false;

  /**
   * Start consuming wallet credit messages
   */
  static async startConsuming(): Promise<void> {
    if (this.isConsuming) {
      console.log('Message consumer is already running');
      return;
    }

    try {
      const channel = await RabbitMQConnection.connect();
      this.isConsuming = true;

      console.log('Starting wallet credit message consumer...');

      await channel.consume(
        rabbitMQConfig.queues.walletCredit,
        async (message) => {
          if (!message) {
            return;
          }

          try {
            const content = message.content.toString();
            const walletCreditMessage: WalletCreditMessage = JSON.parse(content);

            console.log('Processing wallet credit message:', {
              userId: walletCreditMessage.userId,
              taskId: walletCreditMessage.taskId,
              amount: walletCreditMessage.amount,
              rank: walletCreditMessage.rank,
            });

            // Process the wallet credit
            await this.processWalletCredit(walletCreditMessage);

            // Acknowledge the message
            channel.ack(message);
            console.log('Wallet credit message processed successfully');

          } catch (error) {
            console.error('Error processing wallet credit message:', error);
            
            // Reject the message and requeue it
            channel.nack(message, false, true);
            
            // Log the error for monitoring
            console.error('Message requeued due to processing error:', error);
          }
        },
        {
          noAck: false, // Manual acknowledgment
        }
      );

      console.log('Wallet credit message consumer started successfully');

    } catch (error) {
      this.isConsuming = false;
      console.error('Failed to start message consumer:', error);
      throw error;
    }
  }

  /**
   * Process wallet credit message
   */
  private static async processWalletCredit(message: WalletCreditMessage): Promise<void> {
    try {
      // Credit the amount to the user's wallet
      await WalletService.credit({
        wallet_id: message.userId, // This is the user ID
        amount: message.amount,
        description: `Task completion reward - Hunt: ${message.huntName}, Task: ${message.taskName}, Rank: ${message.rank}`,
        reference_type: 'task_completion',
        reference_id: message.taskId,
        created_by: 'system',
      });

      console.log(`Successfully credited ${message.amount} coins to user ${message.userId} for task completion`);

    } catch (error) {
      console.error('Error processing wallet credit:', error);
      throw new AppError(`Failed to process wallet credit: ${error.message}`, 500);
    }
  }

  /**
   * Stop consuming messages
   */
  static async stopConsuming(): Promise<void> {
    this.isConsuming = false;
    console.log('Stopping wallet credit message consumer...');
  }

  /**
   * Check if consumer is running
   */
  static isRunning(): boolean {
    return this.isConsuming;
  }
}