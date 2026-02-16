import type { VoucherCode, VoucherBatch } from '../types';

// ============================================
// VOUCHER CODES REPOSITORY
// ============================================

export class VoucherRepository {
  constructor(private db: D1Database) {}

  async getAll(limit: number = 100): Promise<VoucherCode[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM voucher_codes ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<VoucherCode>();
    return results || [];
  }

  async getByBatch(batchId: number): Promise<VoucherCode[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM voucher_codes WHERE batch_id = ? ORDER BY code ASC')
      .bind(batchId)
      .all<VoucherCode>();
    return results || [];
  }

  async getByCode(code: string): Promise<VoucherCode | null> {
    return await this.db
      .prepare('SELECT * FROM voucher_codes WHERE code = ?')
      .bind(code.toUpperCase())
      .first<VoucherCode>();
  }

  async getById(id: number): Promise<VoucherCode | null> {
    return await this.db
      .prepare('SELECT * FROM voucher_codes WHERE id = ?')
      .bind(id)
      .first<VoucherCode>();
  }

  async create(code: Omit<VoucherCode, 'id' | 'used_at' | 'used_by_customer_id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO voucher_codes (
          code, batch_id, promotion_id, discount_type, discount_value,
          min_order_value, max_discount, is_single_use, customer_id,
          segment_id, valid_from, valid_until, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        code.code.toUpperCase(),
        code.batch_id,
        code.promotion_id,
        code.discount_type,
        code.discount_value,
        code.min_order_value,
        code.max_discount,
        code.is_single_use,
        code.customer_id,
        code.segment_id,
        code.valid_from,
        code.valid_until,
        code.status
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async markAsUsed(id: number, customerId: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE voucher_codes
        SET status = 'used', used_at = CURRENT_TIMESTAMP, used_by_customer_id = ?
        WHERE id = ?
      `)
      .bind(customerId, id)
      .run();
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.db
      .prepare('UPDATE voucher_codes SET status = ? WHERE id = ?')
      .bind(status, id)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM voucher_codes WHERE id = ?').bind(id).run();
  }

  async deleteByBatch(batchId: number): Promise<void> {
    await this.db.prepare('DELETE FROM voucher_codes WHERE batch_id = ?').bind(batchId).run();
  }

  async getStats(): Promise<{ total: number; active: number; used: number; expired: number }> {
    const result = await this.db
      .prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
          SUM(CASE WHEN status = 'expired' OR status = 'revoked' THEN 1 ELSE 0 END) as expired
        FROM voucher_codes
      `)
      .first<{ total: number; active: number; used: number; expired: number }>();
    return result || { total: 0, active: 0, used: 0, expired: 0 };
  }
}

// ============================================
// VOUCHER BATCHES REPOSITORY
// ============================================

export class VoucherBatchRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<VoucherBatch[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM voucher_batches ORDER BY created_at DESC')
      .all<VoucherBatch>();
    return results || [];
  }

  async getById(id: number): Promise<VoucherBatch | null> {
    return await this.db
      .prepare('SELECT * FROM voucher_batches WHERE id = ?')
      .bind(id)
      .first<VoucherBatch>();
  }

  async create(batch: Omit<VoucherBatch, 'id' | 'codes_used' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO voucher_batches (
          name, code_prefix, total_codes, discount_type, discount_value,
          min_order_value, max_discount, valid_from, valid_until, segment_id, codes_used
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        RETURNING id
      `)
      .bind(
        batch.name,
        batch.code_prefix.toUpperCase(),
        batch.total_codes,
        batch.discount_type,
        batch.discount_value,
        batch.min_order_value,
        batch.max_discount,
        batch.valid_from,
        batch.valid_until,
        batch.segment_id
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async updateStats(batchId: number): Promise<void> {
    await this.db
      .prepare(`
        UPDATE voucher_batches SET
          codes_used = (SELECT COUNT(*) FROM voucher_codes WHERE batch_id = ? AND status = 'used')
        WHERE id = ?
      `)
      .bind(batchId, batchId)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM voucher_batches WHERE id = ?').bind(id).run();
  }
}
