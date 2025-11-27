import { db } from '../config/database';
import { questionsTable } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import { TCreateQuestionData, TQuestion } from '../types';

export class QuestionService {
  /**
   * Create a new question
   */
  static async create(questionData: TCreateQuestionData): Promise<TQuestion> {
    try {
      const [newQuestion] = await db
        .insert(questionsTable)
        .values({
          ...questionData,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return newQuestion as TQuestion;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Create multiple questions for a task
   */
  static async createMultiple(questionsData: TCreateQuestionData[]): Promise<TQuestion[]> {
    try {
      const questionsToInsert = questionsData.map(question => ({
        ...question,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const newQuestions = await db
        .insert(questionsTable)
        .values(questionsToInsert)
        .returning();

      return newQuestions as TQuestion[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get questions by task ID
   */
  static async getByTaskId(taskId: string): Promise<TQuestion[]> {
    try {
      const questions = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.task_id, taskId));

      return questions as TQuestion[];
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Get question by ID
   */
  static async getById(questionId: string): Promise<TQuestion | null> {
    try {
      const question = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.id, questionId))
        .limit(1);

      return question[0] as TQuestion || null;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Update question by ID
   */
  static async update(questionId: string, updateData: Partial<TCreateQuestionData>): Promise<TQuestion> {
    try {
      const existingQuestion = await this.getById(questionId);
      if (!existingQuestion) {
        throw new AppError('Question not found', 404);
      }

      const [updatedQuestion] = await db
        .update(questionsTable)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(questionsTable.id, questionId))
        .returning();

      return updatedQuestion as TQuestion;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Delete question by ID
   */
  static async delete(questionId: string): Promise<void> {
    try {
      const existingQuestion = await this.getById(questionId);
      if (!existingQuestion) {
        throw new AppError('Question not found', 404);
      }

      await db
        .delete(questionsTable)
        .where(eq(questionsTable.id, questionId));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Delete all questions for a task
   */
  static async deleteByTaskId(taskId: string): Promise<void> {
    try {
      await db
        .delete(questionsTable)
        .where(eq(questionsTable.task_id, taskId));
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }
  /**
   * Verify answers and return counts of correct and wrong answers
   */
  static async verifyAnswer(taskId: string, answers: { question_id: string, answer: string }[]): Promise<{
    correctCount: number;
    wrongCount: number;
    isAllCorrect: boolean;
    totalQuestions: number;
    percentage: number;
    isPass: boolean;
  }> {
    try {
      // fetch questions from db
      const questions = await db
        .select()
        .from(questionsTable)
        .where(
          eq(questionsTable.task_id, taskId)
        )

      // create a map for quick lookup
      const questionMap = new Map(
        questions.map(q => [q.id, q.answer])
      );

      // verify answers and count correct/wrong
      let correctCount = 0;
      let wrongCount = 0;

      answers.forEach(ans => {
        const correctAnswer = questionMap.get(ans.question_id);
        if (correctAnswer !== undefined && correctAnswer === ans.answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      });

      const isAllCorrect = wrongCount === 0 && correctCount === questions.length;

      return {
        correctCount,
        wrongCount,
        isAllCorrect,
        totalQuestions: questions.length,
        percentage: (correctCount / questions.length) * 100,
        isPass: (correctCount / questions.length) * 100 >= 49.9 ? true : false,
      };
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }
}