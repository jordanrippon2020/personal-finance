-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  category VARCHAR(50) NOT NULL DEFAULT 'Other',
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  description TEXT,
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_rules table for learning system
CREATE TABLE category_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, merchant)
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  preferred_categories JSONB DEFAULT '["Food","Transport","Shopping","Entertainment","Bills","Healthcare","Other"]'::jsonb,
  notification_preferences JSONB DEFAULT '{
    "email_enabled": true,
    "push_enabled": true,
    "anomaly_detection": true,
    "weekly_summary": true
  }'::jsonb,
  theme_preferences JSONB DEFAULT '{
    "mode": "dark",
    "accent_color": "#8B5CF6"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_merchant ON transactions(merchant);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

CREATE INDEX idx_category_rules_user_id ON category_rules(user_id);
CREATE INDEX idx_category_rules_merchant ON category_rules(merchant);
CREATE INDEX idx_category_rules_user_merchant ON category_rules(user_id, merchant);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_rules_updated_at BEFORE UPDATE ON category_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for transactions table
CREATE POLICY "Users can only see their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for category_rules table
CREATE POLICY "Users can only see their own category rules" ON category_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own category rules" ON category_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own category rules" ON category_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own category rules" ON category_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_settings table
CREATE POLICY "Users can only see their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create view for transaction analytics
CREATE VIEW transaction_analytics AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  category,
  COUNT(*) as transaction_count,
  SUM(amount_cents) as total_amount_cents,
  AVG(amount_cents) as avg_amount_cents,
  MIN(amount_cents) as min_amount_cents,
  MAX(amount_cents) as max_amount_cents
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), category;

-- Grant permissions on the view
GRANT SELECT ON transaction_analytics TO authenticated;