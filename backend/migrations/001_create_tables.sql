-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  market_cap BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fund net buy data table
CREATE TABLE IF NOT EXISTS fund_net_buy (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  buy_amount BIGINT,
  buy_shares BIGINT,
  sell_amount BIGINT,
  sell_shares BIGINT,
  net_buy_amount BIGINT,
  open_price DECIMAL(10, 2),
  close_price DECIMAL(10, 2),
  high_price DECIMAL(10, 2),
  low_price DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  change_amount DECIMAL(10, 2),
  rank INT,
  volume BIGINT,
  turnover DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, symbol)
);

-- Create price history table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  open_price DECIMAL(10, 2),
  close_price DECIMAL(10, 2),
  high_price DECIMAL(10, 2),
  low_price DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  turnover DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stock_id, date)
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  phone VARCHAR(20),
  symbol VARCHAR(10),
  subscription_type VARCHAR(50) DEFAULT 'all', -- 'all' or specific symbol
  threshold_change DECIMAL(5, 2),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crawler logs table
CREATE TABLE IF NOT EXISTS crawler_logs (
  id SERIAL PRIMARY KEY,
  date DATE,
  status VARCHAR(50),
  message TEXT,
  items_count INT,
  error_message TEXT,
  execution_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CSV exports table
CREATE TABLE IF NOT EXISTS csv_exports (
  id SERIAL PRIMARY KEY,
  file_path VARCHAR(500),
  date DATE,
  rows_count INT,
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_fund_net_buy_date ON fund_net_buy(date DESC);
CREATE INDEX IF NOT EXISTS idx_fund_net_buy_symbol ON fund_net_buy(symbol);
CREATE INDEX IF NOT EXISTS idx_fund_net_buy_rank ON fund_net_buy(rank);
CREATE INDEX IF NOT EXISTS idx_fund_net_buy_stock_id ON fund_net_buy(stock_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_stock_id ON price_history(stock_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON user_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_symbol ON user_subscriptions(symbol);
CREATE INDEX IF NOT EXISTS idx_crawler_logs_date ON crawler_logs(date DESC);

-- Create view for top 30 stocks
CREATE OR REPLACE VIEW v_top30_stocks AS
SELECT
  fnb.id,
  fnb.date,
  fnb.symbol,
  fnb.name,
  fnb.buy_amount,
  fnb.buy_shares,
  fnb.close_price,
  fnb.change_percent,
  fnb.rank,
  fnb.volume,
  fnb.turnover,
  s.industry,
  fnb.created_at
FROM fund_net_buy fnb
LEFT JOIN stocks s ON fnb.stock_id = s.id
WHERE fnb.rank <= 30
ORDER BY fnb.date DESC, fnb.rank ASC;
