import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { Customer } from '../../types';
import { formatCurrency, formatDate, escapeHtml } from '../../utils/helpers';

interface CustomersPageProps {
  customers: Customer[];
}

export const AdminCustomersPage: FC<CustomersPageProps> = ({ customers }) => {
  return (
    <AdminLayout title="Customers" currentPath="/admin/customers">
      <div class="admin-header">
        <h1 class="admin-title">Customers</h1>
        <div class="text-muted">{customers.length} registered customers</div>
      </div>

      {customers.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Points</th>
                <th>Tier</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr>
                  <td>
                    <div style="font-weight: 600;">{escapeHtml(customer.name)}</div>
                    {customer.birthday && (
                      <div class="text-muted" style="font-size: 12px;">
                        🎂 {formatDate(customer.birthday)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>{escapeHtml(customer.email)}</div>
                    {customer.phone && (
                      <div class="text-muted" style="font-size: 12px;">{escapeHtml(customer.phone)}</div>
                    )}
                  </td>
                  <td style="font-weight: 600;">{customer.total_orders}</td>
                  <td style="font-weight: 600;">{formatCurrency(customer.total_spent)}</td>
                  <td>
                    <span style="color: var(--primary); font-weight: 600;">{customer.points_balance} pts</span>
                  </td>
                  <td>
                    <span class="badge" style={getTierStyle(customer.tier)}>
                      {customer.tier}
                    </span>
                  </td>
                  <td class="text-muted">{formatDate(customer.created_at)}</td>
                  <td>
                    <div class="table-actions">
                      <a href={`/admin/customers/${customer.id}`} class="btn btn-ghost btn-sm">View</a>
                      <button onclick={`adjustPoints(${customer.id}, '${escapeHtml(customer.name)}')`} class="btn btn-ghost btn-sm">
                        +/- Points
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3 class="empty-state-title">No Customers Yet</h3>
          <p class="empty-state-text">Customers will appear here when they register.</p>
        </div>
      )}

      {/* Points Adjustment Modal */}
      <div id="points-modal" class="points-modal">
        <div class="points-modal-backdrop" onclick="closePointsModal()"></div>
        <div class="points-modal-content">
          <div class="modal-header">
            <h2>Adjust Points</h2>
            <button onclick="closePointsModal()" class="modal-close">&times;</button>
          </div>

          <p style="margin-bottom: 16px;">Adjusting points for: <strong id="customer-name"></strong></p>
          <form id="points-form" onsubmit="return submitPointsAdjustment(event)">
            <input type="hidden" name="customer_id" id="customer-id" />
            <div class="form-group">
              <label class="form-label">Points (use negative to deduct)</label>
              <input type="number" name="points" class="form-input" placeholder="e.g., 100 or -50" required />
            </div>
            <div class="form-group">
              <label class="form-label">Reason</label>
              <input type="text" name="reason" class="form-input" placeholder="e.g., Goodwill gesture" required />
            </div>
            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Apply</button>
              <button type="button" onclick="closePointsModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .points-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .points-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .points-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 450px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 24px;
        }
        .points-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .points-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .points-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .points-modal-content .form-group {
          margin-bottom: 16px;
        }
        .points-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .points-modal-content .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function adjustPoints(customerId, customerName) {
          document.getElementById('customer-id').value = customerId;
          document.getElementById('customer-name').textContent = customerName;
          document.getElementById('points-modal').style.display = 'flex';
        }

        function closePointsModal() {
          document.getElementById('points-modal').style.display = 'none';
        }

        async function submitPointsAdjustment(e) {
          e.preventDefault();
          const form = document.getElementById('points-form');
          const formData = new FormData(form);

          try {
            const res = await fetch('/api/customers/' + formData.get('customer_id') + '/points', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                points: parseInt(formData.get('points')),
                reason: formData.get('reason')
              })
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to adjust points');
            }
          } catch (err) {
            alert('Failed to adjust points');
          }
          return false;
        }
      `}} />
    </AdminLayout>
  );
};

function getTierStyle(tier: string): string {
  const styles: Record<string, string> = {
    'Bronze': 'background: #CD7F32; color: white;',
    'Silver': 'background: #C0C0C0; color: #333;',
    'Gold': 'background: #FFD700; color: #333;',
    'Platinum': 'background: #E5E4E2; color: #333;'
  };
  return styles[tier] || 'background: var(--bg-alt);';
}

interface CustomerDetailProps {
  customer: Customer & {
    lifetime_points?: number;
    redeemed_points?: number;
    segments?: string[];
    last_order_date?: string;
    avg_order_value?: number;
    favorite_items?: string[];
    email_verified?: boolean;
    phone_verified?: boolean;
    marketing_consent?: boolean;
    sms_consent?: boolean;
    push_consent?: boolean;
    registration_source?: string;
    last_login?: string;
    device_info?: string;
    notes?: string;
  };
  orders: import('../../types').Order[];
  pointsHistory: { id: number; points: number; type: string; description: string; created_at: string }[];
  challenges: { name: string; progress: number; target: number; reward: string }[];
}

export const AdminCustomerDetailPage: FC<CustomerDetailProps> = ({ customer, orders, pointsHistory = [], challenges = [] }) => {
  const completedChallenges = challenges.filter(c => c.progress >= c.target).length;
  const avgOrderValue = customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0;

  return (
    <AdminLayout title={`Customer: ${customer.name}`} currentPath="/admin/customers">
      {/* Header with Customer Avatar */}
      <div class="customer-profile-header">
        <div class="customer-avatar">
          <span class="avatar-initials">{customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
        </div>
        <div class="customer-header-info">
          <h1 class="customer-name">{escapeHtml(customer.name)}</h1>
          <div class="customer-badges">
            <span class="badge" style={getTierStyle(customer.tier)}>{customer.tier}</span>
            {customer.segments?.map(seg => (
              <span class="badge" style="background: #E3F2FD; color: #1976D2;">{seg}</span>
            ))}
          </div>
        </div>
        <div class="customer-actions">
          <button onclick="openNotesModal()" class="btn btn-ghost">📝 Notes</button>
          <button onclick={`adjustPoints(${customer.id}, '${escapeHtml(customer.name)}')`} class="btn btn-ghost">+/- Points</button>
          <a href="/admin/customers" class="btn btn-ghost">← Back</a>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div class="info-sections">
        {/* Identity Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">👤</span>
            <span class="info-title">Identity Info</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Customer ID</span>
              <span class="info-value">{customer.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Full Name</span>
              <span class="info-value">{escapeHtml(customer.name)}</span>
            </div>
            {customer.birthday && (
              <div class="info-row">
                <span class="info-label">Birthday</span>
                <span class="info-value">{formatDate(customer.birthday)}</span>
              </div>
            )}
            <div class="info-row">
              <span class="info-label">Registration</span>
              <span class="info-value">{customer.registration_source || 'Website'}</span>
            </div>
          </div>
        </div>

        {/* Email Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">📧</span>
            <span class="info-title">Email Info</span>
            {customer.email_verified !== false && <span class="verified-badge">✓ Verified</span>}
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{escapeHtml(customer.email)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Marketing</span>
              <span class="info-value">{customer.marketing_consent !== false ? 'Subscribed' : 'Unsubscribed'}</span>
            </div>
          </div>
        </div>

        {/* Phone Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">📱</span>
            <span class="info-title">Phone Info</span>
            {customer.phone && customer.phone_verified !== false && <span class="verified-badge">✓ Verified</span>}
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">{customer.phone ? escapeHtml(customer.phone) : 'Not provided'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">SMS Marketing</span>
              <span class="info-value">{customer.sms_consent !== false ? 'Subscribed' : 'Unsubscribed'}</span>
            </div>
          </div>
        </div>

        {/* Points Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">⭐</span>
            <span class="info-title">Points Info</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Current Balance</span>
              <span class="info-value highlight">{customer.points_balance.toLocaleString()} pts</span>
            </div>
            <div class="info-row">
              <span class="info-label">Lifetime Earned</span>
              <span class="info-value">{(customer.lifetime_points || customer.points_balance).toLocaleString()} pts</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Redeemed</span>
              <span class="info-value">{(customer.redeemed_points || 0).toLocaleString()} pts</span>
            </div>
            <div class="info-row">
              <span class="info-label">Points to Next Tier</span>
              <span class="info-value">500 pts</span>
            </div>
          </div>
        </div>

        {/* Date Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">📅</span>
            <span class="info-title">Date Info</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Member Since</span>
              <span class="info-value">{formatDate(customer.created_at)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Order</span>
              <span class="info-value">{customer.last_order_date ? formatDate(customer.last_order_date) : 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Last Login</span>
              <span class="info-value">{customer.last_login ? formatDate(customer.last_login) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Spending Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">💰</span>
            <span class="info-title">Spending Info</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Total Orders</span>
              <span class="info-value">{customer.total_orders}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Spent</span>
              <span class="info-value highlight">{formatCurrency(customer.total_spent)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Avg Order Value</span>
              <span class="info-value">{formatCurrency(avgOrderValue)}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">🔔</span>
            <span class="info-title">Notification Settings</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Email Notifications</span>
              <span class={`info-value ${customer.marketing_consent !== false ? 'text-success' : 'text-muted'}`}>
                {customer.marketing_consent !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">SMS Notifications</span>
              <span class={`info-value ${customer.sms_consent !== false ? 'text-success' : 'text-muted'}`}>
                {customer.sms_consent !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Push Notifications</span>
              <span class={`info-value ${customer.push_consent !== false ? 'text-success' : 'text-muted'}`}>
                {customer.push_consent !== false ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div class="info-card">
          <div class="info-card-header">
            <span class="info-icon">⚙️</span>
            <span class="info-title">System Info</span>
          </div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Customer ID</span>
              <span class="info-value mono">{customer.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Device</span>
              <span class="info-value">{customer.device_info || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div class="customer-tabs">
        <div class="tab-buttons">
          <button class="tab-btn active" onclick="showTab('orders')">📋 Orders ({orders.length})</button>
          <button class="tab-btn" onclick="showTab('points')">⭐ Points History</button>
          <button class="tab-btn" onclick="showTab('challenges')">🏆 Challenges ({completedChallenges}/{challenges.length})</button>
          <button class="tab-btn" onclick="showTab('activity')">📊 Activity</button>
        </div>

        {/* Orders Tab */}
        <div id="tab-orders" class="tab-content active">
          {orders.length > 0 ? (
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr>
                      <td style="font-weight: 600;">{order.order_number}</td>
                      <td class="text-muted">{formatDate(order.created_at)}</td>
                      <td>
                        <span class="badge" style="background: var(--bg-alt);">
                          {order.order_type === 'dine_in' ? 'Dine In' : order.order_type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                        </span>
                      </td>
                      <td>
                        <span class={`badge ${order.status === 'completed' ? 'badge-new' : order.status === 'cancelled' ? '' : 'badge-popular'}`}
                              style={order.status === 'cancelled' ? 'background: var(--text-muted); color: white;' : ''}>
                          {order.status}
                        </span>
                      </td>
                      <td style="font-weight: 600;">{formatCurrency(order.total)}</td>
                      <td style="color: var(--primary);">+{order.points_earned} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="empty-tab">No orders yet</div>
          )}
        </div>

        {/* Points History Tab */}
        <div id="tab-points" class="tab-content">
          {pointsHistory.length > 0 ? (
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsHistory.map(entry => (
                    <tr>
                      <td class="text-muted">{formatDate(entry.created_at)}</td>
                      <td>
                        <span class={`badge ${entry.type === 'earned' ? 'badge-new' : 'badge-popular'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td>{entry.description}</td>
                      <td style={`font-weight: 600; color: ${entry.points > 0 ? 'var(--success)' : 'var(--error)'};`}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="empty-tab">No points history</div>
          )}
        </div>

        {/* Challenges Tab */}
        <div id="tab-challenges" class="tab-content">
          {challenges.length > 0 ? (
            <div class="challenges-grid">
              {challenges.map(challenge => {
                const percent = Math.min(100, (challenge.progress / challenge.target) * 100);
                const isComplete = challenge.progress >= challenge.target;
                return (
                  <div class={`challenge-card ${isComplete ? 'complete' : ''}`}>
                    <div class="challenge-header">
                      <span class="challenge-name">{challenge.name}</span>
                      {isComplete && <span class="challenge-complete-badge">✓ Completed</span>}
                    </div>
                    <div class="challenge-progress-bar">
                      <div class="challenge-progress-fill" style={`width: ${percent}%`}></div>
                    </div>
                    <div class="challenge-stats">
                      <span>{challenge.progress} / {challenge.target}</span>
                      <span class="challenge-reward">🎁 {challenge.reward}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="empty-tab">No challenges enrolled</div>
          )}
        </div>

        {/* Activity Tab */}
        <div id="tab-activity" class="tab-content">
          <div class="empty-tab">Activity timeline coming soon</div>
        </div>
      </div>

      {/* Notes Modal */}
      <div id="notes-modal" class="detail-modal">
        <div class="detail-modal-backdrop" onclick="closeNotesModal()"></div>
        <div class="detail-modal-content">
          <div class="modal-header">
            <h2>Customer Notes</h2>
            <button onclick="closeNotesModal()" class="modal-close">&times;</button>
          </div>
          <form onsubmit="saveNotes(event)">
            <div class="form-group">
              <textarea id="customer-notes" class="form-textarea" rows={6} placeholder="Add internal notes about this customer...">{customer.notes || ''}</textarea>
            </div>
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary">Save Notes</button>
              <button type="button" onclick="closeNotesModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* Points Adjustment Modal */}
      <div id="points-adjust-modal" class="detail-modal">
        <div class="detail-modal-backdrop" onclick="closePointsModal()"></div>
        <div class="detail-modal-content">
          <div class="modal-header">
            <h2>Adjust Points</h2>
            <button onclick="closePointsModal()" class="modal-close">&times;</button>
          </div>
          <form onsubmit="submitPointsAdjust(event)">
            <div class="form-group">
              <label class="form-label">Points (use negative to deduct)</label>
              <input type="number" id="adjust-points" class="form-input" placeholder="e.g., 100 or -50" required />
            </div>
            <div class="form-group">
              <label class="form-label">Reason</label>
              <input type="text" id="adjust-reason" class="form-input" placeholder="e.g., Goodwill gesture" required />
            </div>
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary">Apply</button>
              <button type="button" onclick="closePointsModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .customer-profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }
        .customer-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #FF9800);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .avatar-initials {
          color: white;
          font-size: 28px;
          font-weight: 700;
        }
        .customer-header-info {
          flex: 1;
        }
        .customer-name {
          margin: 0 0 8px;
          font-size: 24px;
        }
        .customer-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .customer-actions {
          display: flex;
          gap: 8px;
        }

        .info-sections {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .info-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
        }
        .info-icon {
          font-size: 18px;
        }
        .info-title {
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }
        .verified-badge {
          font-size: 11px;
          color: var(--success);
          font-weight: 600;
        }
        .info-grid {
          padding: 12px 16px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .info-value {
          font-size: 13px;
          font-weight: 500;
        }
        .info-value.highlight {
          color: var(--primary);
          font-weight: 700;
        }
        .info-value.mono {
          font-family: monospace;
          font-size: 12px;
        }
        .text-success { color: var(--success); }
        .text-muted { color: var(--text-muted); }

        .customer-tabs {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .tab-buttons {
          display: flex;
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }
        .tab-btn {
          padding: 14px 20px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }
        .tab-btn:hover {
          color: var(--text);
          background: var(--bg-alt);
        }
        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .tab-content {
          display: none;
          padding: 20px;
        }
        .tab-content.active {
          display: block;
        }
        .empty-tab {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        .challenges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .challenge-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .challenge-card.complete {
          background: #E8F5E9;
          border-color: #A5D6A7;
        }
        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .challenge-name {
          font-weight: 600;
        }
        .challenge-complete-badge {
          font-size: 11px;
          color: var(--success);
          font-weight: 600;
        }
        .challenge-progress-bar {
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .challenge-progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.3s;
        }
        .challenge-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
        }
        .challenge-reward {
          color: var(--primary);
        }

        /* Detail Modal Styles */
        .detail-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .detail-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .detail-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .detail-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .detail-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .detail-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const customerId = ${customer.id};

        function showTab(tabName) {
          document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          document.getElementById('tab-' + tabName).classList.add('active');
          event.target.classList.add('active');
        }

        function openNotesModal() {
          document.getElementById('notes-modal').style.display = 'flex';
        }
        function closeNotesModal() {
          document.getElementById('notes-modal').style.display = 'none';
        }

        function adjustPoints() {
          document.getElementById('points-adjust-modal').style.display = 'flex';
        }
        function closePointsModal() {
          document.getElementById('points-adjust-modal').style.display = 'none';
        }

        async function saveNotes(e) {
          e.preventDefault();
          const notes = document.getElementById('customer-notes').value;
          try {
            const res = await fetch('/api/customers/' + customerId + '/notes', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notes })
            });
            if (res.ok) {
              alert('Notes saved!');
              closeNotesModal();
            } else {
              alert('Failed to save notes');
            }
          } catch (err) {
            alert('Error saving notes');
          }
        }

        async function submitPointsAdjust(e) {
          e.preventDefault();
          const points = parseInt(document.getElementById('adjust-points').value);
          const reason = document.getElementById('adjust-reason').value;
          try {
            const res = await fetch('/api/customers/' + customerId + '/points', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ points, reason })
            });
            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to adjust points');
            }
          } catch (err) {
            alert('Error adjusting points');
          }
        }
      `}} />
    </AdminLayout>
  );
};
