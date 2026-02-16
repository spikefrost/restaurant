import type { Reservation, ReservationWithDetails } from '../types';

export class ReservationRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<ReservationWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
      `)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getByStatus(status: string): Promise<ReservationWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.status = ?
        ORDER BY r.reservation_date ASC, r.reservation_time ASC
      `)
      .bind(status)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getUpcoming(): Promise<ReservationWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.reservation_date >= ? AND r.status IN ('pending', 'confirmed')
        ORDER BY r.reservation_date ASC, r.reservation_time ASC
      `)
      .bind(today)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getByBranch(branchId: number): Promise<ReservationWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.branch_id = ?
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
      `)
      .bind(branchId)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getByCustomer(customerId: number): Promise<ReservationWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.customer_id = ?
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
      `)
      .bind(customerId)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getByPhone(phone: string): Promise<ReservationWithDetails[]> {
    const { results } = await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.guest_phone = ? OR c.phone = ?
        ORDER BY r.reservation_date DESC, r.reservation_time DESC
      `)
      .bind(phone, phone)
      .all<ReservationWithDetails>();
    return results || [];
  }

  async getById(id: number): Promise<ReservationWithDetails | null> {
    return await this.db
      .prepare(`
        SELECT
          r.*,
          b.name as branch_name,
          c.name as customer_name,
          c.phone as customer_phone,
          c.email as customer_email
        FROM reservations r
        LEFT JOIN branches b ON r.branch_id = b.id
        LEFT JOIN customers c ON r.customer_id = c.id
        WHERE r.id = ?
      `)
      .bind(id)
      .first<ReservationWithDetails>();
  }

  async create(data: {
    branch_id: number;
    customer_id?: number | null;
    guest_name?: string | null;
    guest_email?: string | null;
    guest_phone?: string | null;
    reservation_date: string;
    reservation_time: string;
    party_size: number;
    notes?: string | null;
  }): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO reservations (
          branch_id, customer_id, guest_name, guest_email, guest_phone,
          reservation_date, reservation_time, party_size, notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        RETURNING id
      `)
      .bind(
        data.branch_id,
        data.customer_id || null,
        data.guest_name || null,
        data.guest_email || null,
        data.guest_phone || null,
        data.reservation_date,
        data.reservation_time,
        data.party_size,
        data.notes || null
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async updateStatus(id: number, status: string, adminNotes?: string): Promise<void> {
    if (adminNotes !== undefined) {
      await this.db
        .prepare(`UPDATE reservations SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(status, adminNotes, id)
        .run();
    } else {
      await this.db
        .prepare(`UPDATE reservations SET status = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(status, id)
        .run();
    }
  }

  async update(id: number, data: Partial<Reservation>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.branch_id !== undefined) { fields.push('branch_id = ?'); values.push(data.branch_id); }
    if (data.reservation_date !== undefined) { fields.push('reservation_date = ?'); values.push(data.reservation_date); }
    if (data.reservation_time !== undefined) { fields.push('reservation_time = ?'); values.push(data.reservation_time); }
    if (data.party_size !== undefined) { fields.push('party_size = ?'); values.push(data.party_size); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.admin_notes !== undefined) { fields.push('admin_notes = ?'); values.push(data.admin_notes); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.guest_name !== undefined) { fields.push('guest_name = ?'); values.push(data.guest_name); }
    if (data.guest_email !== undefined) { fields.push('guest_email = ?'); values.push(data.guest_email); }
    if (data.guest_phone !== undefined) { fields.push('guest_phone = ?'); values.push(data.guest_phone); }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await this.db
      .prepare(`UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM reservations WHERE id = ?').bind(id).run();
  }

  async getStats(): Promise<{ pending: number; confirmed: number; today: number; upcoming: number }> {
    const today = new Date().toISOString().split('T')[0];

    const [pending, confirmed, todayCount, upcoming] = await Promise.all([
      this.db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'`).first<{ count: number }>(),
      this.db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE status = 'confirmed'`).first<{ count: number }>(),
      this.db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE reservation_date = ? AND status IN ('pending', 'confirmed')`).bind(today).first<{ count: number }>(),
      this.db.prepare(`SELECT COUNT(*) as count FROM reservations WHERE reservation_date > ? AND status IN ('pending', 'confirmed')`).bind(today).first<{ count: number }>()
    ]);

    return {
      pending: pending?.count || 0,
      confirmed: confirmed?.count || 0,
      today: todayCount?.count || 0,
      upcoming: upcoming?.count || 0
    };
  }
}
