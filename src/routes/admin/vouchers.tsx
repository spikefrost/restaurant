import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { VoucherCode, VoucherBatch, CustomerSegment } from '../../types';
import { escapeHtml, formatDate } from '../../utils/helpers';

interface VouchersPageProps {
  vouchers: VoucherCode[];
  batches: VoucherBatch[];
  segments: CustomerSegment[];
  stats: {
    total: number;
    active: number;
    used: number;
    expired: number;
  };
}

export const AdminVouchersPage: FC<VouchersPageProps> = ({ vouchers, batches, segments, stats }) => {
  return (
    <AdminLayout title="Voucher Codes" currentPath="/admin/vouchers">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Voucher Codes</h1>
          <p class="text-muted" style="margin-top: 4px;">Generate and manage unique promo codes</p>
        </div>
        <div class="flex gap-2">
          <button onclick="openBatchModal()" class="btn btn-secondary">Generate Batch</button>
          <button onclick="openVoucherModal()" class="btn btn-primary">+ Single Voucher</button>
        </div>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Codes</div>
          <div class="stat-value">{stats.total.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{stats.active}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Used</div>
          <div class="stat-value" style="color: var(--primary);">{stats.used}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Expired/Revoked</div>
          <div class="stat-value" style="color: var(--text-muted);">{stats.expired}</div>
        </div>
      </div>

      {/* Batches Section */}
      {batches.length > 0 && (
        <div class="card" style="margin-bottom: 24px;">
          <div class="card-header">
            <h3 class="card-title">Generated Batches</h3>
          </div>
          <div class="table-container" style="box-shadow: none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Batch Name</th>
                  <th>Codes</th>
                  <th>Discount</th>
                  <th>Validity</th>
                  <th>Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr>
                    <td>
                      <div style="font-weight: 600;">{escapeHtml(batch.name)}</div>
                      <div class="text-muted" style="font-size: 12px;">
                        Prefix: {escapeHtml(batch.code_prefix)}
                      </div>
                    </td>
                    <td>{batch.total_codes.toLocaleString()}</td>
                    <td>
                      {batch.discount_type === 'percentage' ? (
                        <span>{batch.discount_value}% off</span>
                      ) : batch.discount_type === 'fixed' ? (
                        <span>${batch.discount_value} off</span>
                      ) : (
                        <span>Free Item</span>
                      )}
                    </td>
                    <td>
                      <div style="font-size: 12px;">{formatDate(batch.valid_from)}</div>
                      <div class="text-muted" style="font-size: 11px;">to {formatDate(batch.valid_until)}</div>
                    </td>
                    <td>
                      <div class="progress-mini">
                        <div class="progress-bar" style={`width: ${batch.total_codes > 0 ? (batch.codes_used / batch.total_codes * 100) : 0}%`}></div>
                      </div>
                      <span style="font-size: 12px;">{batch.codes_used} / {batch.total_codes}</span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button onclick={`exportBatch(${batch.id})`} class="btn btn-ghost btn-sm">Export</button>
                        <button onclick={`deleteBatch(${batch.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Vouchers Table */}
      {vouchers.length > 0 ? (
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <h3 class="card-title">All Voucher Codes</h3>
            <div class="flex gap-2">
              <input type="text" id="search-voucher" class="form-input" placeholder="Search codes..." style="width: 200px;" oninput="filterVouchers()" />
              <select id="filter-status" class="form-select" style="width: 140px;" onchange="filterVouchers()">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
          <div class="table-container" style="box-shadow: none;">
            <table class="table" id="vouchers-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(voucher => {
                  const statusColors: Record<string, string> = {
                    active: 'var(--success)',
                    used: 'var(--primary)',
                    expired: 'var(--text-muted)',
                    revoked: 'var(--error)'
                  };
                  return (
                    <tr data-code={voucher.code.toLowerCase()} data-status={voucher.status}>
                      <td>
                        <div class="voucher-code">
                          <span class="code-text">{escapeHtml(voucher.code)}</span>
                          <button onclick={`copyCode('${voucher.code}')`} class="copy-btn" title="Copy code">📋</button>
                        </div>
                      </td>
                      <td>
                        {voucher.discount_type === 'percentage' ? (
                          <span class="discount-badge">{voucher.discount_value}%</span>
                        ) : voucher.discount_type === 'fixed' ? (
                          <span class="discount-badge">${voucher.discount_value}</span>
                        ) : (
                          <span class="discount-badge">Free Item</span>
                        )}
                        {voucher.min_order_value > 0 && (
                          <div class="text-muted" style="font-size: 11px;">Min: ${voucher.min_order_value}</div>
                        )}
                      </td>
                      <td>
                        {voucher.is_single_use ? (
                          <span class="type-badge single">Single Use</span>
                        ) : (
                          <span class="type-badge multi">Multi Use</span>
                        )}
                        {voucher.customer_id && <div class="text-muted" style="font-size: 11px;">Customer-specific</div>}
                        {voucher.segment_id && <div class="text-muted" style="font-size: 11px;">Segment-specific</div>}
                      </td>
                      <td>
                        <div style="font-size: 12px;">{formatDate(voucher.valid_from)}</div>
                        <div class="text-muted" style="font-size: 11px;">to {formatDate(voucher.valid_until)}</div>
                      </td>
                      <td>
                        <span class="status-pill" style={`background: ${statusColors[voucher.status]}20; color: ${statusColors[voucher.status]};`}>
                          {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                        </span>
                        {voucher.used_at && (
                          <div class="text-muted" style="font-size: 11px;">Used: {formatDate(voucher.used_at)}</div>
                        )}
                      </td>
                      <td>
                        <div class="table-actions">
                          {voucher.status === 'active' && (
                            <button onclick={`revokeVoucher(${voucher.id})`} class="btn btn-ghost btn-sm text-error">Revoke</button>
                          )}
                          {voucher.status === 'revoked' && (
                            <button onclick={`reactivateVoucher(${voucher.id})`} class="btn btn-ghost btn-sm">Reactivate</button>
                          )}
                        </div>
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
          <div class="empty-state-icon">🎟️</div>
          <h3 class="empty-state-title">No Voucher Codes</h3>
          <p class="empty-state-text">Generate voucher batches or create individual codes for promotions.</p>
          <div class="flex gap-2 justify-center">
            <button onclick="openBatchModal()" class="btn btn-secondary">Generate Batch</button>
            <button onclick="openVoucherModal()" class="btn btn-primary">+ Single Voucher</button>
          </div>
        </div>
      )}

      {/* Batch Generation Modal */}
      <div id="batch-modal" class="voucher-modal">
        <div class="voucher-modal-backdrop" onclick="closeBatchModal()"></div>
        <div class="voucher-modal-content">
          <div class="modal-header">
            <h2>Generate Voucher Batch</h2>
            <button onclick="closeBatchModal()" class="modal-close">&times;</button>
          </div>

          <form id="batch-form" onsubmit="generateBatch(event)">
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label class="form-label">Batch Name *</label>
                <input type="text" id="batch-name" class="form-input" required placeholder="e.g., Summer Sale 2024" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Quantity *</label>
                <input type="number" id="batch-quantity" class="form-input" required min="1" max="10000" value="100" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Code Prefix</label>
                <input type="text" id="batch-prefix" class="form-input" placeholder="e.g., SUMMER" maxlength="10" />
                <span class="form-hint">Preview: SUMMER-A1B2C3</span>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Code Length</label>
                <select id="batch-code-length" class="form-select">
                  <option value="6">6 characters</option>
                  <option value="8" selected>8 characters</option>
                  <option value="10">10 characters</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Discount Type *</label>
                <select id="batch-discount-type" class="form-select" required onchange="updateDiscountPreview()">
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;" id="discount-value-group">
                <label class="form-label">Discount Value *</label>
                <input type="number" id="batch-discount-value" class="form-input" required min="1" value="10" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Min Order Value</label>
                <input type="number" id="batch-min-order" class="form-input" min="0" value="0" step="0.01" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Max Discount</label>
                <input type="number" id="batch-max-discount" class="form-input" min="0" step="0.01" placeholder="No limit" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valid From *</label>
                <input type="date" id="batch-valid-from" class="form-input" required />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valid Until *</label>
                <input type="date" id="batch-valid-until" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Restrict to Segment (Optional)</label>
              <select id="batch-segment" class="form-select">
                <option value="">All Customers</option>
                {segments.map(seg => (
                  <option value={seg.id}>{escapeHtml(seg.name)}</option>
                ))}
              </select>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="batch-single-use" checked />
                <span>Single use per code</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Generate Codes</button>
              <button type="button" onclick="closeBatchModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {/* Single Voucher Modal */}
      <div id="voucher-modal" class="voucher-modal">
        <div class="voucher-modal-backdrop" onclick="closeVoucherModal()"></div>
        <div class="voucher-modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h2>Create Single Voucher</h2>
            <button onclick="closeVoucherModal()" class="modal-close">&times;</button>
          </div>

          <form id="voucher-form" onsubmit="createVoucher(event)">
            <div class="form-group">
              <label class="form-label">Voucher Code *</label>
              <div class="input-with-button">
                <input type="text" id="voucher-code" class="form-input" required placeholder="e.g., VIP2024" style="text-transform: uppercase;" />
                <button type="button" onclick="generateRandomCode()" class="btn btn-ghost">Random</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Discount Type *</label>
                <select id="voucher-discount-type" class="form-select" required>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_item">Free Item</option>
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Discount Value *</label>
                <input type="number" id="voucher-discount-value" class="form-input" required min="1" value="10" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Min Order</label>
                <input type="number" id="voucher-min-order" class="form-input" min="0" value="0" step="0.01" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Max Discount</label>
                <input type="number" id="voucher-max-discount" class="form-input" min="0" step="0.01" placeholder="No limit" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valid From *</label>
                <input type="date" id="voucher-valid-from" class="form-input" required />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Valid Until *</label>
                <input type="date" id="voucher-valid-until" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Restrict to Segment</label>
              <select id="voucher-segment" class="form-select">
                <option value="">All Customers</option>
                {segments.map(seg => (
                  <option value={seg.id}>{escapeHtml(seg.name)}</option>
                ))}
              </select>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="voucher-single-use" checked />
                <span>Single use only</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Create Voucher</button>
              <button type="button" onclick="closeVoucherModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .voucher-modal {
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
        .voucher-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .voucher-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .voucher-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .voucher-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .voucher-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .voucher-modal-content .modal-close:hover {
          color: var(--text);
        }
        .voucher-modal-content form {
          padding: 24px;
        }
        .voucher-modal-content .form-group {
          margin-bottom: 16px;
        }
        .voucher-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .voucher-modal-content .form-input,
        .voucher-modal-content .form-select,
        .voucher-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
        .voucher-modal-content .form-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .voucher-code {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .code-text {
          font-family: monospace;
          font-weight: 600;
          font-size: 14px;
          background: var(--bg-alt);
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .copy-btn:hover {
          opacity: 1;
        }

        .discount-badge {
          display: inline-block;
          background: var(--primary-light);
          color: var(--primary);
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
        }

        .type-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .type-badge.single {
          background: #E3F2FD;
          color: #1976D2;
        }
        .type-badge.multi {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .progress-mini {
          width: 60px;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
          display: inline-block;
          margin-right: 8px;
        }
        .progress-bar {
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          margin-bottom: 16px;
        }

        .input-with-button {
          display: flex;
          gap: 8px;
        }
        .input-with-button .form-input {
          flex: 1;
        }

        .card-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];

        function openBatchModal() {
          document.getElementById('batch-valid-from').value = today;
          document.getElementById('batch-valid-until').value = nextMonth;
          document.getElementById('batch-modal').style.display = 'flex';
        }

        function closeBatchModal() {
          document.getElementById('batch-modal').style.display = 'none';
        }

        function openVoucherModal() {
          document.getElementById('voucher-valid-from').value = today;
          document.getElementById('voucher-valid-until').value = nextMonth;
          document.getElementById('voucher-modal').style.display = 'flex';
        }

        function closeVoucherModal() {
          document.getElementById('voucher-modal').style.display = 'none';
        }

        function updateDiscountPreview() {
          const type = document.getElementById('batch-discount-type').value;
          const valueGroup = document.getElementById('discount-value-group');
          if (type === 'free_item') {
            valueGroup.style.display = 'none';
          } else {
            valueGroup.style.display = 'block';
          }
        }

        function generateRandomCode() {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          document.getElementById('voucher-code').value = code;
        }

        function copyCode(code) {
          navigator.clipboard.writeText(code).then(() => {
            alert('Code copied: ' + code);
          });
        }

        function filterVouchers() {
          const search = document.getElementById('search-voucher').value.toLowerCase();
          const status = document.getElementById('filter-status').value;
          const rows = document.querySelectorAll('#vouchers-table tbody tr');

          rows.forEach(row => {
            const code = row.dataset.code;
            const rowStatus = row.dataset.status;
            const matchSearch = !search || code.includes(search);
            const matchStatus = !status || rowStatus === status;
            row.style.display = matchSearch && matchStatus ? '' : 'none';
          });
        }

        async function generateBatch(e) {
          e.preventDefault();

          const data = {
            name: document.getElementById('batch-name').value,
            quantity: parseInt(document.getElementById('batch-quantity').value),
            code_prefix: document.getElementById('batch-prefix').value.toUpperCase(),
            code_length: parseInt(document.getElementById('batch-code-length').value),
            discount_type: document.getElementById('batch-discount-type').value,
            discount_value: parseFloat(document.getElementById('batch-discount-value').value) || 0,
            min_order_value: parseFloat(document.getElementById('batch-min-order').value) || 0,
            max_discount: parseFloat(document.getElementById('batch-max-discount').value) || null,
            valid_from: document.getElementById('batch-valid-from').value,
            valid_until: document.getElementById('batch-valid-until').value,
            segment_id: document.getElementById('batch-segment').value || null,
            is_single_use: document.getElementById('batch-single-use').checked ? 1 : 0
          };

          try {
            const res = await fetch('/api/vouchers/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              const result = await res.json();
              alert('Generated ' + result.count + ' voucher codes!');
              location.reload();
            } else {
              alert('Failed to generate batch');
            }
          } catch (err) {
            alert('Error generating batch');
          }
        }

        async function createVoucher(e) {
          e.preventDefault();

          const data = {
            code: document.getElementById('voucher-code').value.toUpperCase(),
            discount_type: document.getElementById('voucher-discount-type').value,
            discount_value: parseFloat(document.getElementById('voucher-discount-value').value) || 0,
            min_order_value: parseFloat(document.getElementById('voucher-min-order').value) || 0,
            max_discount: parseFloat(document.getElementById('voucher-max-discount').value) || null,
            valid_from: document.getElementById('voucher-valid-from').value,
            valid_until: document.getElementById('voucher-valid-until').value,
            segment_id: document.getElementById('voucher-segment').value || null,
            is_single_use: document.getElementById('voucher-single-use').checked ? 1 : 0
          };

          try {
            const res = await fetch('/api/vouchers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              const err = await res.json();
              alert(err.error || 'Failed to create voucher');
            }
          } catch (err) {
            alert('Error creating voucher');
          }
        }

        async function revokeVoucher(id) {
          if (!confirm('Revoke this voucher code?')) return;
          try {
            const res = await fetch('/api/vouchers/' + id + '/revoke', { method: 'POST' });
            if (res.ok) location.reload();
            else alert('Failed to revoke');
          } catch (err) {
            alert('Error revoking');
          }
        }

        async function reactivateVoucher(id) {
          try {
            const res = await fetch('/api/vouchers/' + id + '/reactivate', { method: 'POST' });
            if (res.ok) location.reload();
            else alert('Failed to reactivate');
          } catch (err) {
            alert('Error reactivating');
          }
        }

        async function exportBatch(id) {
          window.location.href = '/api/vouchers/batch/' + id + '/export';
        }

        async function deleteBatch(id) {
          if (!confirm('Delete this batch and ALL its voucher codes? This cannot be undone.')) return;
          try {
            const res = await fetch('/api/vouchers/batch/' + id, { method: 'DELETE' });
            if (res.ok) location.reload();
            else alert('Failed to delete batch');
          } catch (err) {
            alert('Error deleting batch');
          }
        }
      `}} />
    </AdminLayout>
  );
};
