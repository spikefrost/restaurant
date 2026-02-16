import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { LoyaltyTier } from '../../types';
import { escapeHtml } from '../../utils/helpers';

interface LoyaltyPageProps {
  tiers: LoyaltyTier[];
}

export const AdminLoyaltyPage: FC<LoyaltyPageProps> = ({ tiers }) => {
  return (
    <AdminLayout title="Loyalty Tiers" currentPath="/admin/loyalty">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Loyalty Program</h1>
          <p class="text-muted" style="margin-top: 4px;">Configure customer tiers, points multipliers, and benefits</p>
        </div>
        <button onclick="openTierModal()" class="btn btn-primary">+ Add Tier</button>
      </div>

      {/* Stats Overview */}
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Tiers</div>
          <div class="stat-value">{tiers.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Tiers</div>
          <div class="stat-value">{tiers.filter(t => t.is_active).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Max Points Multiplier</div>
          <div class="stat-value">{tiers.length > 0 ? Math.max(...tiers.map(t => t.points_multiplier)) : 1}x</div>
        </div>
      </div>

      {/* Tiers Visual Display */}
      <div class="card" style="padding: 24px; margin-bottom: 24px;">
        <h3 style="margin-bottom: 20px;">Tier Progression</h3>
        <div class="tier-progression">
          {tiers.length > 0 ? (
            <div class="tier-track">
              {tiers.map((tier, idx) => {
                const benefits = tier.benefits ? JSON.parse(tier.benefits) : [];
                return (
                  <div class={`tier-card ${!tier.is_active ? 'inactive' : ''}`} style={`--tier-color: ${tier.color || '#888'}`}>
                    <div class="tier-icon">{tier.icon || '⭐'}</div>
                    <div class="tier-name" style={`color: ${tier.color || '#333'}`}>{escapeHtml(tier.name)}</div>
                    <div class="tier-points">{tier.min_points.toLocaleString()} pts</div>
                    <div class="tier-multiplier">{tier.points_multiplier}x Points</div>
                    <div class="tier-benefits">
                      {benefits.slice(0, 3).map((b: string) => (
                        <div class="tier-benefit-tag">{escapeHtml(b)}</div>
                      ))}
                      {benefits.length > 3 && <div class="tier-benefit-more">+{benefits.length - 3} more</div>}
                    </div>
                    <div class="tier-actions">
                      <button onclick={`editTier(${tier.id})`} class="btn btn-ghost btn-sm">Edit</button>
                      <button onclick={`deleteTier(${tier.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="empty-state" style="padding: 40px;">
              <div class="empty-state-icon">⭐</div>
              <h3 class="empty-state-title">No Loyalty Tiers</h3>
              <p class="empty-state-text">Create tiers to reward your loyal customers with escalating benefits.</p>
              <button onclick="openTierModal()" class="btn btn-primary">+ Create First Tier</button>
            </div>
          )}
        </div>
      </div>

      {/* Tiers Table */}
      {tiers.length > 0 && (
        <div class="card">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
            <h3>All Tiers</h3>
          </div>
          <div class="table-container" style="box-shadow: none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Tier</th>
                  <th>Min Points</th>
                  <th>Multiplier</th>
                  <th>Benefits</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(tier => {
                  const benefits = tier.benefits ? JSON.parse(tier.benefits) : [];
                  return (
                    <tr>
                      <td>
                        <span class="text-muted">#{tier.sort_order}</span>
                      </td>
                      <td>
                        <div class="flex items-center gap-2">
                          <span style={`font-size: 20px;`}>{tier.icon || '⭐'}</span>
                          <div>
                            <div style={`font-weight: 600; color: ${tier.color || 'inherit'}`}>{escapeHtml(tier.name)}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong>{tier.min_points.toLocaleString()}</strong> pts</td>
                      <td>
                        <span class="badge" style={`background: ${tier.color}20; color: ${tier.color}`}>
                          {tier.points_multiplier}x
                        </span>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          {benefits.slice(0, 2).map((b: string) => (
                            <span class="badge" style="background: var(--bg-alt); color: var(--text); font-size: 11px;">{escapeHtml(b)}</span>
                          ))}
                          {benefits.length > 2 && (
                            <span class="text-muted" style="font-size: 12px;">+{benefits.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {tier.is_active ? (
                          <span class="badge badge-new">Active</span>
                        ) : (
                          <span class="badge" style="background: var(--text-muted); color: white;">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div class="table-actions">
                          <button onclick={`editTier(${tier.id})`} class="btn btn-ghost btn-sm">Edit</button>
                          <button onclick={`deleteTier(${tier.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Modal */}
      <div id="tier-modal" class="tier-modal">
        <div class="tier-modal-backdrop" onclick="closeTierModal()"></div>
        <div class="tier-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Add Loyalty Tier</h2>
            <button onclick="closeTierModal()" class="modal-close">&times;</button>
          </div>
          <form id="tier-form" onsubmit="saveTier(event)">
            <input type="hidden" id="tier-id" value="" />

            <div class="form-group">
              <label class="form-label">Tier Name *</label>
              <input type="text" id="tier-name" class="form-input" required placeholder="e.g., Gold Member" />
            </div>

            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label class="form-label">Minimum Points *</label>
                <input type="number" id="tier-min-points" class="form-input" required min="0" placeholder="e.g., 500" />
                <div class="form-hint">Points needed to reach this tier</div>
              </div>
              <div class="form-group">
                <label class="form-label">Points Multiplier *</label>
                <input type="number" id="tier-multiplier" class="form-input" required min="1" step="0.1" placeholder="e.g., 1.5" />
                <div class="form-hint">Multiply points earned (1 = normal)</div>
              </div>
            </div>

            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label class="form-label">Icon</label>
                <input type="text" id="tier-icon" class="form-input" placeholder="e.g., ⭐ or 👑" maxlength="4" />
              </div>
              <div class="form-group">
                <label class="form-label">Color</label>
                <input type="color" id="tier-color" class="form-input" style="height: 44px; padding: 4px;" value="#E85D04" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Benefits</label>
              <div id="benefits-container">
                <div class="benefit-row">
                  <input type="text" class="form-input benefit-input" placeholder="e.g., Free delivery on all orders" />
                  <button type="button" onclick="removeBenefit(this)" class="btn btn-ghost btn-sm text-error">×</button>
                </div>
              </div>
              <button type="button" onclick="addBenefit()" class="btn btn-ghost btn-sm" style="margin-top: 8px;">+ Add Benefit</button>
            </div>

            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label class="form-label">Sort Order</label>
                <input type="number" id="tier-sort" class="form-input" min="0" value="0" />
              </div>
              <div class="form-group" style="display: flex; align-items: flex-end;">
                <label class="flex items-center gap-2" style="padding-bottom: 10px;">
                  <input type="checkbox" id="tier-active" checked />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Tier</button>
              <button type="button" onclick="closeTierModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .tier-modal {
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
        .tier-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .tier-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .tier-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .tier-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .tier-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .tier-modal-content .modal-close:hover {
          color: var(--text);
        }
        .tier-modal-content form {
          padding: 24px;
        }
        .tier-modal-content .form-group {
          margin-bottom: 16px;
        }
        .tier-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .tier-modal-content .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
        .tier-modal-content .form-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .tier-progression {
          overflow-x: auto;
          padding: 10px 0;
        }
        .tier-track {
          display: flex;
          gap: 20px;
          min-width: max-content;
        }
        .tier-card {
          background: white;
          border: 2px solid var(--tier-color, #ddd);
          border-radius: 16px;
          padding: 20px;
          min-width: 200px;
          text-align: center;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tier-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .tier-card.inactive {
          opacity: 0.5;
        }
        .tier-icon {
          font-size: 40px;
          margin-bottom: 8px;
        }
        .tier-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .tier-points {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .tier-multiplier {
          display: inline-block;
          background: var(--tier-color, #ddd);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .tier-benefits {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }
        .tier-benefit-tag {
          font-size: 11px;
          background: var(--bg-alt);
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tier-benefit-more {
          font-size: 11px;
          color: var(--text-muted);
        }
        .tier-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .benefit-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .benefit-row .form-input {
          flex: 1;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const tiersData = ${JSON.stringify(tiers)};

        function openTierModal() {
          document.getElementById('modal-title').textContent = 'Add Loyalty Tier';
          document.getElementById('tier-id').value = '';
          document.getElementById('tier-name').value = '';
          document.getElementById('tier-min-points').value = '';
          document.getElementById('tier-multiplier').value = '1';
          document.getElementById('tier-icon').value = '⭐';
          document.getElementById('tier-color').value = '#E85D04';
          document.getElementById('tier-sort').value = tiersData.length;
          document.getElementById('tier-active').checked = true;

          // Reset benefits
          document.getElementById('benefits-container').innerHTML = '<div class="benefit-row"><input type="text" class="form-input benefit-input" placeholder="e.g., Free delivery on all orders" /><button type="button" onclick="removeBenefit(this)" class="btn btn-ghost btn-sm text-error">×</button></div>';

          const modal = document.getElementById('tier-modal');
          modal.style.display = 'flex';
        }

        function editTier(id) {
          const tier = tiersData.find(t => t.id === id);
          if (!tier) return;

          document.getElementById('modal-title').textContent = 'Edit Loyalty Tier';
          document.getElementById('tier-id').value = tier.id;
          document.getElementById('tier-name').value = tier.name;
          document.getElementById('tier-min-points').value = tier.min_points;
          document.getElementById('tier-multiplier').value = tier.points_multiplier;
          document.getElementById('tier-icon').value = tier.icon || '⭐';
          document.getElementById('tier-color').value = tier.color || '#E85D04';
          document.getElementById('tier-sort').value = tier.sort_order;
          document.getElementById('tier-active').checked = tier.is_active === 1;

          // Load benefits
          const benefits = tier.benefits ? JSON.parse(tier.benefits) : [];
          const container = document.getElementById('benefits-container');
          container.innerHTML = '';
          if (benefits.length === 0) {
            addBenefit();
          } else {
            benefits.forEach(b => {
              const row = document.createElement('div');
              row.className = 'benefit-row';
              row.innerHTML = '<input type="text" class="form-input benefit-input" value="' + b.replace(/"/g, '&quot;') + '" /><button type="button" onclick="removeBenefit(this)" class="btn btn-ghost btn-sm text-error">×</button>';
              container.appendChild(row);
            });
          }

          const modal = document.getElementById('tier-modal');
          modal.style.display = 'flex';
        }

        function closeTierModal() {
          document.getElementById('tier-modal').style.display = 'none';
        }

        function addBenefit() {
          const container = document.getElementById('benefits-container');
          const row = document.createElement('div');
          row.className = 'benefit-row';
          row.innerHTML = '<input type="text" class="form-input benefit-input" placeholder="e.g., Priority support" /><button type="button" onclick="removeBenefit(this)" class="btn btn-ghost btn-sm text-error">×</button>';
          container.appendChild(row);
        }

        function removeBenefit(btn) {
          const container = document.getElementById('benefits-container');
          if (container.children.length > 1) {
            btn.parentElement.remove();
          }
        }

        async function saveTier(e) {
          e.preventDefault();

          const id = document.getElementById('tier-id').value;
          const benefits = Array.from(document.querySelectorAll('.benefit-input'))
            .map(input => input.value.trim())
            .filter(b => b);

          const data = {
            name: document.getElementById('tier-name').value,
            min_points: parseInt(document.getElementById('tier-min-points').value),
            points_multiplier: parseFloat(document.getElementById('tier-multiplier').value),
            icon: document.getElementById('tier-icon').value || '⭐',
            color: document.getElementById('tier-color').value,
            sort_order: parseInt(document.getElementById('tier-sort').value) || 0,
            is_active: document.getElementById('tier-active').checked ? 1 : 0,
            benefits: JSON.stringify(benefits)
          };

          try {
            const url = id ? '/api/loyalty/' + id : '/api/loyalty';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save tier');
            }
          } catch (err) {
            alert('Error saving tier');
          }
        }

        async function deleteTier(id) {
          if (!confirm('Delete this loyalty tier?')) return;

          try {
            const res = await fetch('/api/loyalty/' + id, { method: 'DELETE' });
            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to delete tier');
            }
          } catch (err) {
            alert('Error deleting tier');
          }
        }
      `}} />
    </AdminLayout>
  );
};
