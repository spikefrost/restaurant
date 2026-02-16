import type { EmailTemplate, SmsTemplate, CommunicationLog } from '../types';

export class EmailTemplateRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<EmailTemplate[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM email_templates ORDER BY category ASC, name ASC')
      .all<EmailTemplate>();
    return results || [];
  }

  async getActive(): Promise<EmailTemplate[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM email_templates WHERE is_active = 1 ORDER BY category ASC, name ASC')
      .all<EmailTemplate>();
    return results || [];
  }

  async getByCategory(category: string): Promise<EmailTemplate[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM email_templates WHERE category = ? AND is_active = 1 ORDER BY name ASC')
      .bind(category)
      .all<EmailTemplate>();
    return results || [];
  }

  async getById(id: number): Promise<EmailTemplate | null> {
    return await this.db
      .prepare('SELECT * FROM email_templates WHERE id = ?')
      .bind(id)
      .first<EmailTemplate>();
  }

  async create(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO email_templates (name, subject, body_html, body_json, variables, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        template.name,
        template.subject,
        template.body_html,
        template.body_json,
        template.variables,
        template.category,
        template.is_active
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, template: Partial<EmailTemplate>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (template.name !== undefined) { fields.push('name = ?'); values.push(template.name); }
    if (template.subject !== undefined) { fields.push('subject = ?'); values.push(template.subject); }
    if (template.body_html !== undefined) { fields.push('body_html = ?'); values.push(template.body_html); }
    if (template.body_json !== undefined) { fields.push('body_json = ?'); values.push(template.body_json); }
    if (template.variables !== undefined) { fields.push('variables = ?'); values.push(template.variables); }
    if (template.category !== undefined) { fields.push('category = ?'); values.push(template.category); }
    if (template.is_active !== undefined) { fields.push('is_active = ?'); values.push(template.is_active); }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 1) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE email_templates SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM email_templates WHERE id = ?').bind(id).run();
  }

  async duplicate(id: number): Promise<number> {
    const original = await this.getById(id);
    if (!original) return 0;

    return await this.create({
      name: `${original.name} (Copy)`,
      subject: original.subject,
      body_html: original.body_html,
      body_json: original.body_json,
      variables: original.variables,
      category: original.category,
      is_active: 0
    });
  }
}

export class SmsTemplateRepository {
  constructor(private db: D1Database) {}

  async getAll(): Promise<SmsTemplate[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM sms_templates ORDER BY category ASC, name ASC')
      .all<SmsTemplate>();
    return results || [];
  }

  async getActive(): Promise<SmsTemplate[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM sms_templates WHERE is_active = 1 ORDER BY category ASC, name ASC')
      .all<SmsTemplate>();
    return results || [];
  }

  async getById(id: number): Promise<SmsTemplate | null> {
    return await this.db
      .prepare('SELECT * FROM sms_templates WHERE id = ?')
      .bind(id)
      .first<SmsTemplate>();
  }

  async create(template: Omit<SmsTemplate, 'id' | 'character_count' | 'created_at' | 'updated_at'>): Promise<number> {
    const charCount = template.body.length;
    const result = await this.db
      .prepare(`
        INSERT INTO sms_templates (name, body, variables, category, character_count, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        template.name,
        template.body,
        template.variables,
        template.category,
        charCount,
        template.is_active
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async update(id: number, template: Partial<SmsTemplate>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (template.name !== undefined) { fields.push('name = ?'); values.push(template.name); }
    if (template.body !== undefined) {
      fields.push('body = ?');
      values.push(template.body);
      fields.push('character_count = ?');
      values.push(template.body.length);
    }
    if (template.variables !== undefined) { fields.push('variables = ?'); values.push(template.variables); }
    if (template.category !== undefined) { fields.push('category = ?'); values.push(template.category); }
    if (template.is_active !== undefined) { fields.push('is_active = ?'); values.push(template.is_active); }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    if (fields.length === 1) return;

    values.push(id);
    await this.db
      .prepare(`UPDATE sms_templates SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM sms_templates WHERE id = ?').bind(id).run();
  }
}

export class CommunicationLogRepository {
  constructor(private db: D1Database) {}

  async getAll(limit: number = 100): Promise<CommunicationLog[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM communication_logs ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<CommunicationLog>();
    return results || [];
  }

  async getByCustomer(customerId: number): Promise<CommunicationLog[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM communication_logs WHERE customer_id = ? ORDER BY created_at DESC')
      .bind(customerId)
      .all<CommunicationLog>();
    return results || [];
  }

  async create(log: Omit<CommunicationLog, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO communication_logs (
          customer_id, template_type, template_id, automation_rule_id,
          recipient, subject, body_preview, status, error_message, sent_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `)
      .bind(
        log.customer_id,
        log.template_type,
        log.template_id,
        log.automation_rule_id,
        log.recipient,
        log.subject,
        log.body_preview,
        log.status,
        log.error_message,
        log.sent_at
      )
      .first<{ id: number }>();
    return result?.id || 0;
  }

  async updateStatus(id: number, status: string, errorMessage?: string): Promise<void> {
    await this.db
      .prepare('UPDATE communication_logs SET status = ?, error_message = ?, sent_at = CASE WHEN ? = "sent" THEN CURRENT_TIMESTAMP ELSE sent_at END WHERE id = ?')
      .bind(status, errorMessage || null, status, id)
      .run();
  }

  async getStats(): Promise<{ total: number; sent: number; failed: number; pending: number }> {
    const result = await this.db
      .prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('sent', 'delivered') THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status IN ('failed', 'bounced') THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM communication_logs
      `)
      .first<{ total: number; sent: number; failed: number; pending: number }>();
    return result || { total: 0, sent: 0, failed: 0, pending: 0 };
  }
}
