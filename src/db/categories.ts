import type { Category } from '../types';

export class CategoryRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Category[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
      .all<Category>();
    return results || [];
  }

  async getActive(): Promise<Category[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC')
      .all<Category>();
    return results || [];
  }

  async getById(id: number): Promise<Category | null> {
    return await this.db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .bind(id)
      .first<Category>();
  }

  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO categories (name, description, image_url, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(data.name, data.description, data.image_url, data.sort_order, data.is_active)
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<Category>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  }
}
