-- ============================================================================
-- Prefill Script for Assets Portfolio Manager
-- ============================================================================
-- This script populates the database with sample data for testing purposes.
-- Assumes user id 1 already exists.
-- ============================================================================
-- Disable foreign keys check during import for safety
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ============================================================================
-- 1. PORTFOLIOS
-- ============================================================================
-- 401(k) Retirement Account
INSERT INTO
  portfolios (user_id, name, description)
VALUES
  (
    1,
    '401(k) Retirement',
    'Employer-sponsored retirement account with traditional and Roth options'
  ),
  (
    1,
    'Stocks & Shares ISA',
    'UK tax-wrapped individual savings account'
  ),
  (
    1,
    'Crypto Trading',
    'Cryptocurrency investment and trading portfolio'
  ),
  (
    1,
    'Cash ISA',
    'UK cash ISA for conservative savings and income bonds'
  );

-- ============================================================================
-- 3. ASSETS
-- ============================================================================
-- --- 401(k) Retirement Assets (Portfolio 1) ---
INSERT INTO
  assets (portfolio_id, ticker, name)
VALUES
  (1, 'VOO', 'Vanguard S&P 500 ETF'),
  (
    1,
    'VTSAX',
    'Vanguard Total Stock Market Index Admiral'
  ),
  (
    1,
    'VTIAX',
    'Vanguard Total International Stock Index Admiral'
  ),
  (
    1,
    'VBTLX',
    'Vanguard Total Bond Market Index Admiral'
  ),
  (1, 'MSFT', 'Microsoft Corporation'),
  (1, 'NVDA', 'NVIDIA Corporation'),
  (2, 'VUSA.L', 'Vanguard S&P 500 UCITS ETF'),
  (
    2,
    'VHVG.L',
    'Vanguard FTSE Developed World UCITS ETF USD Accumulation'
  ),
  (2, 'IWDA.L', 'iShares Core MSCI World UCITS ETF'),
  (2, 'SUSA', 'iShares ESG Optimized MSCI USA ETF'),
  (2, 'MCD', 'McDonald''s Corporation'),
  (2, 'AAPL', 'Apple Inc.'),
  (3, 'BTC-GBP', 'Bitcoin'),
  (3, 'ETH-GBP', 'Ethereum'),
  (3, 'SOL-GBP', 'Solana'),
  (3, 'ADA-GBP', 'Cardano'),
  (3, 'AVAX-GBP', 'Avalanche'),
  (
    4,
    'VGIT',
    'Vanguard Intermediate-Term Treasury Index'
  ),
  (4, 'BND', 'Vanguard Total Bond Market ETF'),
  (4, 'SHV', 'iShares Short Treasury Bond ETF');

-- ============================================================================
-- 4. TRANSACTIONS
-- ============================================================================
-- --- 401(k) Retirement Transactions ---
-- VOO: Regular quarterly contributions over 2 years
INSERT INTO
  transactions (asset_id, type, quantity, price, date, comments)
VALUES
  (
    1,
    'buy',
    10.0,
    380.00,
    '2024-01-15',
    'Initial investment'
  ),
  (
    1,
    'buy',
    5.0,
    395.50,
    '2024-04-15',
    'Q1 2024 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    420.75,
    '2024-07-15',
    'Q2 2024 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    445.00,
    '2024-10-15',
    'Q3 2024 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    460.25,
    '2025-01-15',
    'Q4 2024 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    478.00,
    '2025-04-15',
    'Q1 2025 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    510.50,
    '2025-07-15',
    'Q2 2025 contribution'
  ),
  (
    1,
    'buy',
    5.0,
    535.00,
    '2025-10-15',
    'Q3 2025 contribution'
  ),
  (
    1,
    'sell',
    8.0,
    548.25,
    '2025-12-15',
    'Rebalancing - partial sell'
  ),
  (
    2,
    'buy',
    50.0,
    105.00,
    '2024-01-15',
    'Initial investment'
  ),
  (
    2,
    'buy',
    25.0,
    112.50,
    '2024-06-15',
    'H1 2024 contribution'
  ),
  (
    2,
    'buy',
    25.0,
    120.00,
    '2024-12-15',
    'H2 2024 contribution'
  ),
  (
    2,
    'buy',
    25.0,
    128.75,
    '2025-06-15',
    'H1 2025 contribution'
  ),
  (
    3,
    'buy',
    40.0,
    24.50,
    '2024-01-15',
    'Initial investment'
  ),
  (
    3,
    'buy',
    20.0,
    23.80,
    '2024-07-15',
    'H2 2024 contribution'
  ),
  (
    3,
    'buy',
    20.0,
    25.20,
    '2025-01-15',
    'H1 2025 contribution'
  ),
  (
    3,
    'buy',
    20.0,
    26.50,
    '2025-07-15',
    'H2 2025 contribution'
  ),
  (
    4,
    'buy',
    30.0,
    95.00,
    '2024-03-15',
    'Initial bond allocation'
  ),
  (
    4,
    'buy',
    15.0,
    93.50,
    '2024-09-15',
    'Adding bonds - market volatility'
  ),
  (
    4,
    'buy',
    15.0,
    94.25,
    '2025-03-15',
    'Rebalance bonds'
  ),
  (
    5,
    'buy',
    15.0,
    385.00,
    '2024-02-01',
    'Initial position'
  ),
  (
    5,
    'buy',
    10.0,
    415.50,
    '2024-06-01',
    'Adding on dip recovery'
  ),
  (
    5,
    'buy',
    10.0,
    440.00,
    '2024-11-01',
    'Year-end accumulation'
  ),
  (
    5,
    'sell',
    10.0,
    475.25,
    '2025-06-01',
    'Take partial profits'
  ),
  (
    5,
    'buy',
    5.0,
    460.00,
    '2025-09-01',
    'Re-accumulate'
  ),
  (
    6,
    'buy',
    20.0,
    480.00,
    '2024-01-20',
    'AI bet - initial position'
  ),
  (
    6,
    'buy',
    10.0,
    550.00,
    '2024-05-15',
    'Adding after earnings beat'
  ),
  (
    6,
    'buy',
    10.0,
    620.00,
    '2024-09-01',
    'Momentum trade'
  ),
  (
    6,
    'sell',
    15.0,
    710.50,
    '2025-03-01',
    'Profit taking'
  ),
  (
    6,
    'sell',
    5.0,
    750.00,
    '2025-08-01',
    'Trim position'
  ),
  (
    7,
    'buy',
    100.0,
    65.00,
    '2024-01-10',
    'ISA opening contribution'
  ),
  (
    7,
    'buy',
    50.0,
    68.50,
    '2024-04-10',
    'Monthly SIP'
  ),
  (
    7,
    'buy',
    50.0,
    72.00,
    '2024-07-10',
    'Monthly SIP'
  ),
  (
    7,
    'buy',
    50.0,
    76.25,
    '2024-10-10',
    'Monthly SIP'
  ),
  (
    7,
    'buy',
    50.0,
    80.00,
    '2025-01-10',
    'New tax year max contribution'
  ),
  (
    7,
    'buy',
    50.0,
    84.50,
    '2025-04-10',
    'Monthly SIP'
  ),
  (
    7,
    'buy',
    50.0,
    89.00,
    '2025-07-10',
    'Monthly SIP'
  ),
  (
    7,
    'sell',
    60.0,
    92.75,
    '2025-11-01',
    'Rebalancing'
  ),
  (
    8,
    'buy',
    80.0,
    52.00,
    '2024-02-01',
    'Initial position'
  ),
  (
    8,
    'buy',
    40.0,
    55.50,
    '2024-08-01',
    'Half-year top-up'
  ),
  (
    8,
    'buy',
    40.0,
    59.00,
    '2025-02-01',
    'Adding to position'
  ),
  (
    9,
    'buy',
    60.0,
    70.00,
    '2024-01-15',
    'Core world exposure'
  ),
  (
    9,
    'buy',
    30.0,
    73.50,
    '2024-06-15',
    'DCA purchase'
  ),
  (
    9,
    'buy',
    30.0,
    77.00,
    '2024-12-15',
    'Year-end purchase'
  ),
  (
    9,
    'buy',
    30.0,
    81.25,
    '2025-06-15',
    'Mid-year purchase'
  ),
  (
    9,
    'sell',
    40.0,
    85.00,
    '2025-10-01',
    'Partial profit taking'
  ),
  (
    10,
    'buy',
    40.0,
    45.00,
    '2024-03-01',
    'ESG allocation'
  ),
  (
    10,
    'buy',
    20.0,
    47.50,
    '2024-09-01',
    'Adding ESG weight'
  ),
  (
    11,
    'buy',
    20.0,
    170.00,
    '2024-01-20',
    'Initial Apple position'
  ),
  (
    11,
    'buy',
    10.0,
    185.00,
    '2024-05-01',
    'Adding after WWDC'
  ),
  (
    11,
    'sell',
    15.0,
    210.50,
    '2025-04-01',
    'Profit taking'
  ),
  (11, 'buy', 5.0, 195.00, '2025-07-01', 'Dip buy'),
  (
    12,
    'buy',
    10.0,
    280.00,
    '2024-02-15',
    'Dividend income play'
  ),
  (
    12,
    'buy',
    5.0,
    290.50,
    '2024-08-15',
    'Adding to dividend base'
  ),
  (
    12,
    'buy',
    5.0,
    295.00,
    '2025-02-15',
    'Reinvest dividend'
  ),
  (
    13,
    'buy',
    8.0,
    175.00,
    '2024-04-01',
    'AAPL lot 2'
  ),
  (
    13,
    'buy',
    4.0,
    190.00,
    '2024-10-01',
    'Year-end accumulation'
  ),
  (
    13,
    'sell',
    6.0,
    205.00,
    '2025-06-01',
    'Trim AAPL exposure'
  ),
  (
    14,
    'buy',
    0.5,
    42000.00,
    '2024-01-10',
    'Initial BTC position'
  ),
  (
    14,
    'buy',
    0.25,
    38500.00,
    '2024-03-20',
    'Buy the dip'
  ),
  (
    14,
    'buy',
    0.3,
    68000.00,
    '2024-07-15',
    'Post-halving accumulation'
  ),
  (
    14,
    'buy',
    0.2,
    72500.00,
    '2024-09-01',
    'Bull run entry'
  ),
  (
    14,
    'sell',
    0.4,
    98000.00,
    '2025-03-01',
    'Take profits at resistance'
  ),
  (
    14,
    'buy',
    0.15,
    85000.00,
    '2025-06-01',
    'Re-accumulate after pullback'
  ),
  (
    14,
    'sell',
    0.2,
    105000.00,
    '2025-11-01',
    'ATH profit taking'
  ),
  (
    15,
    'buy',
    5.0,
    2300.00,
    '2024-01-15',
    'Initial ETH position'
  ),
  (
    15,
    'buy',
    3.0,
    2800.00,
    '2024-04-01',
    'Post-Dencun upgrade'
  ),
  (
    15,
    'buy',
    2.0,
    3200.00,
    '2024-07-01',
    'Momentum buy'
  ),
  (
    15,
    'sell',
    3.0,
    3800.00,
    '2024-11-15',
    'Profit taking'
  ),
  (
    15,
    'buy',
    2.5,
    3400.00,
    '2025-02-01',
    'Re-entry after correction'
  ),
  (
    15,
    'sell',
    2.0,
    4200.00,
    '2025-08-01',
    'Summer profit'
  ),
  (
    15,
    'sell',
    1.5,
    2600.00,
    '2025-10-15',
    'Stop loss on weak position'
  ),
  (
    16,
    'buy',
    50.0,
    95.00,
    '2024-02-01',
    'SOL initial position'
  ),
  (
    16,
    'buy',
    30.0,
    140.00,
    '2024-05-01',
    'Ecosystem growth play'
  ),
  (
    16,
    'sell',
    40.0,
    195.00,
    '2024-09-15',
    'Take profits'
  ),
  (
    16,
    'buy',
    20.0,
    155.00,
    '2025-01-15',
    'Re-accumulate'
  ),
  (
    16,
    'sell',
    25.0,
    210.00,
    '2025-07-01',
    'Trim after rally'
  ),
  (
    17,
    'buy',
    1000.0,
    0.55,
    '2024-01-20',
    'Long tail ADA position'
  ),
  (
    17,
    'buy',
    500.0,
    0.48,
    '2024-04-15',
    'DCA on weakness'
  ),
  (
    17,
    'sell',
    800.0,
    0.72,
    '2024-10-01',
    'Profit on rally'
  ),
  (
    17,
    'sell',
    400.0,
    0.65,
    '2025-05-01',
    'Exit remaining'
  ),
  (
    18,
    'buy',
    30.0,
    35.00,
    '2024-02-10',
    'Initial AVAX'
  ),
  (
    18,
    'buy',
    20.0,
    42.50,
    '2024-06-15',
    'Subnet narrative'
  ),
  (
    18,
    'sell',
    25.0,
    55.00,
    '2024-11-01',
    'Risk reduction'
  ),
  (18, 'buy', 15.0, 38.00, '2025-03-01', 'Dip buy'),
  (
    19,
    'buy',
    20.0,
    520.00,
    '2024-01-15',
    'Core bond allocation'
  ),
  (
    19,
    'buy',
    10.0,
    510.00,
    '2024-06-15',
    'Adding duration'
  ),
  (
    19,
    'buy',
    10.0,
    515.50,
    '2025-01-15',
    'Rebalance into bonds'
  ),
  (
    20,
    'buy',
    25.0,
    75.00,
    '2024-02-01',
    'Bond diversification'
  ),
  (
    20,
    'buy',
    15.0,
    73.50,
    '2024-08-01',
    'Adding on rate cut expectations'
  ),
  (
    20,
    'sell',
    10.0,
    76.00,
    '2025-04-01',
    'Trim for rebalancing'
  ),
  (
    20,
    'buy',
    10.0,
    74.50,
    '2025-09-01',
    'Re-accumulate'
  ),
  (
    21,
    'buy',
    50.0,
    99.50,
    '2024-01-10',
    'Cash parking'
  ),
  (
    21,
    'buy',
    30.0,
    99.45,
    '2024-07-10',
    'Dry powder'
  ),
  (
    21,
    'sell',
    40.0,
    99.60,
    '2025-02-01',
    'Deploy into opportunities'
  ),
  (
    21,
    'buy',
    20.0,
    99.40,
    '2025-08-01',
    'Rebuild cash buffer'
  );

COMMIT;

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Summary of prefilled data:
-- ============================================================================
-- Assumes user id 1 exists.
-- Portfolios:
--   1. 401(k) Retirement - 6 assets (VOO, VTSAX, VTIAX, VBTLX, MSFT, NVDA)
--   2. Stocks & Shares ISA - 7 assets (VUSA.L, VTUS.L, IWDA.L, SUSA.L, APPLE, MCD, AAPL)
--   3. Crypto Trading - 5 assets (BTC, ETH, SOL, ADA, AVAX)
--   4. Cash ISA - 3 assets (VGIT, BND, SHV)
-- Total: 21 assets, ~80+ transactions across 2 years of activity
-- ============================================================================