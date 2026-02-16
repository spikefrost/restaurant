import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Env } from './types';

// Database repositories
import { BranchRepository } from './db/branches';
import { CategoryRepository } from './db/categories';
import { MenuItemRepository } from './db/menu-items';
import { OrderRepository, OrderItemRepository } from './db/orders';
import { CustomerRepository } from './db/customers';
import { QRCodeRepository } from './db/qrcodes';
import { PromotionRepository } from './db/promotions';
import { AdminRepository } from './db/admin';
import { LoyaltyTierRepository } from './db/loyalty';
import { EmailTemplateRepository, SmsTemplateRepository, CommunicationLogRepository } from './db/templates';
import { SegmentRepository } from './db/segments';
import { VoucherRepository, VoucherBatchRepository } from './db/vouchers';
import { PointsEarningRepository, ChallengeRepository, RewardsCatalogRepository } from './db/loyalty-extended';
import { IngredientRepository, MenuItemIngredientRepository, StockLevelRepository, StockUsageLogRepository } from './db/stock';
import { ReservationRepository } from './db/reservations';

// Customer-facing pages
import { HomePage } from './routes/home';
import { MenuPage } from './routes/menu';
import { CartPage } from './routes/cart';
import { CheckoutPage } from './routes/checkout';
import { OrderConfirmationPage } from './routes/order-confirmation';
import { LocationsPage } from './routes/locations';
import { OrderHistoryPage } from './routes/orders';
import { KitchenDisplayPage } from './routes/kitchen';

// Admin pages
import { AdminDashboardPage } from './routes/admin/dashboard';
import { AdminOrdersPage } from './routes/admin/orders';
import { AdminReservationsPage } from './routes/admin/reservations';
import { AdminMenuPage, AdminMenuFormPage } from './routes/admin/menu';
import { AdminCategoriesPage, AdminCategoryFormPage } from './routes/admin/categories';
import { AdminBranchesPage, AdminBranchFormPage } from './routes/admin/branches';
import { AdminQRCodesPage } from './routes/admin/qrcodes';
import { AdminCustomersPage, AdminCustomerDetailPage } from './routes/admin/customers';
import { AdminPromotionsPage, AdminPromotionFormPage } from './routes/admin/promotions';
import { AdminReportsPage } from './routes/admin/reports';
import { AdminLoyaltyPage } from './routes/admin/loyalty';
import { AdminEmailTemplatesPage, AdminEmailEditorPage } from './routes/admin/engagement/email';
import { AdminSmsTemplatesPage } from './routes/admin/engagement/sms';
import { AdminCommunicationLogsPage } from './routes/admin/engagement/logs';
import { AdminSegmentsPage } from './routes/admin/segments';
import { AdminVouchersPage } from './routes/admin/vouchers';
import { AdminEarningRulesPage } from './routes/admin/loyalty/earning';
import { AdminChallengesPage } from './routes/admin/loyalty/challenges';
import { AdminRewardsCatalogPage } from './routes/admin/loyalty/rewards';
import { AdminCmsPage, AdminCmsHomepagePage, AdminCmsSettingsPage } from './routes/admin/cms';
import { AdminStockPage, AdminStockReportPage, AdminMenuIngredientsPage } from './routes/admin/stock';

const app = new Hono<{ Bindings: Env }>();

// ============================================
// CUSTOMER-FACING PAGE ROUTES
// ============================================

app.get('/', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const menuRepo = new MenuItemRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);

  const [categories, popularItems, branches] = await Promise.all([
    categoryRepo.getActive(),
    menuRepo.getPopular(6),
    branchRepo.getActive()
  ]);

  return c.html(<HomePage categories={categories} popularItems={popularItems} branches={branches} />);
});

app.get('/menu', async (c) => {
  try {
    const branchId = c.req.query('branch');
    const tableNumber = c.req.query('table');
    const categoryId = c.req.query('category');
    const search = c.req.query('q');

    const categoryRepo = new CategoryRepository(c.env.DB);
    const menuRepo = new MenuItemRepository(c.env.DB);
    const branchRepo = new BranchRepository(c.env.DB);

    const categories = await categoryRepo.getActive();
    const branches = await branchRepo.getAll();
    let items = categoryId
      ? await menuRepo.getByCategory(parseInt(categoryId))
      : await menuRepo.getAvailable();

    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    return c.html(
      <MenuPage
        categories={categories}
        items={items}
        branches={branches}
        selectedCategory={categoryId ? parseInt(categoryId) : undefined}
        selectedBranch={branchId ? parseInt(branchId) : undefined}
        tableNumber={tableNumber || undefined}
        searchQuery={search || undefined}
      />
    );
  } catch (error) {
    console.error('Menu page error:', error);
    return c.text(`Error loading menu: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
});

app.get('/cart', async (c) => {
  const branchRepo = new BranchRepository(c.env.DB);
  const menuRepo = new MenuItemRepository(c.env.DB);

  const [branches, menuItems] = await Promise.all([
    branchRepo.getAll(),
    menuRepo.getAvailable()
  ]);

  return c.html(<CartPage menuItems={menuItems} branches={branches} />);
});

app.get('/checkout', async (c) => {
  const branchId = c.req.query('branch');
  const tableNumber = c.req.query('table');
  const customerPhone = c.req.query('phone');

  const branchRepo = new BranchRepository(c.env.DB);
  const menuRepo = new MenuItemRepository(c.env.DB);
  const customerRepo = new CustomerRepository(c.env.DB);

  const [branches, menuItems] = await Promise.all([
    branchRepo.getAll(),
    menuRepo.getAvailable()
  ]);

  let selectedBranch = null;
  if (branchId) {
    selectedBranch = await branchRepo.getById(parseInt(branchId));
  }

  let customer = null;
  if (customerPhone) {
    customer = await customerRepo.getByPhone(customerPhone);
  }

  return c.html(<CheckoutPage menuItems={menuItems} branches={branches} selectedBranch={selectedBranch} tableNumber={tableNumber} customer={customer} />);
});

app.get('/order/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const orderRepo = new OrderRepository(c.env.DB);
  const orderItemRepo = new OrderItemRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);

  const order = await orderRepo.getByOrderNumber(orderNumber);
  if (!order) {
    return c.text('Order not found', 404);
  }

  const [items, branch] = await Promise.all([
    orderItemRepo.getByOrder(order.id),
    order.branch_id ? branchRepo.getById(order.branch_id) : null
  ]);

  return c.html(<OrderConfirmationPage order={order} items={items} branch={branch} />);
});

app.get('/locations', async (c) => {
  const branchRepo = new BranchRepository(c.env.DB);
  const branches = await branchRepo.getActive();
  return c.html(<LocationsPage branches={branches} />);
});

// Customer Order History
app.get('/orders', async (c) => {
  const phone = c.req.query('phone');

  if (!phone) {
    return c.html(<OrderHistoryPage />);
  }

  const customerRepo = new CustomerRepository(c.env.DB);
  const orderRepo = new OrderRepository(c.env.DB);
  const reservationRepo = new ReservationRepository(c.env.DB);

  const customer = await customerRepo.getByPhone(phone);

  // Get reservations by phone even if no customer found (for guest bookings)
  const reservations = await reservationRepo.getByPhone(phone);

  if (!customer) {
    // If no customer but has reservations, show them
    if (reservations.length > 0) {
      return c.html(<OrderHistoryPage phone={phone} reservations={reservations} />);
    }
    return c.html(<OrderHistoryPage phone={phone} error="No account found with this phone number." />);
  }

  const orders = await orderRepo.getByCustomer(customer.id);
  return c.html(<OrderHistoryPage orders={orders} reservations={reservations} customer={customer} phone={phone} />);
});

// Kitchen Display
app.get('/kitchen', async (c) => {
  const branchId = c.req.query('branch');
  const orderRepo = new OrderRepository(c.env.DB);
  const orderItemRepo = new OrderItemRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);

  let orders;
  if (branchId) {
    orders = await orderRepo.getActiveByBranch(parseInt(branchId));
  } else {
    orders = await orderRepo.getActive();
  }

  // Get items for each order
  const orderItems: Record<number, any[]> = {};
  for (const order of orders) {
    orderItems[order.id] = await orderItemRepo.getByOrder(order.id);
  }

  const branches = await branchRepo.getAll();

  return c.html(<KitchenDisplayPage
    orders={orders}
    orderItems={orderItems}
    branches={branches}
    currentBranch={branchId ? parseInt(branchId) : undefined}
  />);
});

// QR Code scan redirect
app.get('/qr/:code', async (c) => {
  const code = c.req.param('code');
  const qrRepo = new QRCodeRepository(c.env.DB);

  const qrCode = await qrRepo.getByCode(code);
  if (!qrCode || !qrCode.is_active) {
    return c.redirect('/menu');
  }

  await qrRepo.incrementScanCount(qrCode.id);
  return c.redirect(`/menu?branch=${qrCode.branch_id}&table=${qrCode.table_number}`);
});

// ============================================
// ADMIN PAGE ROUTES
// ============================================

app.get('/admin', async (c) => {
  const orderRepo = new OrderRepository(c.env.DB);
  const menuRepo = new MenuItemRepository(c.env.DB);
  const customerRepo = new CustomerRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);
  const stockRepo = new StockLevelRepository(c.env.DB);

  const [todayStats, recentOrders, topItems, totalCustomers, branches, prepTimeStats, lowStockItems] = await Promise.all([
    orderRepo.getTodayStats(),
    orderRepo.getAll(10),
    menuRepo.getPopular(5),
    customerRepo.getCount(),
    branchRepo.getAll(),
    orderRepo.getPrepTimeStats(),
    stockRepo.getLowStock()
  ]);

  return c.html(
    <AdminDashboardPage
      todayStats={todayStats}
      recentOrders={recentOrders}
      topItems={topItems}
      totalCustomers={totalCustomers}
      totalBranches={branches.length}
      prepTimeStats={prepTimeStats}
      lowStockItems={lowStockItems}
    />
  );
});

app.get('/admin/orders', async (c) => {
  const status = c.req.query('status');
  const orderRepo = new OrderRepository(c.env.DB);

  const orders = status
    ? await orderRepo.getByStatus(status)
    : await orderRepo.getAll(100);

  return c.html(<AdminOrdersPage orders={orders} currentStatus={status} />);
});

app.get('/admin/reservations', async (c) => {
  const filter = c.req.query('filter');
  const reservationRepo = new ReservationRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);

  const [reservations, branches, stats] = await Promise.all([
    filter ? reservationRepo.getByStatus(filter) : reservationRepo.getAll(),
    branchRepo.getActive(),
    reservationRepo.getStats()
  ]);

  return c.html(<AdminReservationsPage reservations={reservations} branches={branches} filter={filter} stats={stats} />);
});

app.get('/admin/menu', async (c) => {
  const menuRepo = new MenuItemRepository(c.env.DB);
  const categoryRepo = new CategoryRepository(c.env.DB);

  const [items, categories] = await Promise.all([
    menuRepo.getAll(),
    categoryRepo.getAll()
  ]);

  return c.html(<AdminMenuPage items={items} categories={categories} />);
});

app.get('/admin/menu/new', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const categories = await categoryRepo.getAll();
  return c.html(<AdminMenuFormPage categories={categories} />);
});

app.get('/admin/menu/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const menuRepo = new MenuItemRepository(c.env.DB);
  const categoryRepo = new CategoryRepository(c.env.DB);

  const [item, categories] = await Promise.all([
    menuRepo.getById(id),
    categoryRepo.getAll()
  ]);

  if (!item) {
    return c.redirect('/admin/menu');
  }

  return c.html(<AdminMenuFormPage item={item} categories={categories} />);
});

app.get('/admin/categories', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const categories = await categoryRepo.getAll();
  return c.html(<AdminCategoriesPage categories={categories} />);
});

app.get('/admin/categories/new', async (c) => {
  return c.html(<AdminCategoryFormPage />);
});

app.get('/admin/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const categoryRepo = new CategoryRepository(c.env.DB);
  const category = await categoryRepo.getById(id);

  if (!category) {
    return c.redirect('/admin/categories');
  }

  return c.html(<AdminCategoryFormPage category={category} />);
});

app.get('/admin/branches', async (c) => {
  const branchRepo = new BranchRepository(c.env.DB);
  const branches = await branchRepo.getAll();
  return c.html(<AdminBranchesPage branches={branches} />);
});

app.get('/admin/branches/new', async (c) => {
  return c.html(<AdminBranchFormPage />);
});

app.get('/admin/branches/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const branchRepo = new BranchRepository(c.env.DB);
  const branch = await branchRepo.getById(id);

  if (!branch) {
    return c.redirect('/admin/branches');
  }

  return c.html(<AdminBranchFormPage branch={branch} />);
});

app.get('/admin/qrcodes', async (c) => {
  const qrRepo = new QRCodeRepository(c.env.DB);
  const branchRepo = new BranchRepository(c.env.DB);

  const [qrcodes, branches] = await Promise.all([
    qrRepo.getAll(),
    branchRepo.getAll()
  ]);

  return c.html(<AdminQRCodesPage qrcodes={qrcodes} branches={branches} />);
});

app.get('/admin/customers', async (c) => {
  const customerRepo = new CustomerRepository(c.env.DB);
  const customers = await customerRepo.getAll();
  return c.html(<AdminCustomersPage customers={customers} />);
});

app.get('/admin/customers/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const customerRepo = new CustomerRepository(c.env.DB);
  const orderRepo = new OrderRepository(c.env.DB);

  const customer = await customerRepo.getById(id);
  if (!customer) {
    return c.redirect('/admin/customers');
  }

  const orders = await orderRepo.getByCustomer(id);
  return c.html(<AdminCustomerDetailPage customer={customer} orders={orders} />);
});

app.get('/admin/promotions', async (c) => {
  const promoRepo = new PromotionRepository(c.env.DB);
  const promotions = await promoRepo.getAll();
  return c.html(<AdminPromotionsPage promotions={promotions} />);
});

app.get('/admin/promotions/new', async (c) => {
  return c.html(<AdminPromotionFormPage />);
});

app.get('/admin/promotions/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const promoRepo = new PromotionRepository(c.env.DB);
  const promotion = await promoRepo.getById(id);

  if (!promotion) {
    return c.redirect('/admin/promotions');
  }

  return c.html(<AdminPromotionFormPage promotion={promotion} />);
});

app.get('/admin/reports', async (c) => {
  const period = c.req.query('period') || 'today';
  const customStart = c.req.query('start');
  const customEnd = c.req.query('end');

  const orderRepo = new OrderRepository(c.env.DB);

  // Calculate date range
  const now = new Date();
  let startDate: string;
  let endDate: string;

  switch (period) {
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      endDate = startDate;
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      startDate = weekStart.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = customStart || now.toISOString().split('T')[0];
      endDate = customEnd || now.toISOString().split('T')[0];
      break;
    default: // today
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
  }

  const reportData = await orderRepo.getReportData(startDate, endDate);

  return c.html(<AdminReportsPage data={{
    ...reportData,
    period,
    startDate,
    endDate
  }} />);
});

// ============================================
// ADMIN - LOYALTY TIERS
// ============================================

app.get('/admin/loyalty', async (c) => {
  const tierRepo = new LoyaltyTierRepository(c.env.DB);
  const tiers = await tierRepo.getAll();
  return c.html(<AdminLoyaltyPage tiers={tiers} />);
});

// ============================================
// ADMIN - AUTOMATIONS
// ============================================
// ADMIN - EMAIL TEMPLATES
// ============================================

app.get('/admin/engagement/email', async (c) => {
  const emailRepo = new EmailTemplateRepository(c.env.DB);
  const templates = await emailRepo.getAll();
  return c.html(<AdminEmailTemplatesPage templates={templates} />);
});

app.get('/admin/engagement/email/new', async (c) => {
  return c.html(<AdminEmailEditorPage />);
});

app.get('/admin/engagement/email/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const emailRepo = new EmailTemplateRepository(c.env.DB);
  const template = await emailRepo.getById(id);

  if (!template) {
    return c.redirect('/admin/engagement/email');
  }

  return c.html(<AdminEmailEditorPage template={template} />);
});

// ============================================
// ADMIN - SMS TEMPLATES
// ============================================

app.get('/admin/engagement/sms', async (c) => {
  const smsRepo = new SmsTemplateRepository(c.env.DB);
  const templates = await smsRepo.getAll();
  return c.html(<AdminSmsTemplatesPage templates={templates} />);
});

// ============================================
// ADMIN - COMMUNICATION LOGS
// ============================================

app.get('/admin/engagement/logs', async (c) => {
  const logRepo = new CommunicationLogRepository(c.env.DB);
  const customerRepo = new CustomerRepository(c.env.DB);

  const typeFilter = c.req.query('type');
  const statusFilter = c.req.query('status');

  const [logs, stats, allCustomers] = await Promise.all([
    logRepo.getAll(100),
    logRepo.getStats(),
    customerRepo.getAll()
  ]);

  // Create customer lookup map
  const customers: Record<number, any> = {};
  allCustomers.forEach(c => { customers[c.id] = c; });

  // Apply filters
  let filteredLogs = logs;
  if (typeFilter) {
    filteredLogs = filteredLogs.filter(l => l.template_type === typeFilter);
  }
  if (statusFilter) {
    filteredLogs = filteredLogs.filter(l => l.status === statusFilter);
  }

  return c.html(<AdminCommunicationLogsPage
    logs={filteredLogs}
    customers={customers}
    stats={stats}
    filter={{ type: typeFilter, status: statusFilter }}
  />);
});

// ============================================
// ADMIN - CUSTOMER SEGMENTS
// ============================================

app.get('/admin/segments', async (c) => {
  const segmentRepo = new SegmentRepository(c.env.DB);
  const segments = await segmentRepo.getAll();
  return c.html(<AdminSegmentsPage segments={segments} />);
});

// ============================================
// ADMIN - VOUCHER CODES
// ============================================

app.get('/admin/vouchers', async (c) => {
  const voucherRepo = new VoucherRepository(c.env.DB);
  const batchRepo = new VoucherBatchRepository(c.env.DB);
  const segmentRepo = new SegmentRepository(c.env.DB);

  const [vouchers, batches, segments] = await Promise.all([
    voucherRepo.getAll(200),
    batchRepo.getAll(),
    segmentRepo.getAll()
  ]);

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === 'active').length,
    used: vouchers.filter(v => v.status === 'used').length,
    expired: vouchers.filter(v => v.status === 'expired' || v.status === 'revoked').length
  };

  return c.html(<AdminVouchersPage vouchers={vouchers} batches={batches} segments={segments} stats={stats} />);
});

// ============================================
// ADMIN - LOYALTY: EARNING RULES
// ============================================

app.get('/admin/loyalty/earning', async (c) => {
  const earningRepo = new PointsEarningRepository(c.env.DB);
  const segmentRepo = new SegmentRepository(c.env.DB);
  const tierRepo = new LoyaltyTierRepository(c.env.DB);

  const [rules, segments, tiers] = await Promise.all([
    earningRepo.getAll(),
    segmentRepo.getAll(),
    tierRepo.getAll()
  ]);

  return c.html(<AdminEarningRulesPage rules={rules} segments={segments} tiers={tiers} />);
});

// ============================================
// ADMIN - LOYALTY: CHALLENGES
// ============================================

app.get('/admin/loyalty/challenges', async (c) => {
  const challengeRepo = new ChallengeRepository(c.env.DB);
  const segmentRepo = new SegmentRepository(c.env.DB);

  const [challenges, segments] = await Promise.all([
    challengeRepo.getAll(),
    segmentRepo.getAll()
  ]);

  return c.html(<AdminChallengesPage challenges={challenges} segments={segments} />);
});

// ============================================
// ADMIN - LOYALTY: REWARDS CATALOG
// ============================================

app.get('/admin/loyalty/rewards', async (c) => {
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);
  const segmentRepo = new SegmentRepository(c.env.DB);
  const tierRepo = new LoyaltyTierRepository(c.env.DB);

  const [rewards, segments, tiers] = await Promise.all([
    rewardsRepo.getAll(),
    segmentRepo.getAll(),
    tierRepo.getAll()
  ]);

  return c.html(<AdminRewardsCatalogPage rewards={rewards} segments={segments} tiers={tiers} />);
});

// Redirect old loyalty route to tiers
app.get('/admin/loyalty/tiers', async (c) => {
  const tierRepo = new LoyaltyTierRepository(c.env.DB);
  const tiers = await tierRepo.getAll();
  return c.html(<AdminLoyaltyPage tiers={tiers} />);
});

// ============================================
// ADMIN - STOCK MANAGEMENT
// ============================================

app.get('/admin/stock', async (c) => {
  const branchId = c.req.query('branch') ? parseInt(c.req.query('branch')!) : undefined;
  const branchRepo = new BranchRepository(c.env.DB);
  const ingredientRepo = new IngredientRepository(c.env.DB);
  const stockRepo = new StockLevelRepository(c.env.DB);

  const [branches, ingredients, stockLevels, lowStock] = await Promise.all([
    branchRepo.getAll(),
    ingredientRepo.getAll(),
    stockRepo.getAll(branchId),
    stockRepo.getLowStock(branchId)
  ]);

  return c.html(<AdminStockPage
    ingredients={ingredients}
    stockLevels={stockLevels}
    lowStock={lowStock}
    branches={branches}
    currentBranch={branchId}
  />);
});

app.get('/admin/stock/reports', async (c) => {
  const branchId = c.req.query('branch') ? parseInt(c.req.query('branch')!) : undefined;
  const startDate = c.req.query('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = c.req.query('end') || new Date().toISOString().split('T')[0];

  const branchRepo = new BranchRepository(c.env.DB);
  const usageRepo = new StockUsageLogRepository(c.env.DB);

  const [branches, usageReport, dailyUsage] = await Promise.all([
    branchRepo.getAll(),
    usageRepo.getUsageReport(startDate, endDate, branchId),
    usageRepo.getDailyUsage(7, branchId)
  ]);

  return c.html(<AdminStockReportPage
    usageReport={usageReport}
    dailyUsage={dailyUsage}
    branches={branches}
    startDate={startDate}
    endDate={endDate}
    currentBranch={branchId}
  />);
});

app.get('/admin/menu/:id/ingredients', async (c) => {
  const id = parseInt(c.req.param('id'));
  const menuRepo = new MenuItemRepository(c.env.DB);
  const ingredientRepo = new IngredientRepository(c.env.DB);
  const menuIngRepo = new MenuItemIngredientRepository(c.env.DB);

  const [menuItem, ingredients, currentIngredients] = await Promise.all([
    menuRepo.getById(id),
    ingredientRepo.getAll(),
    menuIngRepo.getByMenuItem(id)
  ]);

  if (!menuItem) {
    return c.redirect('/admin/menu');
  }

  return c.html(<AdminMenuIngredientsPage
    menuItem={menuItem}
    ingredients={ingredients}
    currentIngredients={currentIngredients}
  />);
});

// ============================================
// ADMIN - CMS
// ============================================

app.get('/admin/cms', async (c) => {
  const { results: settingsRows } = await c.env.DB.prepare('SELECT key, value FROM cms_settings').all();
  const settings: Record<string, string> = {};
  (settingsRows || []).forEach((row: any) => { settings[row.key] = row.value; });
  return c.html(<AdminCmsPage settings={settings} sections={[]} />);
});

// CMS Homepage Editor
app.get('/admin/cms/homepage', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const menuRepo = new MenuItemRepository(c.env.DB);
  const categories = await categoryRepo.getAll();
  const popularItems = await menuRepo.getPopular(6);
  const { results: settingsRows } = await c.env.DB.prepare('SELECT key, value FROM cms_settings').all();
  const settings: Record<string, string> = {};
  (settingsRows || []).forEach((row: any) => { settings[row.key] = row.value; });
  return c.html(<AdminCmsHomepagePage settings={settings} categories={categories} popularItems={popularItems} />);
});

app.get('/admin/cms/settings', async (c) => {
  const { results: settingsRows } = await c.env.DB.prepare('SELECT key, value FROM cms_settings').all();
  const settings: Record<string, string> = {};
  (settingsRows || []).forEach((row: any) => { settings[row.key] = row.value; });
  return c.html(<AdminCmsSettingsPage settings={settings} />);
});

// ============================================
// API ROUTES - Menu Items
// ============================================

app.get('/api/menu', async (c) => {
  const categoryId = c.req.query('category');
  const menuRepo = new MenuItemRepository(c.env.DB);

  const items = categoryId
    ? await menuRepo.getByCategory(parseInt(categoryId))
    : await menuRepo.getActive();

  return c.json(items);
});

app.get('/api/menu/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const menuRepo = new MenuItemRepository(c.env.DB);
  const item = await menuRepo.getById(id);

  if (!item) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json(item);
});

app.post('/api/menu', async (c) => {
  const body = await c.req.parseBody();
  const menuRepo = new MenuItemRepository(c.env.DB);

  const id = await menuRepo.create({
    category_id: parseInt(body.category_id as string),
    name: body.name as string,
    description: body.description as string || null,
    price: parseFloat(body.price as string),
    image_url: body.image_url as string || null,
    is_available: body.is_available ? 1 : 0,
    is_popular: body.is_popular ? 1 : 0,
    is_new: body.is_new ? 1 : 0,
    calories: body.calories ? parseInt(body.calories as string) : null,
    prep_time: body.prep_time ? parseInt(body.prep_time as string) : null,
    allergens: body.allergens as string || null,
    sort_order: body.sort_order ? parseInt(body.sort_order as string) : 0
  });

  return c.redirect('/admin/menu');
});

app.post('/api/menu/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.parseBody();
  const menuRepo = new MenuItemRepository(c.env.DB);

  await menuRepo.update(id, {
    category_id: parseInt(body.category_id as string),
    name: body.name as string,
    description: body.description as string || null,
    price: parseFloat(body.price as string),
    image_url: body.image_url as string || null,
    is_available: body.is_available ? 1 : 0,
    is_popular: body.is_popular ? 1 : 0,
    is_new: body.is_new ? 1 : 0,
    calories: body.calories ? parseInt(body.calories as string) : null,
    prep_time: body.prep_time ? parseInt(body.prep_time as string) : null,
    allergens: body.allergens as string || null,
    sort_order: body.sort_order ? parseInt(body.sort_order as string) : 0
  });

  return c.redirect('/admin/menu');
});

app.delete('/api/menu/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const menuRepo = new MenuItemRepository(c.env.DB);
  await menuRepo.delete(id);
  return c.json({ success: true });
});

// Menu toggle availability
app.put('/api/menu/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'));
  const menuRepo = new MenuItemRepository(c.env.DB);
  await menuRepo.toggleAvailability(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Menu Import
// ============================================

// Download Excel template
app.get('/api/menu/template', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const categories = await categoryRepo.getAll();

  // Create CSV template (simpler than xlsx, works everywhere)
  const categoryList = categories.map(cat => cat.name).join(', ');
  const categoryIds = categories.map(cat => `${cat.name}=${cat.id}`).join(', ');

  const csvContent = `Name,Category,Price,Description,Calories,Vegetarian,Vegan,Gluten Free,Allergens,Popular,New
"Example Burger","${categories[0]?.name || 'Main Course'}",12.99,"Delicious beef burger with cheese",650,0,0,0,"dairy, gluten",1,0
"Garden Salad","${categories[1]?.name || 'Salads'}",8.50,"Fresh mixed greens",250,1,1,1,"",0,1

INSTRUCTIONS:
- Name: Required. The name of the menu item.
- Category: Required. Must match one of: ${categoryList}
- Price: Required. Decimal number (e.g. 12.99)
- Description: Optional. Description of the item.
- Calories: Optional. Number of calories.
- Vegetarian: 0 or 1 (1 = yes)
- Vegan: 0 or 1 (1 = yes)
- Gluten Free: 0 or 1 (1 = yes)
- Allergens: Optional. Comma-separated list.
- Popular: 0 or 1 (1 = mark as popular)
- New: 0 or 1 (1 = mark as new)

AVAILABLE CATEGORIES (Name=ID):
${categoryIds}

Delete these instruction rows before uploading!`;

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="menu_template.csv"'
    }
  });
});

// Parse uploaded Excel/CSV file
app.post('/api/menu/import/parse-excel', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    const categoryRepo = new CategoryRepository(c.env.DB);
    const categories = await categoryRepo.getAll();

    // Read file content
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('INSTRUCTIONS') && !line.startsWith('AVAILABLE') && !line.startsWith('Delete') && !line.startsWith('-'));

    if (lines.length < 2) {
      return c.json({ success: false, error: 'File is empty or has no data rows' }, 400);
    }

    // Parse CSV - handle quoted fields properly
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
    const items: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const name = values[headers.indexOf('name')]?.replace(/['"]/g, '');
      const categoryName = values[headers.indexOf('category')]?.replace(/['"]/g, '');
      const price = parseFloat(values[headers.indexOf('price')] || '0');
      const description = values[headers.indexOf('description')]?.replace(/['"]/g, '') || '';
      const calories = parseInt(values[headers.indexOf('calories')] || '0') || null;
      const isVegetarian = values[headers.indexOf('vegetarian')] === '1' ? 1 : 0;
      const isVegan = values[headers.indexOf('vegan')] === '1' ? 1 : 0;
      const isGlutenFree = values[headers.indexOf('gluten free')] === '1' ? 1 : 0;
      const allergens = values[headers.indexOf('allergens')]?.replace(/['"]/g, '') || '';
      const isPopular = values[headers.indexOf('popular')] === '1' ? 1 : 0;
      const isNew = values[headers.indexOf('new')] === '1' ? 1 : 0;

      // Find category by name (case-insensitive)
      const category = categories.find(cat =>
        cat.name.toLowerCase() === categoryName?.toLowerCase()
      );

      let valid = true;
      let error = '';

      if (!name) {
        valid = false;
        error = 'Missing name';
      } else if (!category) {
        valid = false;
        error = 'Unknown category';
      } else if (isNaN(price) || price <= 0) {
        valid = false;
        error = 'Invalid price';
      }

      items.push({
        name: name || 'Unnamed',
        category_id: category?.id || null,
        category_name: categoryName,
        price,
        description,
        calories,
        is_vegetarian: isVegetarian,
        is_vegan: isVegan,
        is_gluten_free: isGlutenFree,
        allergens,
        is_popular: isPopular,
        is_new: isNew,
        is_available: 1,
        prep_time_minutes: 15,
        valid,
        error
      });
    }

    return c.json({ success: true, items });
  } catch (err) {
    console.error('Excel parse error:', err);
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Parse error' }, 500);
  }
});

// Scan photo with AI (simplified - returns mock data for now)
app.post('/api/menu/import/scan-photo', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    const categoryRepo = new CategoryRepository(c.env.DB);
    const categories = await categoryRepo.getAll();

    // For now, return a message that this feature requires AI integration
    // In production, you would integrate with an AI vision API like OpenAI Vision, Google Cloud Vision, etc.

    // Simulated response for demo purposes - shows the feature UI works
    const sampleItems = [
      {
        name: 'Detected Item 1',
        category_id: categories[0]?.id || 1,
        category_name: categories[0]?.name || 'Main Course',
        price: 0,
        description: 'Please update price and details',
        is_vegetarian: 0,
        is_vegan: 0,
        is_gluten_free: 0,
        allergens: '',
        is_popular: 0,
        is_new: 1,
        is_available: 1,
        prep_time_minutes: 15,
        valid: false,
        error: 'Set price'
      }
    ];

    return c.json({
      success: true,
      items: sampleItems,
      message: 'Photo scanning is a preview feature. For full OCR capabilities, integrate with an AI vision service. For now, please use the Excel upload option for bulk imports.'
    });
  } catch (err) {
    console.error('Photo scan error:', err);
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Scan error' }, 500);
  }
});

// Bulk import menu items
app.post('/api/menu/import/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const items = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ success: false, error: 'No items to import' }, 400);
    }

    const menuRepo = new MenuItemRepository(c.env.DB);

    // Filter to only valid items and prepare for database
    const validItems = items.filter(item => item.valid !== false && item.category_id && item.price > 0);

    const imported = await menuRepo.bulkCreate(validItems.map(item => ({
      category_id: item.category_id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      image_url: item.image_url || null,
      calories: item.calories || null,
      is_vegetarian: item.is_vegetarian || 0,
      is_vegan: item.is_vegan || 0,
      is_gluten_free: item.is_gluten_free || 0,
      allergens: item.allergens || null,
      is_popular: item.is_popular || 0,
      is_new: item.is_new || 0,
      is_available: item.is_available ?? 1,
      prep_time_minutes: item.prep_time_minutes || 15
    })));

    return c.json({ success: true, imported, total: validItems.length });
  } catch (err) {
    console.error('Bulk import error:', err);
    return c.json({ success: false, error: err instanceof Error ? err.message : 'Import error' }, 500);
  }
});

// ============================================
// API ROUTES - Categories
// ============================================

app.get('/api/categories', async (c) => {
  const categoryRepo = new CategoryRepository(c.env.DB);
  const categories = await categoryRepo.getActive();
  return c.json(categories);
});

app.post('/api/categories', async (c) => {
  const body = await c.req.parseBody();
  const categoryRepo = new CategoryRepository(c.env.DB);

  await categoryRepo.create({
    name: body.name as string,
    description: body.description as string || null,
    image_url: body.image_url as string || null,
    sort_order: body.sort_order ? parseInt(body.sort_order as string) : 0,
    is_active: body.is_active ? 1 : 0
  });

  return c.redirect('/admin/categories');
});

app.post('/api/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.parseBody();
  const categoryRepo = new CategoryRepository(c.env.DB);

  await categoryRepo.update(id, {
    name: body.name as string,
    description: body.description as string || null,
    image_url: body.image_url as string || null,
    sort_order: body.sort_order ? parseInt(body.sort_order as string) : 0,
    is_active: body.is_active ? 1 : 0
  });

  return c.redirect('/admin/categories');
});

app.delete('/api/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const categoryRepo = new CategoryRepository(c.env.DB);
  await categoryRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Branches
// ============================================

app.get('/api/branches', async (c) => {
  const branchRepo = new BranchRepository(c.env.DB);
  const branches = await branchRepo.getActive();
  return c.json(branches);
});

app.post('/api/branches', async (c) => {
  const body = await c.req.parseBody();
  const branchRepo = new BranchRepository(c.env.DB);

  await branchRepo.create({
    name: body.name as string,
    address: body.address as string,
    phone: body.phone as string,
    email: body.email as string || null,
    opening_hours: body.opening_hours as string,
    closing_hours: body.closing_hours as string,
    is_active: body.is_active ? 1 : 0,
    features: body.features as string || null,
    image_url: body.image_url as string || null
  });

  return c.redirect('/admin/branches');
});

app.post('/api/branches/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.parseBody();
  const branchRepo = new BranchRepository(c.env.DB);

  await branchRepo.update(id, {
    name: body.name as string,
    address: body.address as string,
    phone: body.phone as string,
    email: body.email as string || null,
    opening_hours: body.opening_hours as string,
    closing_hours: body.closing_hours as string,
    is_active: body.is_active ? 1 : 0,
    features: body.features as string || null,
    image_url: body.image_url as string || null
  });

  return c.redirect('/admin/branches');
});

app.delete('/api/branches/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const branchRepo = new BranchRepository(c.env.DB);
  await branchRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - QR Codes
// ============================================

app.get('/api/qrcodes', async (c) => {
  const qrRepo = new QRCodeRepository(c.env.DB);
  const qrcodes = await qrRepo.getAll();
  return c.json(qrcodes);
});

app.post('/api/qrcodes', async (c) => {
  const body = await c.req.json();
  const qrRepo = new QRCodeRepository(c.env.DB);

  const branchId = parseInt(body.branch_id);
  const startTable = parseInt(body.start_table);
  const endTable = parseInt(body.end_table);

  const results = [];
  for (let table = startTable; table <= endTable; table++) {
    const code = await qrRepo.generateCode();
    const id = await qrRepo.create({
      branch_id: branchId,
      table_number: table.toString(),
      code,
      is_active: 1
    });
    results.push({ id, table, code });
  }

  return c.json({ success: true, created: results });
});

app.delete('/api/qrcodes/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const qrRepo = new QRCodeRepository(c.env.DB);
  await qrRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Orders
// ============================================

app.get('/api/orders', async (c) => {
  const status = c.req.query('status');
  const orderRepo = new OrderRepository(c.env.DB);

  const orders = status
    ? await orderRepo.getByStatus(status)
    : await orderRepo.getActive();

  return c.json(orders);
});

app.get('/api/orders/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const orderRepo = new OrderRepository(c.env.DB);
  const orderItemRepo = new OrderItemRepository(c.env.DB);

  const order = await orderRepo.getById(id);
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  const items = await orderItemRepo.getByOrder(id);
  return c.json({ ...order, items });
});

app.post('/api/orders', async (c) => {
  try {
  const body = await c.req.json();
  const orderRepo = new OrderRepository(c.env.DB);
  const orderItemRepo = new OrderItemRepository(c.env.DB);
  const customerRepo = new CustomerRepository(c.env.DB);
  const promoRepo = new PromotionRepository(c.env.DB);

  // Handle customer
  let customerId = null;
  if (body.customer_phone) {
    let customer = await customerRepo.getByPhone(body.customer_phone);
    if (!customer) {
      customerId = await customerRepo.create({
        name: body.customer_name || 'Guest',
        phone: body.customer_phone,
        email: body.customer_email || null,
        points_balance: 0,
        total_spent: 0,
        total_orders: 0,
        tier: 'bronze'
      });
    } else {
      customerId = customer.id;
    }
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of body.items) {
    subtotal += item.price * item.quantity;
  }

  // Apply promo code
  let discount = 0;
  if (body.promo_code) {
    const promo = await promoRepo.getByCode(body.promo_code);
    if (promo && promo.is_active) {
      const now = new Date();
      const start = new Date(promo.start_date);
      const end = new Date(promo.end_date);

      if (now >= start && now <= end && subtotal >= promo.min_order_value) {
        if (promo.max_uses === 0 || promo.used_count < promo.max_uses) {
          if (promo.discount_type === 'percentage') {
            discount = subtotal * (promo.discount_value / 100);
          } else {
            discount = promo.discount_value;
          }
          await promoRepo.incrementUsage(promo.id);
        }
      }
    }
  }

  const tax = (subtotal - discount) * 0.05; // 5% tax
  const total = subtotal - discount + tax;
  const pointsEarned = Math.floor(total);

  // Generate order number
  const orderNumber = await orderRepo.generateOrderNumber();

  // Create order
  const orderId = await orderRepo.create({
    order_number: orderNumber,
    branch_id: body.branch_id || null,
    customer_id: customerId,
    table_number: body.table_number || null,
    order_type: body.order_type || 'dine_in',
    status: 'pending',
    subtotal,
    tax,
    discount,
    total,
    points_earned: pointsEarned,
    points_redeemed: 0,
    payment_method: body.payment_method || 'cash',
    payment_status: 'pending',
    special_instructions: body.special_instructions || null
  });

  // Create order items
  for (const item of body.items) {
    await orderItemRepo.create({
      order_id: orderId,
      item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
      special_instructions: item.notes || null,
      subtotal: item.price * item.quantity
    });
  }

  // Update customer stats
  if (customerId) {
    await customerRepo.updateStats(customerId, total, pointsEarned);
  }

  return c.json({ success: true, orderNumber, orderId });
  } catch (error) {
    console.error('Order creation error:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.patch('/api/orders/:id/status', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const orderRepo = new OrderRepository(c.env.DB);

  await orderRepo.updateStatus(id, body.status);
  return c.json({ success: true });
});

app.patch('/api/orders/:id/payment', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const orderRepo = new OrderRepository(c.env.DB);

  await orderRepo.updatePaymentStatus(id, body.status);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Customers
// ============================================

app.get('/api/customers', async (c) => {
  const customerRepo = new CustomerRepository(c.env.DB);
  const customers = await customerRepo.getAll();
  return c.json(customers);
});

app.get('/api/customers/lookup', async (c) => {
  const phone = c.req.query('phone');
  if (!phone) {
    return c.json({ error: 'Phone number required' }, 400);
  }

  const customerRepo = new CustomerRepository(c.env.DB);
  const customer = await customerRepo.getByPhone(phone);

  return c.json({ customer: customer || null });
});

app.get('/api/customers/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const customerRepo = new CustomerRepository(c.env.DB);
  const customer = await customerRepo.getById(id);

  if (!customer) {
    return c.json({ error: 'Customer not found' }, 404);
  }

  return c.json(customer);
});

app.patch('/api/customers/:id/points', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const customerRepo = new CustomerRepository(c.env.DB);

  await customerRepo.adjustPoints(id, body.adjustment);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Promotions
// ============================================

app.get('/api/promotions', async (c) => {
  const promoRepo = new PromotionRepository(c.env.DB);
  const promotions = await promoRepo.getActive();
  return c.json(promotions);
});

app.get('/api/promotions/validate/:code', async (c) => {
  const code = c.req.param('code');
  const subtotal = parseFloat(c.req.query('subtotal') || '0');
  const promoRepo = new PromotionRepository(c.env.DB);

  const promo = await promoRepo.getByCode(code.toUpperCase());
  if (!promo) {
    return c.json({ valid: false, error: 'Invalid promo code' });
  }

  if (!promo.is_active) {
    return c.json({ valid: false, error: 'This promo code is inactive' });
  }

  const now = new Date();
  const start = new Date(promo.start_date);
  const end = new Date(promo.end_date);

  if (now < start) {
    return c.json({ valid: false, error: 'This promo code is not yet active' });
  }

  if (now > end) {
    return c.json({ valid: false, error: 'This promo code has expired' });
  }

  if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
    return c.json({ valid: false, error: 'This promo code has reached its usage limit' });
  }

  if (subtotal < promo.min_order_value) {
    return c.json({ valid: false, error: `Minimum order of $${promo.min_order_value} required` });
  }

  let discount = 0;
  if (promo.discount_type === 'percentage') {
    discount = subtotal * (promo.discount_value / 100);
  } else {
    discount = promo.discount_value;
  }

  return c.json({
    valid: true,
    discount,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    name: promo.name
  });
});

app.post('/api/promotions', async (c) => {
  const body = await c.req.parseBody();
  const promoRepo = new PromotionRepository(c.env.DB);

  await promoRepo.create({
    name: body.name as string,
    description: body.description as string || null,
    code: (body.code as string).toUpperCase(),
    discount_type: body.discount_type as 'percentage' | 'fixed',
    discount_value: parseFloat(body.discount_value as string),
    min_order_value: parseFloat(body.min_order_value as string) || 0,
    max_uses: parseInt(body.max_uses as string) || 0,
    used_count: 0,
    start_date: body.start_date as string,
    end_date: body.end_date as string,
    is_active: body.is_active ? 1 : 0
  });

  return c.redirect('/admin/promotions');
});

app.post('/api/promotions/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.parseBody();
  const promoRepo = new PromotionRepository(c.env.DB);

  await promoRepo.update(id, {
    name: body.name as string,
    description: body.description as string || null,
    code: (body.code as string).toUpperCase(),
    discount_type: body.discount_type as 'percentage' | 'fixed',
    discount_value: parseFloat(body.discount_value as string),
    min_order_value: parseFloat(body.min_order_value as string) || 0,
    max_uses: parseInt(body.max_uses as string) || 0,
    start_date: body.start_date as string,
    end_date: body.end_date as string,
    is_active: body.is_active ? 1 : 0
  });

  return c.redirect('/admin/promotions');
});

app.delete('/api/promotions/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const promoRepo = new PromotionRepository(c.env.DB);
  await promoRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Loyalty Tiers
// ============================================

app.get('/api/loyalty', async (c) => {
  const tierRepo = new LoyaltyTierRepository(c.env.DB);
  const tiers = await tierRepo.getActive();
  return c.json(tiers);
});

app.post('/api/loyalty', async (c) => {
  const body = await c.req.json();
  const tierRepo = new LoyaltyTierRepository(c.env.DB);

  const id = await tierRepo.create({
    name: body.name,
    min_points: body.min_points,
    points_multiplier: body.points_multiplier,
    benefits: body.benefits,
    color: body.color,
    icon: body.icon,
    sort_order: body.sort_order || 0,
    is_active: body.is_active
  });

  return c.json({ success: true, id });
});

app.put('/api/loyalty/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const tierRepo = new LoyaltyTierRepository(c.env.DB);

  await tierRepo.update(id, body);
  return c.json({ success: true });
});

app.delete('/api/loyalty/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const tierRepo = new LoyaltyTierRepository(c.env.DB);
  await tierRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Automations
// ============================================

// ============================================
// API ROUTES - Email Templates
// ============================================

app.get('/api/email-templates', async (c) => {
  const emailRepo = new EmailTemplateRepository(c.env.DB);
  const templates = await emailRepo.getAll();
  return c.json(templates);
});

app.post('/api/email-templates', async (c) => {
  const body = await c.req.json();
  const emailRepo = new EmailTemplateRepository(c.env.DB);

  const id = await emailRepo.create({
    name: body.name,
    subject: body.subject,
    body_html: body.body_html,
    body_json: body.body_json,
    variables: body.variables || '[]',
    category: body.category || 'other',
    is_active: body.is_active
  });

  return c.json({ success: true, id });
});

app.put('/api/email-templates/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const emailRepo = new EmailTemplateRepository(c.env.DB);

  await emailRepo.update(id, body);
  return c.json({ success: true });
});

app.post('/api/email-templates/:id/duplicate', async (c) => {
  const id = parseInt(c.req.param('id'));
  const emailRepo = new EmailTemplateRepository(c.env.DB);
  const newId = await emailRepo.duplicate(id);
  return c.json({ success: true, id: newId });
});

app.delete('/api/email-templates/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const emailRepo = new EmailTemplateRepository(c.env.DB);
  await emailRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - SMS Templates
// ============================================

app.get('/api/sms-templates', async (c) => {
  const smsRepo = new SmsTemplateRepository(c.env.DB);
  const templates = await smsRepo.getAll();
  return c.json(templates);
});

app.post('/api/sms-templates', async (c) => {
  const body = await c.req.json();
  const smsRepo = new SmsTemplateRepository(c.env.DB);

  const id = await smsRepo.create({
    name: body.name,
    body: body.body,
    variables: body.variables || '[]',
    category: body.category || 'other',
    is_active: body.is_active
  });

  return c.json({ success: true, id });
});

app.put('/api/sms-templates/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const smsRepo = new SmsTemplateRepository(c.env.DB);

  await smsRepo.update(id, body);
  return c.json({ success: true });
});

app.delete('/api/sms-templates/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const smsRepo = new SmsTemplateRepository(c.env.DB);
  await smsRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Communication Logs
// ============================================

app.get('/api/communication-logs', async (c) => {
  const logRepo = new CommunicationLogRepository(c.env.DB);
  const logs = await logRepo.getAll(100);
  return c.json(logs);
});

app.post('/api/communication-logs/:id/retry', async (c) => {
  const id = parseInt(c.req.param('id'));
  const logRepo = new CommunicationLogRepository(c.env.DB);
  await logRepo.updateStatus(id, 'pending');
  return c.json({ success: true, message: 'Queued for retry' });
});

// ============================================
// API ROUTES - Customer Segments
// ============================================

app.get('/api/segments', async (c) => {
  const segmentRepo = new SegmentRepository(c.env.DB);
  const segments = await segmentRepo.getAll();
  return c.json(segments);
});

app.post('/api/segments', async (c) => {
  const body = await c.req.json();
  const segmentRepo = new SegmentRepository(c.env.DB);

  const id = await segmentRepo.create({
    name: body.name,
    description: body.description || '',
    rules: body.rules || '[]',
    is_dynamic: body.is_dynamic,
    is_active: body.is_active
  });

  return c.json({ success: true, id });
});

app.put('/api/segments/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const segmentRepo = new SegmentRepository(c.env.DB);

  await segmentRepo.update(id, body);
  return c.json({ success: true });
});

app.post('/api/segments/:id/refresh', async (c) => {
  const id = parseInt(c.req.param('id'));
  const segmentRepo = new SegmentRepository(c.env.DB);
  const customerRepo = new CustomerRepository(c.env.DB);

  const segment = await segmentRepo.getById(id);
  if (!segment) {
    return c.json({ error: 'Segment not found' }, 404);
  }

  // Get all customers and apply rules
  const customers = await customerRepo.getAll();
  const rules = JSON.parse(segment.rules || '[]');

  // Simple rule matching (in production, this would be more sophisticated)
  let matchedCustomers = customers;
  for (const rule of rules) {
    matchedCustomers = matchedCustomers.filter((cust: any) => {
      const value = cust[rule.field];
      switch (rule.operator) {
        case 'equals': return value == rule.value;
        case 'not_equals': return value != rule.value;
        case 'greater_than': return value > parseFloat(rule.value);
        case 'less_than': return value < parseFloat(rule.value);
        default: return true;
      }
    });
  }

  await segmentRepo.updateCustomerCount(id, matchedCustomers.length);
  return c.json({ success: true, count: matchedCustomers.length });
});

app.delete('/api/segments/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const segmentRepo = new SegmentRepository(c.env.DB);
  await segmentRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Voucher Codes
// ============================================

app.get('/api/vouchers', async (c) => {
  const voucherRepo = new VoucherRepository(c.env.DB);
  const vouchers = await voucherRepo.getAll(100);
  return c.json(vouchers);
});

app.post('/api/vouchers', async (c) => {
  const body = await c.req.json();
  const voucherRepo = new VoucherRepository(c.env.DB);

  // Check if code exists
  const existing = await voucherRepo.getByCode(body.code);
  if (existing) {
    return c.json({ error: 'Code already exists' }, 400);
  }

  const id = await voucherRepo.create({
    code: body.code,
    batch_id: null,
    promotion_id: null,
    discount_type: body.discount_type,
    discount_value: body.discount_value,
    min_order_value: body.min_order_value || 0,
    max_discount: body.max_discount,
    is_single_use: body.is_single_use,
    customer_id: body.customer_id || null,
    segment_id: body.segment_id || null,
    valid_from: body.valid_from,
    valid_until: body.valid_until,
    status: 'active'
  });

  return c.json({ success: true, id });
});

app.post('/api/vouchers/batch', async (c) => {
  const body = await c.req.json();
  const voucherRepo = new VoucherRepository(c.env.DB);
  const batchRepo = new VoucherBatchRepository(c.env.DB);

  // Create batch record
  const batchId = await batchRepo.create({
    name: body.name,
    code_prefix: body.code_prefix || '',
    total_codes: body.quantity,
    codes_used: 0,
    discount_type: body.discount_type,
    discount_value: body.discount_value,
    min_order_value: body.min_order_value || 0,
    max_discount: body.max_discount,
    valid_from: body.valid_from,
    valid_until: body.valid_until,
    segment_id: body.segment_id || null
  });

  // Generate voucher codes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = body.code_length || 8;
  const prefix = body.code_prefix ? body.code_prefix + '-' : '';

  for (let i = 0; i < body.quantity; i++) {
    let code = prefix;
    for (let j = 0; j < codeLength; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    await voucherRepo.create({
      code,
      batch_id: batchId,
      promotion_id: null,
      discount_type: body.discount_type,
      discount_value: body.discount_value,
      min_order_value: body.min_order_value || 0,
      max_discount: body.max_discount,
      is_single_use: body.is_single_use,
      customer_id: null,
      segment_id: body.segment_id || null,
      valid_from: body.valid_from,
      valid_until: body.valid_until,
      status: 'active'
    });
  }

  return c.json({ success: true, batchId, count: body.quantity });
});

app.post('/api/vouchers/:id/revoke', async (c) => {
  const id = parseInt(c.req.param('id'));
  const voucherRepo = new VoucherRepository(c.env.DB);
  await voucherRepo.updateStatus(id, 'revoked');
  return c.json({ success: true });
});

app.post('/api/vouchers/:id/reactivate', async (c) => {
  const id = parseInt(c.req.param('id'));
  const voucherRepo = new VoucherRepository(c.env.DB);
  await voucherRepo.updateStatus(id, 'active');
  return c.json({ success: true });
});

app.get('/api/vouchers/batch/:id/export', async (c) => {
  const batchId = parseInt(c.req.param('id'));
  const voucherRepo = new VoucherRepository(c.env.DB);
  const batchRepo = new VoucherBatchRepository(c.env.DB);

  const batch = await batchRepo.getById(batchId);
  const vouchers = await voucherRepo.getByBatch(batchId);

  if (!batch) {
    return c.json({ error: 'Batch not found' }, 404);
  }

  // Generate CSV
  let csv = 'Code,Status,Discount Type,Discount Value,Valid From,Valid Until\n';
  for (const v of vouchers) {
    csv += `${v.code},${v.status},${v.discount_type},${v.discount_value},${v.valid_from},${v.valid_until}\n`;
  }

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${batch.name.replace(/[^a-z0-9]/gi, '_')}_vouchers.csv"`
    }
  });
});

app.delete('/api/vouchers/batch/:id', async (c) => {
  const batchId = parseInt(c.req.param('id'));
  const voucherRepo = new VoucherRepository(c.env.DB);
  const batchRepo = new VoucherBatchRepository(c.env.DB);

  await voucherRepo.deleteByBatch(batchId);
  await batchRepo.delete(batchId);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Points Earning Rules
// ============================================

app.get('/api/earning-rules', async (c) => {
  const earningRepo = new PointsEarningRepository(c.env.DB);
  const rules = await earningRepo.getAll();
  return c.json(rules);
});

app.post('/api/earning-rules', async (c) => {
  const body = await c.req.json();
  const earningRepo = new PointsEarningRepository(c.env.DB);

  const id = await earningRepo.create({
    name: body.name,
    description: body.description || '',
    trigger_type: body.trigger_type,
    points_type: body.points_type,
    points_value: body.points_value,
    conditions: body.conditions || '{}',
    segment_id: body.segment_id || null,
    tier_multiplier_enabled: body.tier_multiplier_enabled,
    is_active: body.is_active,
    start_date: body.start_date || null,
    end_date: body.end_date || null
  });

  return c.json({ success: true, id });
});

app.put('/api/earning-rules/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const earningRepo = new PointsEarningRepository(c.env.DB);

  await earningRepo.update(id, body);
  return c.json({ success: true });
});

app.put('/api/earning-rules/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'));
  const earningRepo = new PointsEarningRepository(c.env.DB);
  await earningRepo.toggleActive(id);
  return c.json({ success: true });
});

app.post('/api/earning-rules/:id/duplicate', async (c) => {
  const id = parseInt(c.req.param('id'));
  const earningRepo = new PointsEarningRepository(c.env.DB);
  const original = await earningRepo.getById(id);

  if (!original) {
    return c.json({ error: 'Not found' }, 404);
  }

  const newId = await earningRepo.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    trigger_type: original.trigger_type,
    points_type: original.points_type,
    points_value: original.points_value,
    conditions: original.conditions,
    segment_id: original.segment_id,
    tier_multiplier_enabled: original.tier_multiplier_enabled,
    is_active: 0,
    start_date: original.start_date,
    end_date: original.end_date
  });

  return c.json({ success: true, id: newId });
});

app.delete('/api/earning-rules/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const earningRepo = new PointsEarningRepository(c.env.DB);
  await earningRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Loyalty Challenges
// ============================================

app.get('/api/challenges', async (c) => {
  const challengeRepo = new ChallengeRepository(c.env.DB);
  const challenges = await challengeRepo.getAll();
  return c.json(challenges);
});

app.post('/api/challenges', async (c) => {
  const body = await c.req.json();
  const challengeRepo = new ChallengeRepository(c.env.DB);

  const id = await challengeRepo.create({
    name: body.name,
    description: body.description || '',
    image_url: body.image_url || null,
    challenge_type: body.challenge_type,
    target_value: body.target_value,
    target_config: body.target_config || '{}',
    reward_type: body.reward_type,
    reward_value: body.reward_value,
    duration_days: body.duration_days || null,
    max_completions: body.max_completions || 1,
    segment_id: body.segment_id || null,
    is_active: body.is_active,
    start_date: body.start_date || null,
    end_date: body.end_date || null
  });

  return c.json({ success: true, id });
});

app.put('/api/challenges/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const challengeRepo = new ChallengeRepository(c.env.DB);

  await challengeRepo.update(id, body);
  return c.json({ success: true });
});

app.delete('/api/challenges/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const challengeRepo = new ChallengeRepository(c.env.DB);
  await challengeRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - Rewards Catalog
// ============================================

app.get('/api/rewards', async (c) => {
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);
  const rewards = await rewardsRepo.getAll();
  return c.json(rewards);
});

app.post('/api/rewards', async (c) => {
  const body = await c.req.json();
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);

  const id = await rewardsRepo.create({
    name: body.name,
    description: body.description || '',
    image_url: body.image_url || null,
    reward_type: body.reward_type,
    reward_config: body.reward_config || '{}',
    points_cost: body.points_cost,
    tier_required: body.tier_required || null,
    quantity_available: body.quantity_available || null,
    segment_id: body.segment_id || null,
    is_active: body.is_active,
    start_date: body.start_date || null,
    end_date: body.end_date || null
  });

  return c.json({ success: true, id });
});

app.put('/api/rewards/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);

  await rewardsRepo.update(id, body);
  return c.json({ success: true });
});

app.put('/api/rewards/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'));
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);
  const reward = await rewardsRepo.getById(id);

  if (!reward) {
    return c.json({ error: 'Not found' }, 404);
  }

  await rewardsRepo.update(id, { is_active: reward.is_active ? 0 : 1 });
  return c.json({ success: true });
});

app.delete('/api/rewards/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const rewardsRepo = new RewardsCatalogRepository(c.env.DB);
  await rewardsRepo.delete(id);
  return c.json({ success: true });
});

// ============================================
// API ROUTES - CMS
// ============================================

app.post('/api/cms/pages', async (c) => {
  const data = await c.req.json();
  const result = await c.env.DB.prepare(
    'INSERT INTO cms_pages (slug, title, content, meta_title, meta_description, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now")) RETURNING id'
  ).bind(data.slug, data.title, data.content, data.meta_title, data.meta_description, data.is_published).first();
  return c.json({ success: true, id: result?.id });
});

app.put('/api/cms/pages/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const data = await c.req.json();
  await c.env.DB.prepare(
    'UPDATE cms_pages SET slug = ?, title = ?, content = ?, meta_title = ?, meta_description = ?, is_published = ?, updated_at = datetime("now") WHERE id = ?'
  ).bind(data.slug, data.title, data.content, data.meta_title, data.meta_description, data.is_published, id).run();
  return c.json({ success: true });
});

app.delete('/api/cms/pages/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  await c.env.DB.prepare('DELETE FROM cms_pages WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

app.put('/api/cms/settings', async (c) => {
  const data = await c.req.json();
  for (const [key, value] of Object.entries(data)) {
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO cms_settings (key, value, updated_at) VALUES (?, ?, datetime("now"))'
    ).bind(key, value as string).run();
  }
  return c.json({ success: true });
});

// Customer notes API
app.put('/api/customers/:id/notes', async (c) => {
  const id = parseInt(c.req.param('id'));
  const { notes } = await c.req.json();
  await c.env.DB.prepare('UPDATE customers SET notes = ? WHERE id = ?').bind(notes, id).run();
  return c.json({ success: true });
});

// ============================================
// ERROR HANDLING
// ============================================

app.notFound((c) => {
  return c.html(
    <html>
      <head>
        <title>404 - Not Found</title>
        <style>{`
          body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; }
          h1 { font-size: 72px; margin: 0; color: #E85D04; }
          p { color: #666; margin: 20px 0; }
          a { color: #E85D04; text-decoration: none; }
          a:hover { text-decoration: underline; }
        `}</style>
      </head>
      <body>
        <div class="container">
          <h1>404</h1>
          <p>Page not found</p>
          <a href="/">Go back home</a>
        </div>
      </body>
    </html>,
    404
  );
});

app.onError((err, c) => {
  console.error('Error:', err);
  return c.html(
    <html>
      <head>
        <title>Error</title>
        <style>{`
          body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; max-width: 500px; }
          h1 { color: #DC2F02; }
          p { color: #666; }
          a { color: #E85D04; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div class="container">
          <h1>Something went wrong</h1>
          <p>We're sorry, an error occurred. Please try again later.</p>
          <a href="/">Go back home</a>
        </div>
      </body>
    </html>,
    500
  );
});

// ============================================
// API ROUTES - Stock & Ingredients
// ============================================

app.get('/api/ingredients', async (c) => {
  const ingredientRepo = new IngredientRepository(c.env.DB);
  return c.json(await ingredientRepo.getAll());
});

app.post('/api/ingredients', async (c) => {
  const body = await c.req.json();
  const ingredientRepo = new IngredientRepository(c.env.DB);
  const id = await ingredientRepo.create(body);
  return c.json({ success: true, id });
});

app.put('/api/ingredients/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const ingredientRepo = new IngredientRepository(c.env.DB);
  await ingredientRepo.update(id, body);
  return c.json({ success: true });
});

app.delete('/api/ingredients/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const ingredientRepo = new IngredientRepository(c.env.DB);
  await ingredientRepo.delete(id);
  return c.json({ success: true });
});

app.get('/api/stock', async (c) => {
  const branchId = c.req.query('branch') ? parseInt(c.req.query('branch')!) : undefined;
  const stockRepo = new StockLevelRepository(c.env.DB);
  return c.json(await stockRepo.getAll(branchId));
});

app.get('/api/stock/low', async (c) => {
  const branchId = c.req.query('branch') ? parseInt(c.req.query('branch')!) : undefined;
  const stockRepo = new StockLevelRepository(c.env.DB);
  return c.json(await stockRepo.getLowStock(branchId));
});

app.post('/api/stock/adjust', async (c) => {
  const body = await c.req.json();
  const stockRepo = new StockLevelRepository(c.env.DB);

  if (body.adjust_type === 'set') {
    await stockRepo.updateStock(body.branch_id, body.ingredient_id, body.quantity);
  } else if (body.adjust_type === 'add') {
    await stockRepo.adjustStock(body.branch_id, body.ingredient_id, body.quantity);
  } else if (body.adjust_type === 'subtract') {
    await stockRepo.adjustStock(body.branch_id, body.ingredient_id, -body.quantity);
  }

  return c.json({ success: true });
});

app.put('/api/menu/:id/ingredients', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const menuIngRepo = new MenuItemIngredientRepository(c.env.DB);
  await menuIngRepo.setIngredients(id, body.ingredients);
  return c.json({ success: true });
});

app.get('/api/stock/usage', async (c) => {
  const startDate = c.req.query('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = c.req.query('end') || new Date().toISOString().split('T')[0];
  const branchId = c.req.query('branch') ? parseInt(c.req.query('branch')!) : undefined;
  const usageRepo = new StockUsageLogRepository(c.env.DB);
  return c.json(await usageRepo.getUsageReport(startDate, endDate, branchId));
});

// ============================================
// API ROUTES - Reservations
// ============================================

app.get('/api/reservations', async (c) => {
  const status = c.req.query('status');
  const branchId = c.req.query('branch');
  const reservationRepo = new ReservationRepository(c.env.DB);

  if (status) {
    return c.json(await reservationRepo.getByStatus(status));
  } else if (branchId) {
    return c.json(await reservationRepo.getByBranch(parseInt(branchId)));
  }

  return c.json(await reservationRepo.getAll());
});

app.get('/api/reservations/upcoming', async (c) => {
  const reservationRepo = new ReservationRepository(c.env.DB);
  return c.json(await reservationRepo.getUpcoming());
});

app.get('/api/reservations/stats', async (c) => {
  const reservationRepo = new ReservationRepository(c.env.DB);
  return c.json(await reservationRepo.getStats());
});

app.get('/api/reservations/customer/:customerId', async (c) => {
  const customerId = parseInt(c.req.param('customerId'));
  const reservationRepo = new ReservationRepository(c.env.DB);
  return c.json(await reservationRepo.getByCustomer(customerId));
});

app.get('/api/reservations/phone/:phone', async (c) => {
  const phone = c.req.param('phone');
  const reservationRepo = new ReservationRepository(c.env.DB);
  return c.json(await reservationRepo.getByPhone(phone));
});

app.get('/api/reservations/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const reservationRepo = new ReservationRepository(c.env.DB);
  const reservation = await reservationRepo.getById(id);

  if (!reservation) {
    return c.json({ error: 'Reservation not found' }, 404);
  }

  return c.json(reservation);
});

app.post('/api/reservations', async (c) => {
  try {
    const body = await c.req.json();
    const reservationRepo = new ReservationRepository(c.env.DB);

    // Validate required fields
    if (!body.branch_id || !body.reservation_date || !body.reservation_time || !body.party_size) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // If no customer_id, guest info is required
    if (!body.customer_id && (!body.guest_name || !body.guest_phone)) {
      return c.json({ error: 'Guest name and phone are required for non-registered users' }, 400);
    }

    const id = await reservationRepo.create({
      branch_id: body.branch_id,
      customer_id: body.customer_id || null,
      guest_name: body.guest_name || null,
      guest_email: body.guest_email || null,
      guest_phone: body.guest_phone || null,
      reservation_date: body.reservation_date,
      reservation_time: body.reservation_time,
      party_size: body.party_size,
      notes: body.notes || null
    });

    return c.json({ success: true, id });
  } catch (error) {
    console.error('Reservation creation error:', error);
    return c.json({ error: 'Failed to create reservation' }, 500);
  }
});

app.patch('/api/reservations/:id/status', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const reservationRepo = new ReservationRepository(c.env.DB);

  await reservationRepo.updateStatus(id, body.status, body.admin_notes);
  return c.json({ success: true });
});

app.patch('/api/reservations/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const reservationRepo = new ReservationRepository(c.env.DB);

  await reservationRepo.update(id, body);
  return c.json({ success: true });
});

app.delete('/api/reservations/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const reservationRepo = new ReservationRepository(c.env.DB);

  await reservationRepo.delete(id);
  return c.json({ success: true });
});

export default app;
