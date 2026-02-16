import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { LoyaltyReward, CustomerSegment, LoyaltyTier } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

const REWARD_TYPES = [
  { id: 'discount', name: 'Discount', icon: '💰', desc: 'Percentage or fixed discount' },
  { id: 'free_item', name: 'Free Item', icon: '🎁', desc: 'Redeem for free item' },
  { id: 'voucher', name: 'Voucher', icon: '🎟️', desc: 'Generate voucher code' },
  { id: 'experience', name: 'Experience', icon: '✨', desc: 'Special experience' },
];

interface RewardsCatalogPageProps {
  rewards: LoyaltyReward[];
  segments: CustomerSegment[];
  tiers: LoyaltyTier[];
}

export const AdminRewardsCatalogPage: FC<RewardsCatalogPageProps> = ({ rewards, segments, tiers }) => {
  const activeRewards = rewards.filter(r => r.is_active);
  const totalRedeemed = rewards.reduce((sum, r) => sum + (r.quantity_redeemed || 0), 0);

  return (
    <AdminLayout title="Rewards Catalog" currentPath="/admin/loyalty/rewards">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Rewards Catalog</h1>
          <p class="text-muted" style="margin-top: 4px;">Manage rewards that customers can redeem with points</p>
        </div>
        <button onclick="openRewardModal()" class="btn btn-primary">+ Add Reward</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Rewards</div>
          <div class="stat-value">{rewards.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{activeRewards.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Redeemed</div>
          <div class="stat-value" style="color: var(--primary);">{totalRedeemed.toLocaleString()}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Points Cost</div>
          <div class="stat-value">{rewards.length > 0 ? Math.round(rewards.reduce((sum, r) => sum + r.points_cost, 0) / rewards.length).toLocaleString() : 0}</div>
        </div>
      </div>

      {/* Rewards Grid */}
      {rewards.length > 0 ? (
        <div class="rewards-grid">
          {rewards.map(reward => {
            const type = REWARD_TYPES.find(t => t.id === reward.reward_type) || REWARD_TYPES[0];
            const segment = segments.find(s => s.id === reward.segment_id);
            const tier = tiers.find(t => t.name === reward.tier_required);
            const availableStock = reward.quantity_available !== null
              ? reward.quantity_available - reward.quantity_redeemed
              : null;
            const isLowStock = availableStock !== null && availableStock <= 10 && availableStock > 0;
            const isOutOfStock = availableStock !== null && availableStock <= 0;

            return (
              <div class={`reward-card ${!reward.is_active ? 'inactive' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}>
                {reward.image_url ? (
                  <div class="reward-image" style={`background-image: url('${reward.image_url}')`}>
                    {isOutOfStock && <div class="stock-overlay">Out of Stock</div>}
                    {isLowStock && <div class="stock-badge">Only {availableStock} left</div>}
                  </div>
                ) : (
                  <div class="reward-image placeholder">
                    <span class="placeholder-icon">{type.icon}</span>
                    {isOutOfStock && <div class="stock-overlay">Out of Stock</div>}
                    {isLowStock && <div class="stock-badge">Only {availableStock} left</div>}
                  </div>
                )}

                <div class="reward-content">
                  <div class="reward-header">
                    <span class="reward-type-badge">
                      {type.icon} {type.name}
                    </span>
                    {tier && (
                      <span class="tier-badge" style={tier.color ? `background: ${tier.color}20; color: ${tier.color};` : ''}>
                        {tier.icon || '⭐'} {tier.name}
                      </span>
                    )}
                  </div>

                  <h3 class="reward-name">{escapeHtml(reward.name)}</h3>
                  {reward.description && (
                    <p class="reward-description">{escapeHtml(reward.description)}</p>
                  )}

                  <div class="points-cost">
                    <span class="points-icon">⭐</span>
                    <span class="points-value">{reward.points_cost.toLocaleString()}</span>
                    <span class="points-label">points</span>
                  </div>

                  <div class="reward-stats">
                    <div class="stat">
                      <span class="stat-value">{reward.quantity_redeemed}</span>
                      <span class="stat-label">Redeemed</span>
                    </div>
                    {availableStock !== null && (
                      <div class="stat">
                        <span class={`stat-value ${isLowStock ? 'low' : ''} ${isOutOfStock ? 'out' : ''}`}>{availableStock}</span>
                        <span class="stat-label">Available</span>
                      </div>
                    )}
                    {segment && (
                      <div class="stat segment">
                        <span class="stat-value">🎯</span>
                        <span class="stat-label">{escapeHtml(segment.name)}</span>
                      </div>
                    )}
                  </div>

                  {(reward.start_date || reward.end_date) && (
                    <div class="reward-dates">
                      📅 {reward.start_date ? formatDate(reward.start_date) : 'Now'} - {reward.end_date ? formatDate(reward.end_date) : 'Ongoing'}
                    </div>
                  )}

                  <div class="reward-actions">
                    <button onclick={`editReward(${reward.id})`} class="btn btn-ghost btn-sm">Edit</button>
                    <button onclick={`toggleReward(${reward.id})`} class="btn btn-ghost btn-sm">
                      {reward.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onclick={`deleteReward(${reward.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🎁</div>
          <h3 class="empty-state-title">No Rewards</h3>
          <p class="empty-state-text">Add rewards to your catalog that customers can redeem with loyalty points.</p>
          <button onclick="openRewardModal()" class="btn btn-primary">+ Add Reward</button>
        </div>
      )}

      {/* Reward Modal */}
      <div id="reward-modal" class="reward-modal">
        <div class="reward-modal-backdrop" onclick="closeRewardModal()"></div>
        <div class="reward-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Add Reward</h2>
            <button onclick="closeRewardModal()" class="modal-close">&times;</button>
          </div>

          <form id="reward-form" onsubmit="saveReward(event)">
            <input type="hidden" id="reward-id" value="" />

            <div class="form-group">
              <label class="form-label">Reward Name *</label>
              <input type="text" id="reward-name" class="form-input" required placeholder="e.g., Free Coffee" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="reward-description" class="form-textarea" rows={2} placeholder="Describe the reward"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="text" id="reward-image" class="form-input" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label class="form-label">Reward Type *</label>
              <div class="type-grid">
                {REWARD_TYPES.map(type => (
                  <label class="type-option">
                    <input type="radio" name="reward_type" value={type.id} />
                    <div class="type-content">
                      <span class="type-icon">{type.icon}</span>
                      <span class="type-name">{type.name}</span>
                      <span class="type-desc">{type.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reward Configuration</label>
              <textarea id="reward-config" class="form-textarea" rows={2} placeholder='e.g., {"discount_percent": 20} or {"item_id": 5}'></textarea>
              <span class="form-hint">JSON config for the reward (discount amount, item ID, etc.)</span>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Points Cost *</label>
                <input type="number" id="reward-points" class="form-input" required min="1" value="100" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Quantity Available</label>
                <input type="number" id="reward-quantity" class="form-input" min="0" placeholder="Unlimited" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Required Tier</label>
                <select id="reward-tier" class="form-select">
                  <option value="">Any Tier</option>
                  {tiers.map(tier => (
                    <option value={tier.name}>{tier.icon} {escapeHtml(tier.name)}</option>
                  ))}
                </select>
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Restrict to Segment</label>
                <select id="reward-segment" class="form-select">
                  <option value="">All Customers</option>
                  {segments.map(seg => (
                    <option value={seg.id}>{escapeHtml(seg.name)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Start Date (Optional)</label>
                <input type="date" id="reward-start-date" class="form-input" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">End Date (Optional)</label>
                <input type="date" id="reward-end-date" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="reward-active" checked />
                <span>Active</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Reward</button>
              <button type="button" onclick="closeRewardModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .reward-modal {
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
        .reward-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .reward-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .reward-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .reward-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .reward-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .reward-modal-content .modal-close:hover {
          color: var(--text);
        }
        .reward-modal-content form {
          padding: 24px;
        }
        .reward-modal-content .form-group {
          margin-bottom: 16px;
        }
        .reward-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .reward-modal-content .form-input,
        .reward-modal-content .form-select,
        .reward-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
        .reward-modal-content .form-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .reward-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all 0.2s;
        }
        .reward-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .reward-card.inactive {
          opacity: 0.6;
        }
        .reward-card.out-of-stock .reward-content {
          opacity: 0.7;
        }

        .reward-image {
          height: 160px;
          background-size: cover;
          background-position: center;
          background-color: var(--bg-alt);
          position: relative;
        }
        .reward-image.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-light), #FFECB3);
        }
        .placeholder-icon {
          font-size: 48px;
        }
        .stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
        }
        .stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #FF5722;
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .reward-content {
          padding: 16px;
        }
        .reward-header {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .reward-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--bg-alt);
        }
        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          background: #FFF3E0;
          color: #F57C00;
        }

        .reward-name {
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 6px;
        }
        .reward-description {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 14px;
          line-height: 1.4;
        }

        .points-cost {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--primary-light), #FFE0B2);
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 14px;
        }
        .points-icon {
          font-size: 20px;
        }
        .points-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
        }
        .points-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .reward-stats {
          display: flex;
          gap: 16px;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          margin-bottom: 10px;
        }
        .reward-stats .stat {
          text-align: center;
        }
        .reward-stats .stat-value {
          display: block;
          font-size: 16px;
          font-weight: 700;
        }
        .reward-stats .stat-value.low {
          color: #FF9800;
        }
        .reward-stats .stat-value.out {
          color: var(--error);
        }
        .reward-stats .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .reward-stats .stat.segment {
          margin-left: auto;
        }

        .reward-dates {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .reward-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }

        /* Modal styles */
        .type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .type-option {
          cursor: pointer;
        }
        .type-option input {
          display: none;
        }
        .type-content {
          border: 2px solid var(--border);
          border-radius: 10px;
          padding: 14px;
          text-align: center;
          transition: all 0.2s;
        }
        .type-option input:checked + .type-content {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .type-content .type-icon {
          display: block;
          font-size: 28px;
          margin-bottom: 6px;
        }
        .type-content .type-name {
          display: block;
          font-size: 13px;
          font-weight: 600;
        }
        .type-content .type-desc {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
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
        const rewardsData = ${JSON.stringify(rewards)};

        function openRewardModal() {
          document.getElementById('modal-title').textContent = 'Add Reward';
          document.getElementById('reward-id').value = '';
          document.getElementById('reward-name').value = '';
          document.getElementById('reward-description').value = '';
          document.getElementById('reward-image').value = '';
          document.querySelector('input[name="reward_type"][value="discount"]').checked = true;
          document.getElementById('reward-config').value = '';
          document.getElementById('reward-points').value = '100';
          document.getElementById('reward-quantity').value = '';
          document.getElementById('reward-tier').value = '';
          document.getElementById('reward-segment').value = '';
          document.getElementById('reward-start-date').value = '';
          document.getElementById('reward-end-date').value = '';
          document.getElementById('reward-active').checked = true;
          const modal = document.getElementById('reward-modal');
          modal.style.display = 'flex';
        }

        function editReward(id) {
          const reward = rewardsData.find(r => r.id === id);
          if (!reward) return;

          document.getElementById('modal-title').textContent = 'Edit Reward';
          document.getElementById('reward-id').value = reward.id;
          document.getElementById('reward-name').value = reward.name;
          document.getElementById('reward-description').value = reward.description || '';
          document.getElementById('reward-image').value = reward.image_url || '';
          document.querySelector('input[name="reward_type"][value="' + reward.reward_type + '"]').checked = true;
          document.getElementById('reward-config').value = reward.reward_config || '';
          document.getElementById('reward-points').value = reward.points_cost;
          document.getElementById('reward-quantity').value = reward.quantity_available || '';
          document.getElementById('reward-tier').value = reward.tier_required || '';
          document.getElementById('reward-segment').value = reward.segment_id || '';
          document.getElementById('reward-start-date').value = reward.start_date ? reward.start_date.split('T')[0] : '';
          document.getElementById('reward-end-date').value = reward.end_date ? reward.end_date.split('T')[0] : '';
          document.getElementById('reward-active').checked = reward.is_active === 1;
          const modal = document.getElementById('reward-modal');
          modal.style.display = 'flex';
        }

        function closeRewardModal() {
          document.getElementById('reward-modal').style.display = 'none';
        }

        async function saveReward(e) {
          e.preventDefault();

          const id = document.getElementById('reward-id').value;
          const rewardType = document.querySelector('input[name="reward_type"]:checked')?.value;

          const data = {
            name: document.getElementById('reward-name').value,
            description: document.getElementById('reward-description').value,
            image_url: document.getElementById('reward-image').value || null,
            reward_type: rewardType,
            reward_config: document.getElementById('reward-config').value || '{}',
            points_cost: parseInt(document.getElementById('reward-points').value),
            quantity_available: document.getElementById('reward-quantity').value ? parseInt(document.getElementById('reward-quantity').value) : null,
            tier_required: document.getElementById('reward-tier').value || null,
            segment_id: document.getElementById('reward-segment').value || null,
            start_date: document.getElementById('reward-start-date').value || null,
            end_date: document.getElementById('reward-end-date').value || null,
            is_active: document.getElementById('reward-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/rewards/' + id : '/api/rewards';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save reward');
            }
          } catch (err) {
            alert('Error saving reward');
          }
        }

        async function toggleReward(id) {
          try {
            const res = await fetch('/api/rewards/' + id + '/toggle', { method: 'PUT' });
            if (res.ok) location.reload();
            else alert('Failed to toggle reward');
          } catch (err) {
            alert('Error toggling reward');
          }
        }

        async function deleteReward(id) {
          if (!confirm('Delete this reward from the catalog?')) return;
          try {
            const res = await fetch('/api/rewards/' + id, { method: 'DELETE' });
            if (res.ok) location.reload();
            else alert('Failed to delete');
          } catch (err) {
            alert('Error deleting');
          }
        }
      `}} />
    </AdminLayout>
  );
};
