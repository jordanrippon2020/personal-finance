import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';
import {
  ApiResponse,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionWithPagination,
  CategorizeTransactionResponse,
  DEFAULT_CATEGORIES,
} from '@budget-tracker/shared-types';

const router = Router();
const aiService = AIService.getInstance();

// Validation schemas
const createTransactionSchema = z.object({
  merchant: z.string().min(1).max(255),
  amount_cents: z.number().int().positive(),
  date: z.string().datetime(),
  description: z.string().optional(),
});

const updateTransactionSchema = z.object({
  merchant: z.string().min(1).max(255).optional(),
  amount_cents: z.number().int().positive().optional(),
  category: z.enum(DEFAULT_CATEGORIES as any).optional(),
  date: z.string().datetime().optional(),
  description: z.string().optional(),
});

// GET /api/transactions - List transactions with pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to fetch transactions:', error);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch transactions',
        },
      });
    }

    const response: ApiResponse<TransactionWithPagination> = {
      success: true,
      data: {
        transactions: transactions as Transaction[],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    // Get AI categorization
    const aiResult = await aiService.categorizeTransaction({
      merchant: validatedData.merchant,
      amount_cents: validatedData.amount_cents,
      description: validatedData.description,
    });

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: req.user!.id,
        merchant: validatedData.merchant,
        amount_cents: validatedData.amount_cents,
        category: aiResult.category,
        date: validatedData.date,
        description: validatedData.description,
        ai_confidence: aiResult.confidence,
      }])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create transaction:', error);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to create transaction',
        },
      });
    }

    const response: ApiResponse<Transaction> = {
      success: true,
      data: transaction as Transaction,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
      });
    }

    logger.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = updateTransactionSchema.parse(req.body);
    const transactionId = req.params.id;

    // Check if transaction belongs to user
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError || !existingTransaction) {
      return res.status(404).json({
        success: false,
        error: {
          error: 'NOT_FOUND',
          message: 'Transaction not found',
        },
      });
    }

    // If category was manually changed, create/update learning rule
    if (validatedData.category && validatedData.category !== existingTransaction.category) {
      await updateCategoryRule(req.user!.id, existingTransaction.merchant, validatedData.category);
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(validatedData)
      .eq('id', transactionId)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update transaction:', error);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to update transaction',
        },
      });
    }

    const response: ApiResponse<Transaction> = {
      success: true,
      data: transaction as Transaction,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
        },
      });
    }

    logger.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const transactionId = req.params.id;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', req.user!.id);

    if (error) {
      logger.error('Failed to delete transaction:', error);
      return res.status(500).json({
        success: false,
        error: {
          error: 'DATABASE_ERROR',
          message: 'Failed to delete transaction',
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// POST /api/transactions/categorize - Get AI categorization for transaction
router.post('/categorize', async (req: AuthenticatedRequest, res) => {
  try {
    const { merchant, amount_cents, description } = req.body;

    if (!merchant || !amount_cents) {
      return res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'Merchant and amount_cents are required',
        },
      });
    }

    // Check if we have a learning rule for this merchant
    const { data: rule } = await supabase
      .from('category_rules')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('merchant', merchant)
      .single();

    let result: CategorizeTransactionResponse;

    if (rule && rule.confidence > 0.8) {
      // Use learned rule
      result = {
        category: rule.category,
        confidence: rule.confidence,
        source: 'rule',
        rule_used: rule,
      };

      // Update usage count
      await supabase
        .from('category_rules')
        .update({
          usage_count: rule.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', rule.id);
    } else {
      // Use AI
      const aiResult = await aiService.categorizeTransaction({
        merchant,
        amount_cents,
        description,
      });

      result = {
        category: aiResult.category,
        confidence: aiResult.confidence,
        source: 'ai',
      };
    }

    const response: ApiResponse<CategorizeTransactionResponse> = {
      success: true,
      data: result,
    };

    res.json(response);
  } catch (error) {
    logger.error('Categorize transaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  }
});

// Helper function to update category learning rules
async function updateCategoryRule(userId: string, merchant: string, category: string) {
  try {
    const { data: existingRule } = await supabase
      .from('category_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('merchant', merchant)
      .single();

    if (existingRule) {
      // Update existing rule
      const newConfidence = Math.min(existingRule.confidence + 0.1, 0.95);
      await supabase
        .from('category_rules')
        .update({
          category,
          confidence: newConfidence,
          usage_count: existingRule.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', existingRule.id);
    } else {
      // Create new rule
      await supabase
        .from('category_rules')
        .insert([{
          user_id: userId,
          merchant,
          category,
          confidence: 0.7,
          usage_count: 1,
          last_used: new Date().toISOString(),
        }]);
    }
  } catch (error) {
    logger.error('Failed to update category rule:', error);
  }
}

export default router;