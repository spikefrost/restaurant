import type { PointsEarningRule, LoyaltyChallenge, CustomerChallengeProgress, LoyaltyReward } from '../types';

// ============================================
// POINTS EARNING RULES
// ============================================

export class PointsEarningRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<PointsEarningRule[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM points_earning_rules ORDER BY name ASC')
      .all<PointsEarningRule>();
    return results || [];
  }

  async getActive(): Promise<PointsEarningRule[]> {
    const now = new Date().toISOString();
    const { results } = await this.db
      .prepare(`
        SELECT * FROM points_earning_rules
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
        ORDER BY name ASC
      `)
      .bind(now, now)
      .all<PointsEarningRule>();
    return results || [];
  }

  async getById(id: number): Promise<PointsEarningRule | null> {
    return await this.db
      .prepare('SELECT * FROM points_earning_rules WHERE id = ?')
      .bind(id)
      .first<PointsEarningRule>();
  }

  async create(rule: Omit<PointsEarningRule, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO points_earning_rules (
          name, description, trigger_type, points_type, points_value,
          conditions, segment_id, tier_multiplier_enabled, is_active,
          start_date, end_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        rule.name,
        rule.description,
        rule.trigger_type,
        rule.points_type,
        rule.points_value,
        rule.conditions,
        rule.segment_id,
        rule.tier_multiplier_enabled,
        rule.is_active,
        rule.start_date,
        rule.end_date
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, rule: Partial<PointsEarningRule>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (rule.name !== undefined) { fields.push('name = ?'); values.push(rule.name); }
    if (rule.description !== undefined) { fields.push('description = ?'); values.push(rule.description); }
    if (rule.trigger_type !== undefined) { fields.push('trigger_type = ?'); values.push(rule.trigger_type); }
    if (rule.points_type !== undefined) { fields.push('points_type = ?'); values.push(rule.points_type); }
    if (rule.points_value !== undefined) { fields.push('points_value = ?'); values.push(rule.points_value); }
    if (rule.conditions !== undefined) { fields.push('conditions = ?'); values.push(rule.conditions); }
    if (rule.segment_id !== undefined) { fields.push('segment_id = ?'); values.push(rule.segment_id); }
    if (rule.tier_multiplier_enabled !== undefined) { fields.push('tier_multiplier_enabled = ?'); values.push(rule.tier_multiplier_enabled); }
    if (rule.is_active !== undefined) { fields.push('is_active = ?'); values.push(rule.is_active); }
    if (rule.start_date !== undefined) { fields.push('start_date = ?'); values.push(rule.start_date); }
    if (rule.end_date !== undefined) { fields.push('end_date = ?'); values.push(rule.end_date); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE points_earning_rules SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM points_earning_rules WHERE id = ?').bind(id).run();
  }

  async toggleActive(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE points_earning_rules SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?')
      .bind(id)
      .run();
  }
}

// ============================================
// LOYALTY CHALLENGES
// ============================================

export class ChallengeRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<LoyaltyChallenge[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM loyalty_challenges ORDER BY created_at DESC')
      .all<LoyaltyChallenge>();
    return results || [];
  }

  async getActive(): Promise<LoyaltyChallenge[]> {
    const now = new Date().toISOString();
    const { results } = await this.db
      .prepare(`
        SELECT * FROM loyalty_challenges
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
        ORDER BY created_at DESC
      `)
      .bind(now, now)
      .all<LoyaltyChallenge>();
    return results || [];
  }

  async getById(id: number): Promise<LoyaltyChallenge | null> {
    return await this.db
      .prepare('SELECT * FROM loyalty_challenges WHERE id = ?')
      .bind(id)
      .first<LoyaltyChallenge>();
  }

  async create(challenge: Omit<LoyaltyChallenge, 'id' | 'participants_count' | 'completions_count' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO loyalty_challenges (
          name, description, image_url, challenge_type, target_value,
          target_config, reward_type, reward_value, duration_days,
          max_completions, segment_id, is_active, start_date, end_date,
          participants_count, completions_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
        RETURNING id
      `)
      .bind(
        challenge.name,
        challenge.description,
        challenge.image_url,
        challenge.challenge_type,
        challenge.target_value,
        challenge.target_config,
        challenge.reward_type,
        challenge.reward_value,
        challenge.duration_days,
        challenge.max_completions,
        challenge.segment_id,
        challenge.is_active,
        challenge.start_date,
        challenge.end_date
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, challenge: Partial<LoyaltyChallenge>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (challenge.name !== undefined) { fields.push('name = ?'); values.push(challenge.name); }
    if (challenge.description !== undefined) { fields.push('description = ?'); values.push(challenge.description); }
    if (challenge.image_url !== undefined) { fields.push('image_url = ?'); values.push(challenge.image_url); }
    if (challenge.challenge_type !== undefined) { fields.push('challenge_type = ?'); values.push(challenge.challenge_type); }
    if (challenge.target_value !== undefined) { fields.push('target_value = ?'); values.push(challenge.target_value); }
    if (challenge.target_config !== undefined) { fields.push('target_config = ?'); values.push(challenge.target_config); }
    if (challenge.reward_type !== undefined) { fields.push('reward_type = ?'); values.push(challenge.reward_type); }
    if (challenge.reward_value !== undefined) { fields.push('reward_value = ?'); values.push(challenge.reward_value); }
    if (challenge.duration_days !== undefined) { fields.push('duration_days = ?'); values.push(challenge.duration_days); }
    if (challenge.max_completions !== undefined) { fields.push('max_completions = ?'); values.push(challenge.max_completions); }
    if (challenge.segment_id !== undefined) { fields.push('segment_id = ?'); values.push(challenge.segment_id); }
    if (challenge.is_active !== undefined) { fields.push('is_active = ?'); values.push(challenge.is_active); }
    if (challenge.start_date !== undefined) { fields.push('start_date = ?'); values.push(challenge.start_date); }
    if (challenge.end_date !== undefined) { fields.push('end_date = ?'); values.push(challenge.end_date); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE loyalty_challenges SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM customer_challenge_progress WHERE challenge_id = ?').bind(id).run();
    await this.db.prepare('DELETE FROM loyalty_challenges WHERE id = ?').bind(id).run();
  }

  async incrementParticipants(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE loyalty_challenges SET participants_count = participants_count + 1 WHERE id = ?')
      .bind(id)
      .run();
  }

  async incrementCompletions(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE loyalty_challenges SET completions_count = completions_count + 1 WHERE id = ?')
      .bind(id)
      .run();
  }

  // Customer Progress
  async getCustomerProgress(customerId: number): Promise<CustomerChallengeProgress[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM customer_challenge_progress WHERE customer_id = ? ORDER BY started_at DESC')
      .bind(customerId)
      .all<CustomerChallengeProgress>();
    return results || [];
  }

  async getProgressForChallenge(challengeId: number, customerId: number): Promise<CustomerChallengeProgress | null> {
    return await this.db
      .prepare('SELECT * FROM customer_challenge_progress WHERE challenge_id = ? AND customer_id = ?')
      .bind(challengeId, customerId)
      .first<CustomerChallengeProgress>();
  }

  async startChallenge(customerId: number, challengeId: number, targetValue: number): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO customer_challenge_progress (customer_id, challenge_id, current_value, target_value, status)
        VALUES (?, ?, 0, ?, 'in_progress')
        RETURNING id
      `)
      .bind(customerId, challengeId, targetValue)
      .first<{ id: number }>();

    await this.incrementParticipants(challengeId);
    return result?.id || 0;
  }

  async updateProgress(id: number, currentValue: number): Promise<void> {
    await this.db
      .prepare('UPDATE customer_challenge_progress SET current_value = ? WHERE id = ?')
      .bind(currentValue, id)
      .run();
  }

  async completeChallenge(id: number): Promise<void> {
    await this.db
      .prepare("UPDATE customer_challenge_progress SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(id)
      .run();
  }
}

// ============================================
// LOYALTY REWARDS CATALOG
// ============================================

export class RewardsCatalogRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<LoyaltyReward[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM loyalty_rewards ORDER BY points_cost ASC')
      .all<LoyaltyReward>();
    return results || [];
  }

  async getActive(): Promise<LoyaltyReward[]> {
    const now = new Date().toISOString();
    const { results } = await this.db
      .prepare(`
        SELECT * FROM loyalty_rewards
        WHERE is_active = 1
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
        AND (quantity_available IS NULL OR quantity_available > quantity_redeemed)
        ORDER BY points_cost ASC
      `)
      .bind(now, now)
      .all<LoyaltyReward>();
    return results || [];
  }

  async getById(id: number): Promise<LoyaltyReward | null> {
    return await this.db
      .prepare('SELECT * FROM loyalty_rewards WHERE id = ?')
      .bind(id)
      .first<LoyaltyReward>();
  }

  async create(reward: Omit<LoyaltyReward, 'id' | 'quantity_redeemed' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO loyalty_rewards (
          name, description, image_url, reward_type, reward_config,
          points_cost, tier_required, quantity_available, segment_id,
          is_active, start_date, end_date, quantity_redeemed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        RETURNING id
      `)
      .bind(
        reward.name,
        reward.description,
        reward.image_url,
        reward.reward_type,
        reward.reward_config,
        reward.points_cost,
        reward.tier_required,
        reward.quantity_available,
        reward.segment_id,
        reward.is_active,
        reward.start_date,
        reward.end_date
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, reward: Partial<LoyaltyReward>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (reward.name !== undefined) { fields.push('name = ?'); values.push(reward.name); }
    if (reward.description !== undefined) { fields.push('description = ?'); values.push(reward.description); }
    if (reward.image_url !== undefined) { fields.push('image_url = ?'); values.push(reward.image_url); }
    if (reward.reward_type !== undefined) { fields.push('reward_type = ?'); values.push(reward.reward_type); }
    if (reward.reward_config !== undefined) { fields.push('reward_config = ?'); values.push(reward.reward_config); }
    if (reward.points_cost !== undefined) { fields.push('points_cost = ?'); values.push(reward.points_cost); }
    if (reward.tier_required !== undefined) { fields.push('tier_required = ?'); values.push(reward.tier_required); }
    if (reward.quantity_available !== undefined) { fields.push('quantity_available = ?'); values.push(reward.quantity_available); }
    if (reward.segment_id !== undefined) { fields.push('segment_id = ?'); values.push(reward.segment_id); }
    if (reward.is_active !== undefined) { fields.push('is_active = ?'); values.push(reward.is_active); }
    if (reward.start_date !== undefined) { fields.push('start_date = ?'); values.push(reward.start_date); }
    if (reward.end_date !== undefined) { fields.push('end_date = ?'); values.push(reward.end_date); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE loyalty_rewards SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM loyalty_rewards WHERE id = ?').bind(id).run();
  }

  async incrementRedemptions(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE loyalty_rewards SET quantity_redeemed = quantity_redeemed + 1 WHERE id = ?')
      .bind(id)
      .run();
  }
}
