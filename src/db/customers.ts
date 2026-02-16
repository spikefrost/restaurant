import type { Customer, PointsTransaction } from '../types';

export class CustomerRepository {
  constructor(private db: D1Database) {}

  async getAll(limit: number = 100): Promise<Customer[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM customers ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<Customer>();
    return results || [];
  }

  async getById(id: number): Promise<Customer | null> {
    return await this.db
      .prepare('SELECT * FROM customers WHERE id = ?')
      .bind(id)
      .first<Customer>();
  }

  async getByEmail(email: string): Promise<Customer | null> {
    return await this.db
      .prepare('SELECT * FROM customers WHERE email = ?')
      .bind(email)
      .first<Customer>();
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    return await this.db
      .prepare('SELECT * FROM customers WHERE phone = ?')
      .bind(phone)
      .first<Customer>();
  }

  async create(data: {
    name: string;
    phone: string;
    email?: string | null;
    points_balance?: number;
    total_spent?: number;
    total_orders?: number;
    tier?: string;
  }): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO customers (name, phone, email, points_balance, total_spent, total_orders, tier)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.name,
        data.phone,
        data.email || null,
        data.points_balance || 0,
        data.total_spent || 0,
        data.total_orders || 0,
        data.tier || 'Bronze'
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<Customer>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.birthday !== undefined) { fields.push('birthday = ?'); values.push(data.birthday); }
    if (data.points_balance !== undefined) { fields.push('points_balance = ?'); values.push(data.points_balance); }
    if (data.total_spent !== undefined) { fields.push('total_spent = ?'); values.push(data.total_spent); }
    if (data.total_orders !== undefined) { fields.push('total_orders = ?'); values.push(data.total_orders); }
    if (data.tier !== undefined) { fields.push('tier = ?'); values.push(data.tier); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async addPoints(id: number, points: number): Promise<void> {
    await this.db
      .prepare('UPDATE customers SET points_balance = points_balance + ? WHERE id = ?')
      .bind(points, id)
      .run();
  }

  async redeemPoints(id: number, points: number): Promise<boolean> {
    const customer = await this.getById(id);
    if (!customer || customer.points_balance < points) return false;

    await this.db
      .prepare('UPDATE customers SET points_balance = points_balance - ? WHERE id = ?')
      .bind(points, id)
      .run();
    return true;
  }

  async recordOrder(id: number, orderTotal: number, pointsEarned: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE customers SET
          total_orders = total_orders + 1,
          total_spent = total_spent + ?,
          points_balance = points_balance + ?,
          last_order_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(orderTotal, pointsEarned, id)
      .run();
  }

  async getCount(): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM customers')
      .first<{ count: number }>();
    return result?.count || 0;
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
  }

  async updateStats(id: number, orderTotal: number, pointsEarned: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE customers SET
          total_orders = total_orders + 1,
          total_spent = total_spent + ?,
          points_balance = points_balance + ?,
          last_order_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(orderTotal, pointsEarned, id)
      .run();
  }

  async adjustPoints(id: number, adjustment: number): Promise<void> {
    await this.db
      .prepare('UPDATE customers SET points_balance = points_balance + ? WHERE id = ?')
      .bind(adjustment, id)
      .run();
  }
}

export class PointsTransactionRepository {
  constructor(private db: D1Database) {}

  async getByCustomer(customerId: number): Promise<PointsTransaction[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM points_transactions WHERE customer_id = ? ORDER BY created_at DESC')
      .bind(customerId)
      .all<PointsTransaction>();
    return results || [];
  }

  async create(data: Omit<PointsTransaction, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO points_transactions (customer_id, order_id, points, type, description)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(data.customer_id, data.order_id, data.points, data.type, data.description)
      .first<{ id: number }>();
    return result?.id || 0;
  }
}
