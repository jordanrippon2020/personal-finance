export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  merchant: string;
  amount_cents: number;
  category: string;
  date: string;
  description: string | null;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRule {
  id: string;
  user_id: string;
  merchant: string;
  category: string;
  confidence: number;
  usage_count: number;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  preferred_categories: string[];
  notification_preferences: {
    email_enabled: boolean;
    push_enabled: boolean;
    anomaly_detection: boolean;
    weekly_summary: boolean;
  };
  theme_preferences: {
    mode: 'light' | 'dark';
    accent_color: string;
  };
  created_at: string;
  updated_at: string;
}

export const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Other'
] as const;

export type Category = typeof DEFAULT_CATEGORIES[number];

// Supabase Database type definition
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
      };
      category_rules: {
        Row: CategoryRule;
        Insert: Omit<CategoryRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CategoryRule, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}