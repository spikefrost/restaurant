import type { Promotion } from '../types';

export class PromotionRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Promotion[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM promotions ORDER BY created_at DESC')
      .all<Promotion>();
    return results || [];
  }

  async getActive(): Promise<Promotion[]> {
    const { results } = await this.db
      .prepare(`
        SELECT * FROM promotions
        WHERE is_active = 1 AND start_date <= DATE('now') AND end_date >= DATE('now')
        ORDER BY created_at DESC
      `)
      .all<Promotion>();
    return results || [];
  }

  async getById(id: number): Promise<Promotion | null> {
    return await this.db
      .prepare('SELECT * FROM promotions WHERE id = ?')
      .bind(id)
      .first<Promotion>();
  }

  async getByCode(code: string): Promise<Promotion | null> {
    return await this.db
      .prepare(`
        SELECT * FROM promotions
        WHERE code = ? AND is_active = 1 AND start_date <= DATE('now') AND end_date >= DATE('now')
      `)
      .bind(code.toUpperCase())
      .first<Promotion>();
  }

  async create(data: Omit<Promotion, 'id' | 'created_at' | 'used_count'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO promotions (name, description, code, discount_type, discount_value, min_order_value, max_uses, used_count, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.name, data.description, data.code.toUpperCase(), data.discount_type,
        data.discount_value, data.min_order_value, data.max_uses,
        data.start_date, data.end_date, data.is_active
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<Promotion>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code.toUpperCase()); }
    if (data.discount_type !== undefined) { fields.push('discount_type = ?'); values.push(data.discount_type); }
    if (data.discount_value !== undefined) { fields.push('discount_value = ?'); values.push(data.discount_value); }
    if (data.min_order_value !== undefined) { fields.push('min_order_value = ?'); values.push(data.min_order_value); }
    if (data.max_uses !== undefined) { fields.push('max_uses = ?'); values.push(data.max_uses); }
    if (data.start_date !== undefined) { fields.push('start_date = ?'); values.push(data.start_date); }
    if (data.end_date !== undefined) { fields.push('end_date = ?'); values.push(data.end_date); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE promotions SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async incrementUsage(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?')
      .bind(id)
      .run();
  }

  async validatePromo(code: string, orderTotal: number): Promise<{ valid: boolean; promotion?: Promotion; error?: string }> {
    const promo = await this.getByCode(code);

    if (!promo) {
      return { valid: false, error: 'Invalid promo code' };
    }

    if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) {
      return { valid: false, error: 'Promo code has reached maximum uses' };
    }

    if (orderTotal < promo.min_order_value) {
      return { valid: false, error: `Minimum order value is ${promo.min_order_value}` };
    }

    return { valid: true, promotion: promo };
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM promotions WHERE id = ?').bind(id).run();
  }
}
