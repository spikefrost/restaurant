import type { CustomerSegment, Customer } from '../types';

export class SegmentRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<CustomerSegment[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM customer_segments ORDER BY name ASC')
      .all<CustomerSegment>();
    return results || [];
  }

  async getActive(): Promise<CustomerSegment[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM customer_segments WHERE is_active = 1 ORDER BY name ASC')
      .all<CustomerSegment>();
    return results || [];
  }

  async getById(id: number): Promise<CustomerSegment | null> {
    return await this.db
      .prepare('SELECT * FROM customer_segments WHERE id = ?')
      .bind(id)
      .first<CustomerSegment>();
  }

  async create(segment: Omit<CustomerSegment, 'id' | 'customer_count' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO customer_segments (name, description, rules, is_dynamic, is_active, customer_count)
        VALUES (?, ?, ?, ?, ?, 0)
        RETURNING id
      `)
      .bind(
        segment.name,
        segment.description,
        segment.rules,
        segment.is_dynamic,
        segment.is_active
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, segment: Partial<CustomerSegment>): Promise<void> {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (segment.name !== undefined) { fields.push('name = ?'); values.push(segment.name); }
    if (segment.description !== undefined) { fields.push('description = ?'); values.push(segment.description); }
    if (segment.rules !== undefined) { fields.push('rules = ?'); values.push(segment.rules); }
    if (segment.is_dynamic !== undefined) { fields.push('is_dynamic = ?'); values.push(segment.is_dynamic); }
    if (segment.is_active !== undefined) { fields.push('is_active = ?'); values.push(segment.is_active); }
    if (segment.customer_count !== undefined) { fields.push('customer_count = ?'); values.push(segment.customer_count); }

    values.push(id);
    await this.db
      .prepare(`UPDATE customer_segments SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM customer_segments WHERE id = ?').bind(id).run();
  }

  async updateCustomerCount(id: number, count: number): Promise<void> {
    await this.db
      .prepare('UPDATE customer_segments SET customer_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(count, id)
      .run();
  }

  async getCustomersInSegment(segmentId: number): Promise<number[]> {
    const { results } = await this.db
      .prepare('SELECT customer_id FROM segment_customers WHERE segment_id = ?')
      .bind(segmentId)
      .all<{ customer_id: number }>();
    return results?.map(r => r.customer_id) || [];
  }

  async addCustomerToSegment(segmentId: number, customerId: number): Promise<void> {
    await this.db
      .prepare('INSERT OR IGNORE INTO segment_customers (segment_id, customer_id) VALUES (?, ?)')
      .bind(segmentId, customerId)
      .run();
  }

  async removeCustomerFromSegment(segmentId: number, customerId: number): Promise<void> {
    await this.db
      .prepare('DELETE FROM segment_customers WHERE segment_id = ? AND customer_id = ?')
      .bind(segmentId, customerId)
      .run();
  }

  async syncDynamicSegment(segmentId: number, customerIds: number[]): Promise<void> {
    // Clear existing
    await this.db
      .prepare('DELETE FROM segment_customers WHERE segment_id = ?')
      .bind(segmentId)
      .run();

    // Add new
    for (const customerId of customerIds) {
      await this.addCustomerToSegment(segmentId, customerId);
    }

    // Update count
    await this.updateCustomerCount(segmentId, customerIds.length);
  }
}
