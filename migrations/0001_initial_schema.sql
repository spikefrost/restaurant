-- Migration: 001_initial_schema
-- Description: Create initial database schema for Restaurant Tool
-- Created: 2026-02-16

-- Table: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: automation_rules
CREATE TABLE IF NOT EXISTS automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL,
    trigger_conditions TEXT,
    actions TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 1,
    max_triggers_per_customer INTEGER DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    trigger_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: branches
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    opening_hours TEXT NOT NULL,
    closing_hours TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    features TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: cms_pages
CREATE TABLE cms_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: cms_settings
CREATE TABLE cms_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: communication_logs
CREATE TABLE communication_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    template_type TEXT NOT NULL,
    template_id INTEGER,
    automation_rule_id INTEGER,
    recipient TEXT NOT NULL,
    subject TEXT,
    body_preview TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: customer_challenge_progress
CREATE TABLE customer_challenge_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    target_value INTEGER NOT NULL,
    status TEXT DEFAULT 'in_progress',
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    claimed_at TEXT
);

-- Table: customer_segments
CREATE TABLE customer_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    rules TEXT DEFAULT '[]',
    customer_count INTEGER DEFAULT 0,
    is_dynamic INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: customers
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT UNIQUE,
    birthday TEXT,
    points_balance INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_order_at DATETIME,
    notes TEXT
);

-- Table: email_templates
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT,
    body_json TEXT,
    variables TEXT,
    category TEXT DEFAULT 'other',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: ingredients
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    cost_per_unit REAL NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: loyalty_challenges
CREATE TABLE loyalty_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    challenge_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    target_config TEXT DEFAULT '{}',
    reward_type TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    duration_days INTEGER,
    max_completions INTEGER DEFAULT 1,
    segment_id INTEGER,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    participants_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: loyalty_rewards
CREATE TABLE loyalty_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    reward_type TEXT NOT NULL,
    reward_config TEXT DEFAULT '{}',
    points_cost INTEGER NOT NULL,
    tier_required TEXT,
    quantity_available INTEGER,
    quantity_redeemed INTEGER DEFAULT 0,
    segment_id INTEGER,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: loyalty_tiers
CREATE TABLE loyalty_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    min_points INTEGER NOT NULL DEFAULT 0,
    points_multiplier REAL NOT NULL DEFAULT 1.0,
    benefits TEXT,
    color TEXT DEFAULT '#E85D04',
    icon TEXT DEFAULT '⭐',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: menu_item_ingredients
CREATE TABLE menu_item_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Table: menu_items
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    is_available INTEGER DEFAULT 1,
    is_popular INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    calories INTEGER,
    prep_time INTEGER,
    allergens TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_vegetarian INTEGER DEFAULT 0,
    is_vegan INTEGER DEFAULT 0,
    is_gluten_free INTEGER DEFAULT 0
);

-- Table: order_items
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES menu_items(id),
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    modifiers TEXT,
    special_instructions TEXT,
    subtotal REAL NOT NULL
);

-- Table: orders
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    branch_id INTEGER REFERENCES branches(id),
    customer_id INTEGER REFERENCES customers(id),
    table_number TEXT,
    order_type TEXT DEFAULT 'dine_in',
    status TEXT DEFAULT 'pending',
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    special_instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at TEXT,
    completed_at TEXT,
    prep_time_seconds INTEGER
);

-- Table: points_earning_rules
CREATE TABLE points_earning_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    points_type TEXT NOT NULL,
    points_value REAL NOT NULL,
    conditions TEXT DEFAULT '{}',
    segment_id INTEGER,
    tier_multiplier_enabled INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: promotions
CREATE TABLE promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: qr_codes
CREATE TABLE qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER REFERENCES branches(id),
    table_number TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    scan_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: reservations
CREATE TABLE reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    customer_id INTEGER,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    reservation_date TEXT NOT NULL,
    reservation_time TEXT NOT NULL,
    party_size INTEGER NOT NULL DEFAULT 2,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Table: sms_templates
CREATE TABLE sms_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    variables TEXT,
    category TEXT DEFAULT 'other',
    character_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: stock_levels
CREATE TABLE stock_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    current_quantity REAL NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, ingredient_id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Table: stock_usage_log
CREATE TABLE stock_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity_used REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Table: voucher_batches
CREATE TABLE voucher_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code_prefix TEXT DEFAULT '',
    total_codes INTEGER DEFAULT 0,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    max_discount REAL,
    is_single_use INTEGER DEFAULT 1,
    segment_id INTEGER,
    valid_from TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    codes_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table: voucher_codes
CREATE TABLE voucher_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    batch_id INTEGER,
    promotion_id INTEGER,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    max_discount REAL,
    is_single_use INTEGER DEFAULT 1,
    customer_id INTEGER,
    segment_id INTEGER,
    valid_from TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    used_at TEXT,
    used_by_customer_id INTEGER,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_reservations_branch ON reservations(branch_id);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_phone ON reservations(guest_phone);
CREATE INDEX idx_reservations_status ON reservations(status);