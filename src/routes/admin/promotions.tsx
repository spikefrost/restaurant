import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { Promotion } from '../../types';
import { formatCurrency, formatDate, escapeHtml } from '../../utils/helpers';

interface PromotionsPageProps {
  promotions: Promotion[];
}

export const AdminPromotionsPage: FC<PromotionsPageProps> = ({ promotions }) => {
  const activePromos = promotions.filter(p => p.is_active);
  const totalUsed = promotions.reduce((sum, p) => sum + (p.used_count || 0), 0);

  return (
    <AdminLayout title="Promotions" currentPath="/admin/promotions">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Promotions & Campaigns</h1>
          <p class="text-muted" style="margin-top: 4px;">Create and manage promotional campaigns and discount codes</p>
        </div>
        <button onclick="openPromoModal()" class="btn btn-primary">+ Create Promotion</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Campaigns</div>
          <div class="stat-value">{promotions.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{activePromos.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Uses</div>
          <div class="stat-value" style="color: var(--primary);">{totalUsed.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Discount</div>
          <div class="stat-value">{promotions.length > 0 ? Math.round(promotions.filter(p => p.discount_type === 'percentage').reduce((sum, p) => sum + p.discount_value, 0) / Math.max(promotions.filter(p => p.discount_type === 'percentage').length, 1)) : 0}%</div>
        </div>
      </div>

      {promotions.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Valid Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => {
                const now = new Date();
                const start = new Date(promo.start_date);
                const end = new Date(promo.end_date);
                const isExpired = end < now;
                const isNotStarted = start > now;

                return (
                  <tr>
                    <td>
                      <div style="font-weight: 600;">{escapeHtml(promo.name)}</div>
                      {promo.description && (
                        <div class="text-muted" style="font-size: 12px; max-width: 200px;">
                          {escapeHtml(promo.description)}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style="background: var(--bg-alt); padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                        {promo.code}
                      </code>
                    </td>
                    <td style="font-weight: 600; color: var(--primary);">
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_value}% OFF`
                        : `${formatCurrency(promo.discount_value)} OFF`
                      }
                    </td>
                    <td>{promo.min_order_value > 0 ? formatCurrency(promo.min_order_value) : '-'}</td>
                    <td>
                      {promo.used_count} / {promo.max_uses > 0 ? promo.max_uses : '∞'}
                    </td>
                    <td class="text-muted" style="font-size: 13px;">
                      {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                    </td>
                    <td>
                      {isExpired ? (
                        <span class="badge" style="background: var(--text-muted); color: white;">Expired</span>
                      ) : isNotStarted ? (
                        <span class="badge badge-popular">Scheduled</span>
                      ) : promo.is_active ? (
                        <span class="badge badge-new">Active</span>
                      ) : (
                        <span class="badge" style="background: var(--text-muted); color: white;">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div class="table-actions">
                        <button onclick={`editPromo(${promo.id})`} class="btn btn-ghost btn-sm">Edit</button>
                        <button onclick={`togglePromo(${promo.id})`} class="btn btn-ghost btn-sm">{promo.is_active ? 'Disable' : 'Enable'}</button>
                        <button onclick={`deletePromo(${promo.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🎁</div>
          <h3 class="empty-state-title">No Promotions</h3>
          <p class="empty-state-text">Create promotions to attract and retain customers.</p>
          <button onclick="openPromoModal()" class="btn btn-primary">+ Create Promotion</button>
        </div>
      )}

      {/* Promotion Modal */}
      <div id="promo-modal" class="promo-modal">
        <div class="promo-modal-backdrop" onclick="closePromoModal()"></div>
        <div class="promo-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Create Promotion</h2>
            <button onclick="closePromoModal()" class="modal-close">&times;</button>
          </div>

          <form id="promo-form" onsubmit="savePromo(event)">
            <input type="hidden" id="promo-id" value="" />

            <div class="form-group">
              <label class="form-label">Promotion Name *</label>
              <input type="text" id="promo-name" class="form-input" required placeholder="e.g., Summer Special" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="promo-description" class="form-textarea" rows={2} placeholder="Brief description of the promotion"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Promo Code *</label>
                <input type="text" id="promo-code" class="form-input" required placeholder="e.g., SUMMER20" style="text-transform: uppercase;" />
                <span class="form-hint">Customers enter this at checkout</span>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Discount Type *</label>
                <select id="promo-discount-type" class="form-select" required>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Discount Value *</label>
                <input type="number" id="promo-discount-value" step="0.01" class="form-input" required placeholder="e.g., 20" />
                <span class="form-hint">Enter 20 for 20% or $20</span>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Minimum Order Value</label>
                <input type="number" id="promo-min-order" step="0.01" class="form-input" value="0" placeholder="0" />
                <span class="form-hint">0 for no minimum</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Start Date *</label>
                <input type="date" id="promo-start-date" class="form-input" required />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">End Date *</label>
                <input type="date" id="promo-end-date" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Maximum Uses</label>
              <input type="number" id="promo-max-uses" class="form-input" value="0" placeholder="0" />
              <span class="form-hint">0 for unlimited uses</span>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="promo-active" checked />
                <span>Active (can be used by customers)</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Promotion</button>
              <button type="button" onclick="closePromoModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .promo-modal {
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
        .promo-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .promo-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .promo-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .promo-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .promo-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .promo-modal-content .modal-close:hover {
          color: var(--text);
        }
        .promo-modal-content form {
          padding: 24px;
        }
        .promo-modal-content .form-group {
          margin-bottom: 16px;
        }
        .promo-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .promo-modal-content .form-input,
        .promo-modal-content .form-select,
        .promo-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
        .promo-modal-content .form-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          margin-bottom: 16px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const promosData = ${JSON.stringify(promotions)};
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

        function openPromoModal() {
          document.getElementById('modal-title').textContent = 'Create Promotion';
          document.getElementById('promo-id').value = '';
          document.getElementById('promo-name').value = '';
          document.getElementById('promo-description').value = '';
          document.getElementById('promo-code').value = '';
          document.getElementById('promo-discount-type').value = 'percentage';
          document.getElementById('promo-discount-value').value = '';
          document.getElementById('promo-min-order').value = '0';
          document.getElementById('promo-start-date').value = today;
          document.getElementById('promo-end-date').value = nextMonth;
          document.getElementById('promo-max-uses').value = '0';
          document.getElementById('promo-active').checked = true;
          const modal = document.getElementById('promo-modal');
          modal.style.display = 'flex';
        }

        function editPromo(id) {
          const promo = promosData.find(p => p.id === id);
          if (!promo) return;

          document.getElementById('modal-title').textContent = 'Edit Promotion';
          document.getElementById('promo-id').value = promo.id;
          document.getElementById('promo-name').value = promo.name;
          document.getElementById('promo-description').value = promo.description || '';
          document.getElementById('promo-code').value = promo.code;
          document.getElementById('promo-discount-type').value = promo.discount_type;
          document.getElementById('promo-discount-value').value = promo.discount_value;
          document.getElementById('promo-min-order').value = promo.min_order_value || '0';
          document.getElementById('promo-start-date').value = promo.start_date ? promo.start_date.split('T')[0] : '';
          document.getElementById('promo-end-date').value = promo.end_date ? promo.end_date.split('T')[0] : '';
          document.getElementById('promo-max-uses').value = promo.max_uses || '0';
          document.getElementById('promo-active').checked = promo.is_active === 1;
          const modal = document.getElementById('promo-modal');
          modal.style.display = 'flex';
        }

        function closePromoModal() {
          document.getElementById('promo-modal').style.display = 'none';
        }

        async function savePromo(e) {
          e.preventDefault();

          const id = document.getElementById('promo-id').value;

          const data = {
            name: document.getElementById('promo-name').value,
            description: document.getElementById('promo-description').value,
            code: document.getElementById('promo-code').value.toUpperCase(),
            discount_type: document.getElementById('promo-discount-type').value,
            discount_value: parseFloat(document.getElementById('promo-discount-value').value),
            min_order_value: parseFloat(document.getElementById('promo-min-order').value) || 0,
            start_date: document.getElementById('promo-start-date').value,
            end_date: document.getElementById('promo-end-date').value,
            max_uses: parseInt(document.getElementById('promo-max-uses').value) || 0,
            is_active: document.getElementById('promo-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/promotions/' + id : '/api/promotions';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save promotion');
            }
          } catch (err) {
            alert('Error saving promotion');
          }
        }

        async function togglePromo(id) {
          try {
            const res = await fetch('/api/promotions/' + id + '/toggle', { method: 'PUT' });
            if (res.ok) location.reload();
            else alert('Failed to toggle promotion');
          } catch (err) {
            alert('Error toggling promotion');
          }
        }

        async function deletePromo(id) {
          if (!confirm('Delete this promotion?')) return;
          try {
            const res = await fetch('/api/promotions/' + id, { method: 'DELETE' });
            if (res.ok) location.reload();
            else alert('Failed to delete');
          } catch (err) {
            alert('Failed to delete');
          }
        }
      `}} />
    </AdminLayout>
  );
};

interface PromotionFormProps {
  promotion?: Promotion;
}

export const AdminPromotionFormPage: FC<PromotionFormProps> = ({ promotion }) => {
  const isEdit = !!promotion;
  const today = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout title={isEdit ? 'Edit Promotion' : 'New Promotion'} currentPath="/admin/promotions">
      <div class="admin-header">
        <h1 class="admin-title">{isEdit ? 'Edit Promotion' : 'Create Promotion'}</h1>
        <a href="/admin/promotions" class="btn btn-ghost">Cancel</a>
      </div>

      <div class="card" style="padding: 24px; max-width: 800px;">
        <form method="POST" action={isEdit ? `/api/promotions/${promotion.id}` : '/api/promotions'}>
          <input type="hidden" name="_method" value={isEdit ? 'PUT' : 'POST'} />

          <div class="form-group">
            <label class="form-label">Promotion Name *</label>
            <input type="text" name="name" class="form-input" value={promotion?.name || ''} required placeholder="e.g., Summer Special" />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-textarea" placeholder="Brief description of the promotion">{promotion?.description || ''}</textarea>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Promo Code *</label>
              <input type="text" name="code" class="form-input" value={promotion?.code || ''} required placeholder="e.g., SUMMER20" style="text-transform: uppercase;" />
              <div class="form-hint">Customers will enter this code at checkout</div>
            </div>

            <div class="form-group">
              <label class="form-label">Discount Type *</label>
              <select name="discount_type" class="form-select" required>
                <option value="percentage" selected={promotion?.discount_type === 'percentage'}>Percentage (%)</option>
                <option value="fixed" selected={promotion?.discount_type === 'fixed'}>Fixed Amount (USD)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Discount Value *</label>
              <input type="number" name="discount_value" step="0.01" class="form-input" value={promotion?.discount_value || ''} required placeholder="e.g., 20" />
              <div class="form-hint">Enter 20 for 20% or $20</div>
            </div>

            <div class="form-group">
              <label class="form-label">Minimum Order Value</label>
              <input type="number" name="min_order_value" step="0.01" class="form-input" value={promotion?.min_order_value || '0'} placeholder="0" />
              <div class="form-hint">Set to 0 for no minimum</div>
            </div>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Start Date *</label>
              <input type="date" name="start_date" class="form-input" value={promotion?.start_date?.split('T')[0] || today} required />
            </div>

            <div class="form-group">
              <label class="form-label">End Date *</label>
              <input type="date" name="end_date" class="form-input" value={promotion?.end_date?.split('T')[0] || ''} required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Maximum Uses</label>
            <input type="number" name="max_uses" class="form-input" value={promotion?.max_uses || '0'} placeholder="0" />
            <div class="form-hint">Set to 0 for unlimited uses</div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="is_active" value="1" checked={promotion?.is_active !== 0} />
              <span>Active (can be used by customers)</span>
            </label>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">{isEdit ? 'Update Promotion' : 'Create Promotion'}</button>
            <a href="/admin/promotions" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
