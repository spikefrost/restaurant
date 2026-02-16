export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
}

// Branch / Location
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  closing_hours: string;
  is_active: number;
  features: string;
  image_url: string;
  created_at: string;
}

// Menu Category
export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

// Menu Item
export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  calories: number;
  is_vegetarian: number;
  is_vegan: number;
  is_gluten_free: number;
  allergens: string;
  is_popular: number;
  is_new: number;
  is_available: number;
  prep_time_minutes: number;
  created_at: string;
}

// Menu Item with Category Name
export interface MenuItemWithCategory extends MenuItem {
  category_name: string;
}

// Modifier Group
export interface ModifierGroup {
  id: number;
  name: string;
  is_required: number;
  min_selections: number;
  max_selections: number;
  created_at: string;
}

// Modifier Option
export interface ModifierOption {
  id: number;
  group_id: number;
  name: string;
  price_adjustment: number;
  is_default: number;
  is_available: number;
}

// Item Modifier Link
export interface ItemModifier {
  item_id: number;
  group_id: number;
}

// Customer
export interface Customer {
  id: number;
  email: string;
  phone: string;
  password_hash: string;
  name: string;
  birthday: string;
  points_balance: number;
  total_spent: number;
  total_orders: number;
  tier: string;
  is_active: number;
  created_at: string;
  last_order_at: string;
}

// Order
export interface Order {
  id: number;
  order_number: string;
  branch_id: number;
  customer_id: number | null;
  table_number: string;
  order_type: 'dine_in' | 'takeaway';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  points_earned: number;
  points_redeemed: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  special_instructions: string;
  created_at: string;
  updated_at: string;
}

// Order with Branch Name
export interface OrderWithDetails extends Order {
  branch_name: string;
  customer_name: string;
  item_count: number;
  started_at?: string;
  completed_at?: string;
  prep_time_seconds?: number;
}

// ============================================
// STOCK & INGREDIENTS
// ============================================

export interface Ingredient {
  id: number;
  name: string;
  unit: string; // g, kg, ml, L, pieces, etc.
  category: string; // produce, meat, dairy, dry goods, etc.
  cost_per_unit: number;
  min_stock_level: number;
  created_at: string;
}

export interface MenuItemIngredient {
  id: number;
  menu_item_id: number;
  ingredient_id: number;
  quantity: number;
}

export interface StockLevel {
  id: number;
  branch_id: number;
  ingredient_id: number;
  current_quantity: number;
  updated_at: string;
}

export interface StockUsageLog {
  id: number;
  order_id: number;
  branch_id: number;
  ingredient_id: number;
  quantity_used: number;
  created_at: string;
}

// Order Item
export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  modifiers: string;
  special_instructions: string;
  subtotal: number;
}

// QR Code
export interface QRCode {
  id: number;
  branch_id: number;
  table_number: string;
  code: string;
  scan_count: number;
  is_active: number;
  created_at: string;
  last_scanned_at: string;
}

// Promotion / Voucher
export interface Promotion {
  id: number;
  name: string;
  description: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: number;
  created_at: string;
}

// Points Transaction
export interface PointsTransaction {
  id: number;
  customer_id: number;
  order_id: number | null;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  created_at: string;
}

// Admin User
export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  branch_id: number | null;
  is_active: number;
  created_at: string;
  last_login_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
}

// Cart Item (client-side)
export interface CartItem {
  item: MenuItem;
  quantity: number;
  modifiers: { name: string; price: number }[];
  specialInstructions: string;
}

// ============================================
// REWARDING & ENGAGEMENT TYPES
// ============================================

// Loyalty Tier
export interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  points_multiplier: number;
  benefits: string; // JSON array of benefits
  color: string;
  icon: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

// Automation Rule (Event-Driven)
export interface AutomationRule {
  id: number;
  name: string;
  description: string;
  trigger_event: string; // e.g., 'order_placed', 'signup', 'birthday', 'custom'
  trigger_conditions: string; // JSON conditions
  actions: string; // JSON array of actions
  is_active: number;
  priority: number;
  max_triggers_per_customer: number;
  start_date: string | null;
  end_date: string | null;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

// Email Template
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  body_json: string; // For visual editor - stores block structure
  variables: string; // JSON array of available variables
  category: string; // e.g., 'transactional', 'marketing', 'loyalty'
  is_active: number;
  created_at: string;
  updated_at: string;
}

// SMS Template
export interface SmsTemplate {
  id: number;
  name: string;
  body: string;
  variables: string; // JSON array of available variables
  category: string;
  character_count: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Communication Log
export interface CommunicationLog {
  id: number;
  customer_id: number;
  template_type: 'email' | 'sms';
  template_id: number;
  automation_rule_id: number | null;
  recipient: string;
  subject: string | null;
  body_preview: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// Trigger Event Types
export type TriggerEventType =
  | 'order_placed'
  | 'order_completed'
  | 'points_earned'
  | 'points_redeemed'
  | 'tier_upgrade'
  | 'tier_downgrade'
  | 'signup'
  | 'birthday'
  | 'anniversary'
  | 'inactive_customer'
  | 'first_order'
  | 'nth_order'
  | 'spend_threshold'
  | 'custom';

// Action Types
export type ActionType =
  | 'award_points'
  | 'award_discount'
  | 'award_free_item'
  | 'upgrade_tier'
  | 'send_email'
  | 'send_sms'
  | 'create_voucher';

// Automation Action
export interface AutomationAction {
  type: ActionType;
  config: Record<string, any>;
}

// Trigger Condition
export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

// Email Block for Visual Editor
export interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'columns' | 'footer';
  content: Record<string, any>;
  styles: Record<string, string>;
}

// ============================================
// CUSTOMER SEGMENTS
// ============================================

export interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  rules: string; // JSON array of segmentation rules
  customer_count: number;
  is_dynamic: number; // 1 = auto-update based on rules, 0 = static list
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentRule {
  field: string; // e.g., 'total_spent', 'total_orders', 'tier', 'last_order_days', 'signup_days'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
}

// ============================================
// VOUCHER CODES
// ============================================

export interface VoucherCode {
  id: number;
  code: string;
  batch_id: number | null;
  promotion_id: number | null;
  discount_type: 'percentage' | 'fixed' | 'free_item';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  is_single_use: number;
  customer_id: number | null; // null = any customer, specific = assigned
  segment_id: number | null;
  valid_from: string;
  valid_until: string;
  used_at: string | null;
  used_by_customer_id: number | null;
  status: 'active' | 'used' | 'expired' | 'revoked';
  created_at: string;
}

export interface VoucherBatch {
  id: number;
  name: string;
  code_prefix: string;
  total_codes: number;
  discount_type: 'percentage' | 'fixed' | 'free_item';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  is_single_use: number;
  segment_id: number | null;
  valid_from: string;
  valid_until: string;
  codes_used: number;
  created_at: string;
}

// ============================================
// LOYALTY - POINTS EARNING RULES
// ============================================

export interface PointsEarningRule {
  id: number;
  name: string;
  description: string;
  trigger_type: 'order' | 'signup' | 'referral' | 'review' | 'birthday' | 'challenge_complete' | 'custom';
  points_type: 'fixed' | 'multiplier' | 'percentage';
  points_value: number;
  conditions: string; // JSON - min order, categories, products, etc.
  segment_id: number | null;
  tier_multiplier_enabled: number;
  is_active: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

// ============================================
// LOYALTY - CHALLENGES
// ============================================

export interface LoyaltyChallenge {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  challenge_type: 'spend' | 'visits' | 'products' | 'categories' | 'streak' | 'referral' | 'custom';
  target_value: number; // e.g., spend $100, visit 5 times
  target_config: string; // JSON - specific products, categories, etc.
  reward_type: 'points' | 'voucher' | 'free_item' | 'tier_upgrade';
  reward_value: string; // JSON - points amount, voucher details, item id
  duration_days: number | null; // null = no time limit
  max_completions: number; // 0 = unlimited
  segment_id: number | null;
  is_active: number;
  start_date: string | null;
  end_date: string | null;
  participants_count: number;
  completions_count: number;
  created_at: string;
}

export interface CustomerChallengeProgress {
  id: number;
  customer_id: number;
  challenge_id: number;
  current_value: number;
  target_value: number;
  status: 'in_progress' | 'completed' | 'expired' | 'claimed';
  started_at: string;
  completed_at: string | null;
  claimed_at: string | null;
}

// ============================================
// LOYALTY - REWARDS CATALOG
// ============================================

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  reward_type: 'discount' | 'free_item' | 'voucher' | 'experience';
  reward_config: string; // JSON - discount details, item id, voucher template
  points_cost: number;
  tier_required: string | null; // tier name or null for all
  quantity_available: number | null; // null = unlimited
  quantity_redeemed: number;
  segment_id: number | null;
  is_active: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

// ============================================
// RESERVATIONS / TABLE BOOKINGS
// ============================================

export interface Reservation {
  id: number;
  branch_id: number;
  customer_id: number | null; // null for guest bookings
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithDetails extends Reservation {
  branch_name: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
}
