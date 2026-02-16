import type { Branch } from '../types';

export class BranchRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Branch[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM branches ORDER BY name ASC')
      .all<Branch>();
    return results || [];
  }

  async getActive(): Promise<Branch[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM branches WHERE is_active = 1 ORDER BY name ASC')
      .all<Branch>();
    return results || [];
  }

  async getById(id: number): Promise<Branch | null> {
    return await this.db
      .prepare('SELECT * FROM branches WHERE id = ?')
      .bind(id)
      .first<Branch>();
  }

  async create(data: Omit<Branch, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO branches (name, address, phone, email, opening_hours, closing_hours, is_active, features, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.name,
        data.address,
        data.phone,
        data.email,
        data.opening_hours,
        data.closing_hours,
        data.is_active,
        data.features,
        data.image_url
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<Branch>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.opening_hours !== undefined) { fields.push('opening_hours = ?'); values.push(data.opening_hours); }
    if (data.closing_hours !== undefined) { fields.push('closing_hours = ?'); values.push(data.closing_hours); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
    if (data.features !== undefined) { fields.push('features = ?'); values.push(data.features); }
    if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE branches SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM branches WHERE id = ?').bind(id).run();
  }
}
