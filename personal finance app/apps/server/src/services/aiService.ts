import OpenAI from 'openai';
import { DEFAULT_CATEGORIES } from '@budget-tracker/shared-types';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorizeRequest {
  merchant: string;
  amount_cents: number;
  description?: string;
}

export interface CategorizeResponse {
  category: string;
  confidence: number;
  reasoning?: string;
}

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async categorizeTransaction(request: CategorizeRequest): Promise<CategorizeResponse> {
    try {
      const amount = request.amount_cents / 100;
      const prompt = this.buildPrompt(request.merchant, amount, request.description);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a financial categorization expert. Your job is to categorize transactions based on merchant name, amount, and description. 

Available categories: ${DEFAULT_CATEGORIES.join(', ')}

Respond with a JSON object containing:
- category: one of the available categories
- confidence: a number between 0 and 1 representing your confidence
- reasoning: brief explanation of your choice

Be consistent with similar merchants. Consider typical spending patterns.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 150,
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(responseText);
      
      if (!DEFAULT_CATEGORIES.includes(parsed.category)) {
        logger.warn(`AI returned invalid category: ${parsed.category}, defaulting to Other`);
        parsed.category = 'Other';
        parsed.confidence = 0.5;
      }

      return {
        category: parsed.category,
        confidence: Math.min(Math.max(parsed.confidence, 0), 1),
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      logger.error('AI categorization failed:', error);
      
      const fallbackCategory = this.getFallbackCategory(request.merchant);
      return {
        category: fallbackCategory,
        confidence: 0.3,
        reasoning: 'Fallback categorization due to AI service error',
      };
    }
  }

  private buildPrompt(merchant: string, amount: number, description?: string): string {
    let prompt = `Categorize this transaction:
Merchant: ${merchant}
Amount: $${amount.toFixed(2)}`;

    if (description) {
      prompt += `\nDescription: ${description}`;
    }

    return prompt;
  }

  private getFallbackCategory(merchant: string): string {
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('grocery') || merchantLower.includes('supermarket') || 
        merchantLower.includes('restaurant') || merchantLower.includes('cafe') ||
        merchantLower.includes('food') || merchantLower.includes('pizza') ||
        merchantLower.includes('mcdonald') || merchantLower.includes('subway')) {
      return 'Food';
    }
    
    if (merchantLower.includes('gas') || merchantLower.includes('fuel') ||
        merchantLower.includes('uber') || merchantLower.includes('lyft') ||
        merchantLower.includes('taxi') || merchantLower.includes('transport')) {
      return 'Transport';
    }
    
    if (merchantLower.includes('amazon') || merchantLower.includes('target') ||
        merchantLower.includes('walmart') || merchantLower.includes('shop') ||
        merchantLower.includes('store')) {
      return 'Shopping';
    }
    
    if (merchantLower.includes('netflix') || merchantLower.includes('spotify') ||
        merchantLower.includes('movie') || merchantLower.includes('theater') ||
        merchantLower.includes('entertainment')) {
      return 'Entertainment';
    }
    
    if (merchantLower.includes('electric') || merchantLower.includes('water') ||
        merchantLower.includes('internet') || merchantLower.includes('phone') ||
        merchantLower.includes('utility') || merchantLower.includes('bill')) {
      return 'Bills';
    }
    
    if (merchantLower.includes('hospital') || merchantLower.includes('pharmacy') ||
        merchantLower.includes('doctor') || merchantLower.includes('health') ||
        merchantLower.includes('medical')) {
      return 'Healthcare';
    }
    
    return 'Other';
  }
}