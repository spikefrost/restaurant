import type { QRCode } from '../types';

export class QRCodeRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<(QRCode & { branch_name: string })[]> {
    const { results } = await this.db
      .prepare(`
        SELECT q.*, b.name as branch_name
        FROM qr_codes q
        LEFT JOIN branches b ON q.branch_id = b.id
        ORDER BY b.name ASC, q.table_number ASC
      `)
      .all<QRCode & { branch_name: string }>();
    return results || [];
  }

  async getByBranch(branchId: number): Promise<QRCode[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM qr_codes WHERE branch_id = ? ORDER BY table_number ASC')
      .bind(branchId)
      .all<QRCode>();
    return results || [];
  }

  async getById(id: number): Promise<QRCode | null> {
    return await this.db
      .prepare('SELECT * FROM qr_codes WHERE id = ?')
      .bind(id)
      .first<QRCode>();
  }

  async getByCode(code: string): Promise<QRCode | null> {
    return await this.db
      .prepare('SELECT * FROM qr_codes WHERE code = ?')
      .bind(code)
      .first<QRCode>();
  }

  async create(data: Omit<QRCode, 'id' | 'created_at' | 'last_scanned_at' | 'scan_count'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO qr_codes (branch_id, table_number, code, scan_count, is_active)
        VALUES (?, ?, ?, 0, ?)
        RETURNING id
      `)
      .bind(data.branch_id, data.table_number, data.code, data.is_active)
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async incrementScan(code: string): Promise<void> {
    await this.db
      .prepare('UPDATE qr_codes SET scan_count = scan_count + 1, last_scanned_at = CURRENT_TIMESTAMP WHERE code = ?')
      .bind(code)
      .run();
  }

  async toggleActive(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE qr_codes SET is_active = NOT is_active WHERE id = ?')
      .bind(id)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM qr_codes WHERE id = ?').bind(id).run();
  }

  async generateCode(branchId: number, tableNumber: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `B${branchId}T${tableNumber}-${timestamp}${random}`.toUpperCase();
  }

  async bulkCreate(branchId: number, startTable: number, endTable: number): Promise<number> {
    let created = 0;
    for (let i = startTable; i <= endTable; i++) {
      const tableNumber = `T${i}`;
      const code = await this.generateCode(branchId, tableNumber);
      await this.create({
        branch_id: branchId,
        table_number: tableNumber,
        code,
        is_active: 1
      });
      created++;
    }
    return created;
  }
}
