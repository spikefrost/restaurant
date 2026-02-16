import type { AdminUser } from '../types';

export class AdminRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<AdminUser[]> {
    const { results } = await this.db
      .prepare('SELECT id, email, name, role, branch_id, is_active, created_at, last_login_at FROM admin_users ORDER BY created_at DESC')
      .all<AdminUser>();
    return results || [];
  }

  async getById(id: number): Promise<AdminUser | null> {
    return await this.db
      .prepare('SELECT * FROM admin_users WHERE id = ?')
      .bind(id)
      .first<AdminUser>();
  }

  async getByEmail(email: string): Promise<AdminUser | null> {
    return await this.db
      .prepare('SELECT * FROM admin_users WHERE email = ?')
      .bind(email)
      .first<AdminUser>();
  }

  async create(data: Omit<AdminUser, 'id' | 'created_at' | 'last_login_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO admin_users (email, password_hash, name, role, branch_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(data.email, data.password_hash, data.name, data.role, data.branch_id, data.is_active)
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, data: Partial<AdminUser>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
    if (data.branch_id !== undefined) { fields.push('branch_id = ?'); values.push(data.branch_id); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

    if (fields.length === 0) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(id)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM admin_users WHERE id = ?').bind(id).run();
  }

  async validateLogin(email: string, passwordHash: string): Promise<AdminUser | null> {
    return await this.db
      .prepare('SELECT * FROM admin_users WHERE email = ? AND password_hash = ? AND is_active = 1')
      .bind(email, passwordHash)
      .first<AdminUser>();
  }
}
