import type { Order, OrderWithDetails, OrderItem } from '../types';

export class OrderRepository {
  constructor(private db: D1Database) {}

  async getAll(limit: number = 100): Promise<OrderWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT o.*, b.name as branch_name, COALESCE(c.name, 'Guest') as customer_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN branches b ON o.branch_id = b.id
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `)
      .bind(limit)
      .all<OrderWithDetails>();
    return results || [];
  }

  async getActive(): Promise<OrderWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT o.*, b.name as branch_name, COALESCE(c.name, 'Guest') as customer_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN branches b ON o.branch_id = b.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.status NOT IN ('completed', 'cancelled')
        ORDER BY o.created_at ASC
      `)
      .all<OrderWithDetails>();
    return results || [];
  }

  async getByStatus(status: string): Promise<OrderWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT o.*, b.name as branch_name, COALESCE(c.name, 'Guest') as customer_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN branches b ON o.branch_id = b.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.status = ?
        ORDER BY o.created_at ASC
      `)
      .bind(status)
      .all<OrderWithDetails>();
    return results || [];
  }

  async getById(id: number): Promise<Order | null> {
    return await this.db
      .prepare('SELECT * FROM orders WHERE id = ?')
      .bind(id)
      .first<Order>();
  }

  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.db
      .prepare('SELECT * FROM orders WHERE order_number = ?')
      .bind(orderNumber)
      .first<Order>();
  }

  async getByCustomer(customerId: number): Promise<Order[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC')
      .bind(customerId)
      .all<Order>();
    return results || [];
  }

  async create(data: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO orders (
          order_number, branch_id, customer_id, table_number, order_type,
          status, subtotal, tax, discount, total, points_earned, points_redeemed,
          payment_method, payment_status, special_instructions
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.order_number, data.branch_id, data.customer_id, data.table_number, data.order_type,
        data.status, data.subtotal, data.tax, data.discount, data.total, data.points_earned,
        data.points_redeemed, data.payment_method, data.payment_status, data.special_instructions
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async updateStatus(id: number, status: string): Promise<void> {
    // Track timing based on status transitions
    if (status === 'preparing') {
      // Start prep timer
      await this.db
        .prepare('UPDATE orders SET status = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(status, id)
        .run();
    } else if (status === 'ready') {
      // Complete prep - calculate prep time
      await this.db
        .prepare(`
          UPDATE orders SET
            status = ?,
            completed_at = CURRENT_TIMESTAMP,
            prep_time_seconds = CASE
              WHEN started_at IS NOT NULL THEN CAST((julianday(CURRENT_TIMESTAMP) - julianday(started_at)) * 86400 AS INTEGER)
              ELSE NULL
            END,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(status, id)
        .run();
    } else {
      await this.db
        .prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(status, id)
        .run();
    }
  }

  async getAvgPrepTime(): Promise<number> {
    const result = await this.db
      .prepare(`
        SELECT AVG(prep_time_seconds) as avg_prep_time
        FROM orders
        WHERE prep_time_seconds IS NOT NULL
          AND DATE(created_at) >= DATE('now', '-7 days')
      `)
      .first<{ avg_prep_time: number }>();
    return result?.avg_prep_time || 0;
  }

  async getPrepTimeStats(): Promise<{ avg: number; min: number; max: number; total: number }> {
    const result = await this.db
      .prepare(`
        SELECT
          AVG(prep_time_seconds) as avg,
          MIN(prep_time_seconds) as min,
          MAX(prep_time_seconds) as max,
          COUNT(*) as total
        FROM orders
        WHERE prep_time_seconds IS NOT NULL
          AND DATE(created_at) = DATE('now')
      `)
      .first<{ avg: number; min: number; max: number; total: number }>();
    return result || { avg: 0, min: 0, max: 0, total: 0 };
  }

  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await this.db
      .prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, id)
      .run();
  }

  async getTodayStats(): Promise<{ revenue: number; orders: number; avg: number }> {
    const result = await this.db
      .prepare(`
        SELECT
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders,
          COALESCE(AVG(total), 0) as avg
        FROM orders
        WHERE DATE(created_at) = DATE('now') AND payment_status = 'paid'
      `)
      .first<{ revenue: number; orders: number; avg: number }>();
    return result || { revenue: 0, orders: 0, avg: 0 };
  }

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const result = await this.db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')`)
      .first<{ count: number }>();
    const count = (result?.count || 0) + 1;
    return `ORD-${dateStr}-${count.toString().padStart(4, '0')}`;
  }

  async getActiveByBranch(branchId: number): Promise<OrderWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT o.*, b.name as branch_name, COALESCE(c.name, 'Guest') as customer_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
        FROM orders o
        LEFT JOIN branches b ON o.branch_id = b.id
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.status NOT IN ('completed', 'cancelled') AND o.branch_id = ?
        ORDER BY o.created_at ASC
      `)
      .bind(branchId)
      .all<OrderWithDetails>();
    return results || [];
  }

  async getReportData(startDate: string, endDate: string): Promise<{
    dailySales: { date: string; revenue: number; orders: number; avg: number }[];
    topItems: { name: string; quantity: number; revenue: number }[];
    paymentMethods: { method: string; count: number; amount: number }[];
    orderTypes: { type: string; count: number; amount: number }[];
    summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; totalCustomers: number };
  }> {
    // Daily sales
    const dailySalesResult = await this.db
      .prepare(`
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as orders,
          COALESCE(AVG(total), 0) as avg
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `)
      .bind(startDate, endDate)
      .all<{ date: string; revenue: number; orders: number; avg: number }>();

    // Top items
    const topItemsResult = await this.db
      .prepare(`
        SELECT
          oi.item_name as name,
          SUM(oi.quantity) as quantity,
          SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
          AND o.status != 'cancelled'
        GROUP BY oi.item_name
        ORDER BY quantity DESC
        LIMIT 10
      `)
      .bind(startDate, endDate)
      .all<{ name: string; quantity: number; revenue: number }>();

    // Payment methods
    const paymentMethodsResult = await this.db
      .prepare(`
        SELECT
          payment_method as method,
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as amount
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND status != 'cancelled'
        GROUP BY payment_method
      `)
      .bind(startDate, endDate)
      .all<{ method: string; count: number; amount: number }>();

    // Order types
    const orderTypesResult = await this.db
      .prepare(`
        SELECT
          order_type as type,
          COUNT(*) as count,
          COALESCE(SUM(total), 0) as amount
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND status != 'cancelled'
        GROUP BY order_type
      `)
      .bind(startDate, endDate)
      .all<{ type: string; count: number; amount: number }>();

    // Summary
    const summaryResult = await this.db
      .prepare(`
        SELECT
          COALESCE(SUM(total), 0) as totalRevenue,
          COUNT(*) as totalOrders,
          COALESCE(AVG(total), 0) as avgOrderValue,
          COUNT(DISTINCT customer_id) as totalCustomers
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND status != 'cancelled'
      `)
      .bind(startDate, endDate)
      .first<{ totalRevenue: number; totalOrders: number; avgOrderValue: number; totalCustomers: number }>();

    return {
      dailySales: dailySalesResult.results || [],
      topItems: topItemsResult.results || [],
      paymentMethods: paymentMethodsResult.results || [],
      orderTypes: orderTypesResult.results || [],
      summary: summaryResult || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalCustomers: 0 }
    };
  }
}

export class OrderItemRepository {
  constructor(private db: D1Database) {}

  async getByOrder(orderId: number): Promise<OrderItem[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .bind(orderId)
      .all<OrderItem>();
    return results || [];
  }

  async create(data: Omit<OrderItem, 'id'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO order_items (order_id, item_id, item_name, quantity, unit_price, modifiers, special_instructions, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.order_id, data.item_id, data.item_name, data.quantity,
        data.unit_price, data.modifiers, data.special_instructions, data.subtotal
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async deleteByOrder(orderId: number): Promise<void> {
    await this.db.prepare('DELETE FROM order_items WHERE order_id = ?').bind(orderId).run();
  }
}
