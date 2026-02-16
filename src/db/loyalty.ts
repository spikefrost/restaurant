import type { LoyaltyTier } from '../types';

export class LoyaltyTierRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<LoyaltyTier[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM loyalty_tiers ORDER BY sort_order ASC')
      .all<LoyaltyTier>();
    return results || [];
  }

  async getActive(): Promise<LoyaltyTier[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM loyalty_tiers WHERE is_active = 1 ORDER BY sort_order ASC')
      .all<LoyaltyTier>();
    return results || [];
  }

  async getById(id: number): Promise<LoyaltyTier | null> {
    return await this.db
      .prepare('SELECT * FROM loyalty_tiers WHERE id = ?')
      .bind(id)
      .first<LoyaltyTier>();
  }

  async getByPoints(points: number): Promise<LoyaltyTier | null> {
    return await this.db
      .prepare('SELECT * FROM loyalty_tiers WHERE is_active = 1 AND min_points <= ? ORDER BY min_points DESC LIMIT 1')
      .bind(points)
      .first<LoyaltyTier>();
  }

  async create(tier: Omit<LoyaltyTier, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO loyalty_tiers (name, min_points, points_multiplier, benefits, color, icon, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        tier.name,
        tier.min_points,
        tier.points_multiplier,
        tier.benefits,
        tier.color,
        tier.icon,
        tier.sort_order,
        tier.is_active
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, tier: Partial<LoyaltyTier>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (tier.name !== undefined) { fields.push('name = ?'); values.push(tier.name); }
    if (tier.min_points !== undefined) { fields.push('min_points = ?'); values.push(tier.min_points); }
    if (tier.points_multiplier !== undefined) { fields.push('points_multiplier = ?'); values.push(tier.points_multiplier); }
    if (tier.benefits !== undefined) { fields.push('benefits = ?'); values.push(tier.benefits); }
    if (tier.color !== undefined) { fields.push('color = ?'); values.push(tier.color); }
    if (tier.icon !== undefined) { fields.push('icon = ?'); values.push(tier.icon); }
    if (tier.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(tier.sort_order); }
    if (tier.is_active !== undefined) { fields.push('is_active = ?'); values.push(tier.is_active); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE loyalty_tiers SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM loyalty_tiers WHERE id = ?').bind(id).run();
  }
}
