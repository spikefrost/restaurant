import type { Ingredient, MenuItemIngredient, StockLevel, StockUsageLog } from '../types';

export class IngredientRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<Ingredient[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM ingredients ORDER BY name')
      .all<Ingredient>();
    return results || [];
  }

  async getById(id: number): Promise<Ingredient | null> {
    return await this.db
      .prepare('SELECT * FROM ingredients WHERE id = ?')
      .bind(id)
      .first<Ingredient>();
  }

  async create(data: Omit<Ingredient, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO ingredients (name, unit, category, cost_per_unit, min_stock_level)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(data.name, data.unit, data.category, data.cost_per_unit, data.min_stock_level)
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<Ingredient>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.unit !== undefined) { fields.push('unit = ?'); values.push(data.unit); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.cost_per_unit !== undefined) { fields.push('cost_per_unit = ?'); values.push(data.cost_per_unit); }
    if (data.min_stock_level !== undefined) { fields.push('min_stock_level = ?'); values.push(data.min_stock_level); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE ingredients SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM ingredients WHERE id = ?').bind(id).run();
  }
}

export class MenuItemIngredientRepository {
  constructor(private db: D1Database) {}

  async getByMenuItem(menuItemId: number): Promise<(MenuItemIngredient & { ingredient_name: string; unit: string })[]> {
    const { results } = await this.db
      .prepare(`
        SELECT mii.*, i.name as ingredient_name, i.unit
        FROM menu_item_ingredients mii
        JOIN ingredients i ON mii.ingredient_id = i.id
        WHERE mii.menu_item_id = ?
      `)
      .bind(menuItemId)
      .all<MenuItemIngredient & { ingredient_name: string; unit: string }>();
    return results || [];
  }

  async setIngredients(menuItemId: number, ingredients: { ingredient_id: number; quantity: number }[]): Promise<void> {
    // Delete existing
    await this.db.prepare('DELETE FROM menu_item_ingredients WHERE menu_item_id = ?').bind(menuItemId).run();

    // Insert new
    for (const ing of ingredients) {
      await this.db
        .prepare('INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity) VALUES (?, ?, ?)')
        .bind(menuItemId, ing.ingredient_id, ing.quantity)
        .run();
    }
  }
}

export class StockLevelRepository {
  constructor(private db: D1Database) {}

  async getAll(branchId?: number): Promise<(StockLevel & { ingredient_name: string; unit: string; min_stock_level: number })[]> {
    let query = `
      SELECT sl.*, i.name as ingredient_name, i.unit, i.min_stock_level
      FROM stock_levels sl
      JOIN ingredients i ON sl.ingredient_id = i.id
    `;

    if (branchId) {
      query += ' WHERE sl.branch_id = ?';
      const { results } = await this.db.prepare(query + ' ORDER BY i.name').bind(branchId).all();
      return (results || []) as any;
    }

    const { results } = await this.db.prepare(query + ' ORDER BY sl.branch_id, i.name').all();
    return (results || []) as any;
  }

  async getLowStock(branchId?: number): Promise<(StockLevel & { ingredient_name: string; unit: string; min_stock_level: number })[]> {
    let query = `
      SELECT sl.*, i.name as ingredient_name, i.unit, i.min_stock_level
      FROM stock_levels sl
      JOIN ingredients i ON sl.ingredient_id = i.id
      WHERE sl.current_quantity <= i.min_stock_level
    `;

    if (branchId) {
      query += ' AND sl.branch_id = ?';
      const { results } = await this.db.prepare(query + ' ORDER BY sl.current_quantity ASC').bind(branchId).all();
      return (results || []) as any;
    }

    const { results } = await this.db.prepare(query + ' ORDER BY sl.current_quantity ASC').all();
    return (results || []) as any;
  }

  async updateStock(branchId: number, ingredientId: number, quantity: number): Promise<void> {
    // Upsert stock level
    await this.db
      .prepare(`
        INSERT INTO stock_levels (branch_id, ingredient_id, current_quantity, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(branch_id, ingredient_id) DO UPDATE SET
          current_quantity = ?,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(branchId, ingredientId, quantity, quantity)
      .run();
  }

  async adjustStock(branchId: number, ingredientId: number, adjustment: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE stock_levels
        SET current_quantity = current_quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE branch_id = ? AND ingredient_id = ?
      `)
      .bind(adjustment, branchId, ingredientId)
      .run();
  }
}

export class StockUsageLogRepository {
  constructor(private db: D1Database) {}

  async logUsage(orderId: number, branchId: number, items: { ingredient_id: number; quantity_used: number }[]): Promise<void> {
    for (const item of items) {
      await this.db
        .prepare(`
          INSERT INTO stock_usage_log (order_id, branch_id, ingredient_id, quantity_used)
          VALUES (?, ?, ?, ?)
        `)
        .bind(orderId, branchId, item.ingredient_id, item.quantity_used)
        .run();
    }
  }

  async getUsageReport(startDate: string, endDate: string, branchId?: number): Promise<{
    ingredient_id: number;
    ingredient_name: string;
    unit: string;
    total_used: number;
    cost: number;
  }[]> {
    let query = `
      SELECT
        sul.ingredient_id,
        i.name as ingredient_name,
        i.unit,
        SUM(sul.quantity_used) as total_used,
        SUM(sul.quantity_used * i.cost_per_unit) as cost
      FROM stock_usage_log sul
      JOIN ingredients i ON sul.ingredient_id = i.id
      WHERE DATE(sul.created_at) BETWEEN ? AND ?
    `;

    const params: any[] = [startDate, endDate];

    if (branchId) {
      query += ' AND sul.branch_id = ?';
      params.push(branchId);
    }

    query += ' GROUP BY sul.ingredient_id ORDER BY total_used DESC';

    const { results } = await this.db.prepare(query).bind(...params).all();
    return (results || []) as any;
  }

  async getDailyUsage(days: number = 7, branchId?: number): Promise<{
    date: string;
    total_items: number;
    total_cost: number;
  }[]> {
    let query = `
      SELECT
        DATE(sul.created_at) as date,
        COUNT(*) as total_items,
        SUM(sul.quantity_used * i.cost_per_unit) as total_cost
      FROM stock_usage_log sul
      JOIN ingredients i ON sul.ingredient_id = i.id
      WHERE DATE(sul.created_at) >= DATE('now', '-' || ? || ' days')
    `;

    const params: any[] = [days];

    if (branchId) {
      query += ' AND sul.branch_id = ?';
      params.push(branchId);
    }

    query += ' GROUP BY DATE(sul.created_at) ORDER BY date DESC';

    const { results } = await this.db.prepare(query).bind(...params).all();
    return (results || []) as any;
  }
}
