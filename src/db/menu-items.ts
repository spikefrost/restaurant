import type { MenuItem, MenuItemWithCategory } from '../types';

export class MenuItemRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<MenuItemWithCategory[]> {
    const { results } = await this.db
      .prepare(`
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        ORDER BY c.sort_order ASC, m.name ASC
      `)
      .all<MenuItemWithCategory>();
    return results || [];
  }

  async getAvailable(): Promise<MenuItemWithCategory[]> {
    const { results } = await this.db
      .prepare(`
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        WHERE m.is_available = 1 AND c.is_active = 1
        ORDER BY c.sort_order ASC, m.name ASC
      `)
      .all<MenuItemWithCategory>();
    return results || [];
  }

  async getByCategory(categoryId: number): Promise<MenuItem[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM menu_items WHERE category_id = ? AND is_available = 1 ORDER BY name ASC')
      .bind(categoryId)
      .all<MenuItem>();
    return results || [];
  }

  async getPopular(limit: number = 6): Promise<MenuItem[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM menu_items WHERE is_popular = 1 AND is_available = 1 ORDER BY name ASC LIMIT ?')
      .bind(limit)
      .all<MenuItem>();
    return results || [];
  }

  async getById(id: number): Promise<MenuItem | null> {
    return await this.db
      .prepare('SELECT * FROM menu_items WHERE id = ?')
      .bind(id)
      .first<MenuItem>();
  }

  async search(query: string): Promise<MenuItem[]> {
    const { results } = await this.db
      .prepare(`
        SELECT * FROM menu_items
        WHERE is_available = 1 AND (name LIKE ? OR description LIKE ?)
        ORDER BY name ASC
      `)
      .bind(`%${query}%`, `%${query}%`)
      .all<MenuItem>();
    return results || [];
  }

  async create(data: Omit<MenuItem, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO menu_items (
          category_id, name, description, price, image_url, calories,
          is_vegetarian, is_vegan, is_gluten_free, allergens,
          is_popular, is_new, is_available, prep_time_minutes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        data.category_id, data.name, data.description, data.price, data.image_url, data.calories,
        data.is_vegetarian, data.is_vegan, data.is_gluten_free, data.allergens,
        data.is_popular, data.is_new, data.is_available, data.prep_time_minutes
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<MenuItem>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
    if (data.calories !== undefined) { fields.push('calories = ?'); values.push(data.calories); }
    if (data.is_vegetarian !== undefined) { fields.push('is_vegetarian = ?'); values.push(data.is_vegetarian); }
    if (data.is_vegan !== undefined) { fields.push('is_vegan = ?'); values.push(data.is_vegan); }
    if (data.is_gluten_free !== undefined) { fields.push('is_gluten_free = ?'); values.push(data.is_gluten_free); }
    if (data.allergens !== undefined) { fields.push('allergens = ?'); values.push(data.allergens); }
    if (data.is_popular !== undefined) { fields.push('is_popular = ?'); values.push(data.is_popular); }
    if (data.is_new !== undefined) { fields.push('is_new = ?'); values.push(data.is_new); }
    if (data.is_available !== undefined) { fields.push('is_available = ?'); values.push(data.is_available); }
    if (data.prep_time_minutes !== undefined) { fields.push('prep_time_minutes = ?'); values.push(data.prep_time_minutes); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM menu_items WHERE id = ?').bind(id).run();
  }

  async toggleAvailability(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE menu_items SET is_available = NOT is_available WHERE id = ?')
      .bind(id)
      .run();
  }

  async bulkCreate(items: Omit<MenuItem, 'id' | 'created_at'>[]): Promise<number> {
    let imported = 0;
    for (const item of items) {
      try {
        await this.db
          .prepare(`
            INSERT INTO menu_items (
              category_id, name, description, price, image_url, calories,
              is_vegetarian, is_vegan, is_gluten_free, allergens,
              is_popular, is_new, is_available, prep_time_minutes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            item.category_id,
            item.name,
            item.description || null,
            item.price,
            item.image_url || null,
            item.calories || null,
            item.is_vegetarian || 0,
            item.is_vegan || 0,
            item.is_gluten_free || 0,
            item.allergens || null,
            item.is_popular || 0,
            item.is_new || 0,
            item.is_available ?? 1,
            item.prep_time_minutes || 15
          )
          .run();
        imported++;
      } catch (err) {
        console.error('Failed to insert item:', item.name, err);
      }
    }
    return imported;
  }
}
