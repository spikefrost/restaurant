import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { CommunicationLog, Customer } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

interface CommunicationLogsPageProps {
  logs: CommunicationLog[];
  customers: Record<number, Customer>;
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  filter?: {
    type?: string;
    status?: string;
  };
}

export const AdminCommunicationLogsPage: FC<CommunicationLogsPageProps> = ({ logs, customers, stats, filter }) => {
  return (
    <AdminLayout title="Communication Log" currentPath="/admin/engagement/logs">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Communication Log</h1>
          <p class="text-muted" style="margin-top: 4px;">View all sent emails and SMS messages</p>
        </div>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Sent</div>
          <div class="stat-value">{stats.total.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Delivered</div>
          <div class="stat-value" style="color: var(--success);">{stats.sent.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Failed</div>
          <div class="stat-value" style="color: var(--error);">{stats.failed}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Pending</div>
          <div class="stat-value" style="color: #FF9800;">{stats.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div class="card" style="padding: 16px; margin-bottom: 24px;">
        <form class="filter-form" method="GET">
          <div class="flex gap-3 items-end flex-wrap">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Type</label>
              <select name="type" class="form-select" style="min-width: 120px;">
                <option value="">All Types</option>
                <option value="email" selected={filter?.type === 'email'}>Email</option>
                <option value="sms" selected={filter?.type === 'sms'}>SMS</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Status</label>
              <select name="status" class="form-select" style="min-width: 120px;">
                <option value="">All Statuses</option>
                <option value="sent" selected={filter?.status === 'sent'}>Sent</option>
                <option value="delivered" selected={filter?.status === 'delivered'}>Delivered</option>
                <option value="pending" selected={filter?.status === 'pending'}>Pending</option>
                <option value="failed" selected={filter?.status === 'failed'}>Failed</option>
                <option value="bounced" selected={filter?.status === 'bounced'}>Bounced</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">Filter</button>
            <a href="/admin/engagement/logs" class="btn btn-ghost">Reset</a>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      {logs.length > 0 ? (
        <div class="card">
          <div class="table-container" style="box-shadow: none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Content</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const customer = customers[log.customer_id];
                  const statusColors: Record<string, string> = {
                    sent: 'var(--success)',
                    delivered: 'var(--success)',
                    pending: '#FF9800',
                    failed: 'var(--error)',
                    bounced: 'var(--error)'
                  };

                  return (
                    <tr>
                      <td>
                        <div style="font-size: 13px;">{formatDate(log.created_at)}</div>
                        <div class="text-muted" style="font-size: 11px;">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span class={`type-badge ${log.template_type}`}>
                          {log.template_type === 'email' ? '📧' : '📱'} {log.template_type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style="font-weight: 500;">{customer ? escapeHtml(customer.name) : 'Unknown'}</div>
                        <div class="text-muted" style="font-size: 12px;">{escapeHtml(log.recipient)}</div>
                      </td>
                      <td>
                        {log.subject && (
                          <div style="font-weight: 500; font-size: 13px; margin-bottom: 2px;">{escapeHtml(log.subject)}</div>
                        )}
                        <div class="text-muted" style="font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {escapeHtml(log.body_preview)}
                        </div>
                      </td>
                      <td>
                        <span class="status-badge" style={`background: ${statusColors[log.status] || '#888'}20; color: ${statusColors[log.status] || '#888'};`}>
                          {log.status === 'sent' && '✓ '}
                          {log.status === 'delivered' && '✓✓ '}
                          {log.status === 'failed' && '✕ '}
                          {log.status === 'bounced' && '↩ '}
                          {log.status === 'pending' && '⏳ '}
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                        {log.error_message && (
                          <div class="text-error" style="font-size: 11px; margin-top: 4px;">{escapeHtml(log.error_message)}</div>
                        )}
                      </td>
                      <td>
                        <button onclick={`viewDetails(${log.id})`} class="btn btn-ghost btn-sm">View</button>
                        {log.status === 'failed' && (
                          <button onclick={`retryMessage(${log.id})`} class="btn btn-ghost btn-sm">Retry</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <h3 class="empty-state-title">No Communication Logs</h3>
          <p class="empty-state-text">Communication history will appear here once messages are sent.</p>
        </div>
      )}

      {/* Detail Modal */}
      <div id="detail-modal" class="modal" style="display: none;">
        <div class="modal-backdrop" onclick="closeDetail()"></div>
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2>Communication Details</h2>
            <button onclick="closeDetail()" class="modal-close">&times;</button>
          </div>
          <div id="detail-content"></div>
        </div>
      </div>

      <style>{`
        .filter-form {
          display: flex;
          gap: 16px;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 600;
        }
        .type-badge.email {
          background: #E3F2FD;
          color: #1976D2;
        }
        .type-badge.sms {
          background: #E8F5E9;
          color: #388E3C;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 600;
        }

        .detail-section {
          margin-bottom: 20px;
        }
        .detail-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .detail-value {
          font-size: 14px;
        }
        .detail-preview {
          background: var(--bg-alt);
          padding: 16px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.6;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const logsData = ${JSON.stringify(logs)};
        const customersData = ${JSON.stringify(customers)};

        function viewDetails(id) {
          const log = logsData.find(l => l.id === id);
          if (!log) return;

          const customer = customersData[log.customer_id];

          document.getElementById('detail-content').innerHTML = \`
            <div class="detail-section">
              <div class="detail-label">Type</div>
              <div class="detail-value">\${log.template_type === 'email' ? '📧 Email' : '📱 SMS'}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Recipient</div>
              <div class="detail-value">\${customer ? customer.name : 'Unknown'} (\${log.recipient})</div>
            </div>
            \${log.subject ? \`
            <div class="detail-section">
              <div class="detail-label">Subject</div>
              <div class="detail-value">\${log.subject}</div>
            </div>
            \` : ''}
            <div class="detail-section">
              <div class="detail-label">Content Preview</div>
              <div class="detail-preview">\${log.body_preview}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Status</div>
              <div class="detail-value">\${log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                \${log.error_message ? '<div class="text-error" style="font-size: 12px; margin-top: 4px;">' + log.error_message + '</div>' : ''}
              </div>
            </div>
            <div class="detail-section">
              <div class="detail-label">Sent At</div>
              <div class="detail-value">\${log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent yet'}</div>
            </div>
            \${log.automation_rule_id ? \`
            <div class="detail-section">
              <div class="detail-label">Triggered By</div>
              <div class="detail-value">Automation Rule #\${log.automation_rule_id}</div>
            </div>
            \` : ''}
          \`;

          document.getElementById('detail-modal').style.display = 'flex';
        }

        function closeDetail() {
          document.getElementById('detail-modal').style.display = 'none';
        }

        async function retryMessage(id) {
          if (!confirm('Retry sending this message?')) return;
          try {
            const res = await fetch('/api/communication-logs/' + id + '/retry', { method: 'POST' });
            if (res.ok) {
              alert('Message queued for retry');
              location.reload();
            } else {
              alert('Failed to retry');
            }
          } catch (err) {
            alert('Error retrying');
          }
        }
      `}} />
    </AdminLayout>
  );
};
