import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { PointsEarningRule, CustomerSegment, LoyaltyTier } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

const TRIGGER_TYPES = [
  { id: 'order', name: 'Order Placed', icon: '🛒', desc: 'Earn points on purchases' },
  { id: 'signup', name: 'Account Signup', icon: '👤', desc: 'One-time signup bonus' },
  { id: 'referral', name: 'Referral', icon: '🤝', desc: 'Refer a friend' },
  { id: 'review', name: 'Leave Review', icon: '⭐', desc: 'Write a review' },
  { id: 'birthday', name: 'Birthday', icon: '🎂', desc: 'Birthday bonus' },
  { id: 'challenge_complete', name: 'Challenge Completed', icon: '🏆', desc: 'Complete a challenge' },
  { id: 'custom', name: 'Custom Event', icon: '⚡', desc: 'Custom trigger' },
];

const POINTS_TYPES = [
  { id: 'fixed', name: 'Fixed Points', desc: 'e.g., 100 points' },
  { id: 'multiplier', name: 'Multiplier', desc: 'e.g., 2x points on orders' },
  { id: 'percentage', name: 'Percentage of Spend', desc: 'e.g., 1 point per $1' },
];

interface EarningRulesPageProps {
  rules: PointsEarningRule[];
  segments: CustomerSegment[];
  tiers: LoyaltyTier[];
}

export const AdminEarningRulesPage: FC<EarningRulesPageProps> = ({ rules, segments, tiers }) => {
  const activeRules = rules.filter(r => r.is_active);

  return (
    <AdminLayout title="Points Earning" currentPath="/admin/loyalty/earning">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Points Earning Rules</h1>
          <p class="text-muted" style="margin-top: 4px;">Define how customers earn loyalty points</p>
        </div>
        <button onclick="openRuleModal()" class="btn btn-primary">+ Create Rule</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Rules</div>
          <div class="stat-value">{rules.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{activeRules.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trigger Types</div>
          <div class="stat-value">{new Set(rules.map(r => r.trigger_type)).size}</div>
        </div>
      </div>

      {/* Rules List */}
      {rules.length > 0 ? (
        <div class="rules-grid">
          {rules.map(rule => {
            const trigger = TRIGGER_TYPES.find(t => t.id === rule.trigger_type) || TRIGGER_TYPES[0];
            const pointsType = POINTS_TYPES.find(p => p.id === rule.points_type);
            const segment = segments.find(s => s.id === rule.segment_id);
            let customEventName = '';
            try {
              const conditions = JSON.parse(rule.conditions || '{}');
              customEventName = conditions.custom_event_name || '';
            } catch (e) {}

            return (
              <div class={`rule-card ${!rule.is_active ? 'inactive' : ''}`}>
                <div class="rule-header">
                  <div class="rule-trigger">
                    <span class="trigger-icon">{trigger.icon}</span>
                    <span class="trigger-name">{trigger.name}</span>
                    {rule.trigger_type === 'custom' && customEventName && (
                      <span class="custom-event-badge">{escapeHtml(customEventName)}</span>
                    )}
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked={rule.is_active === 1} onchange={`toggleRule(${rule.id})`} />
                    <span class="slider"></span>
                  </label>
                </div>

                <div class="rule-name">{escapeHtml(rule.name)}</div>
                {rule.description && (
                  <div class="rule-description">{escapeHtml(rule.description)}</div>
                )}

                <div class="points-display">
                  {rule.points_type === 'fixed' && (
                    <span class="points-value">+{rule.points_value} points</span>
                  )}
                  {rule.points_type === 'multiplier' && (
                    <span class="points-value">{rule.points_value}x points</span>
                  )}
                  {rule.points_type === 'percentage' && (
                    <span class="points-value">{rule.points_value} points per $1</span>
                  )}
                </div>

                <div class="rule-meta">
                  {segment && (
                    <span class="meta-tag segment">🎯 {escapeHtml(segment.name)}</span>
                  )}
                  {rule.tier_multiplier_enabled === 1 && (
                    <span class="meta-tag tier">⬆️ Tier Multiplier</span>
                  )}
                  {rule.start_date && (
                    <span class="meta-tag date">📅 {formatDate(rule.start_date)} - {formatDate(rule.end_date || '')}</span>
                  )}
                </div>

                <div class="rule-actions">
                  <button onclick={`editRule(${rule.id})`} class="btn btn-ghost btn-sm">Edit</button>
                  <button onclick={`duplicateRule(${rule.id})`} class="btn btn-ghost btn-sm">Duplicate</button>
                  <button onclick={`deleteRule(${rule.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">💰</div>
          <h3 class="empty-state-title">No Earning Rules</h3>
          <p class="empty-state-text">Create rules to define how customers earn loyalty points.</p>
          <button onclick="openRuleModal()" class="btn btn-primary">+ Create Rule</button>
        </div>
      )}

      {/* Rule Modal */}
      <div id="rule-modal" class="earning-modal">
        <div class="earning-modal-backdrop" onclick="closeRuleModal()"></div>
        <div class="earning-modal-content">
          <div class="earning-modal-header">
            <h2 id="modal-title">Create Earning Rule</h2>
            <button onclick="closeRuleModal()" class="earning-modal-close">&times;</button>
          </div>

          <div class="earning-modal-body">
            <form id="rule-form" onsubmit="saveRule(event)">
              <input type="hidden" id="rule-id" value="" />

              <div class="form-group">
                <label class="form-label">Rule Name *</label>
                <input type="text" id="rule-name" class="form-input" required placeholder="e.g., Order Points" />
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="rule-description" class="form-textarea" rows={2} placeholder="Describe when and how points are earned"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Trigger Event *</label>
                <div class="trigger-options">
                  {TRIGGER_TYPES.map(trigger => (
                    <label class="trigger-option">
                      <input type="radio" name="trigger_type" value={trigger.id} onchange="handleTriggerChange()" />
                      <div class="trigger-content">
                        <span class="trigger-icon">{trigger.icon}</span>
                        <span class="trigger-label">{trigger.name}</span>
                        <span class="trigger-desc">{trigger.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Event Name - shown only when custom is selected */}
              <div class="form-group" id="custom-event-group" style="display: none;">
                <label class="form-label">Custom Event Name *</label>
                <input type="text" id="rule-custom-event" class="form-input" placeholder="e.g., social_share, app_download, survey_complete" />
                <span class="form-hint">This identifier will be used to trigger the rule via API</span>
              </div>

              <div class="form-row">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Points Type *</label>
                  <select id="rule-points-type" class="form-select" required onchange="updatePointsLabel()">
                    <option value="fixed">Fixed Points</option>
                    <option value="multiplier">Multiplier</option>
                    <option value="percentage">Per $ Spent</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" id="points-label">Points Value *</label>
                  <input type="number" id="rule-points-value" class="form-input" required min="1" value="1" step="0.1" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Restrict to Segment</label>
                <select id="rule-segment" class="form-select">
                  <option value="">All Customers</option>
                  {segments.map(seg => (
                    <option value={seg.id}>{escapeHtml(seg.name)}</option>
                  ))}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label">Start Date (Optional)</label>
                  <input type="date" id="rule-start-date" class="form-input" />
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label">End Date (Optional)</label>
                  <input type="date" id="rule-end-date" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="rule-tier-multiplier" />
                  <span>Apply tier multiplier (higher tiers earn more)</span>
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="rule-active" checked />
                  <span>Active</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Rule</button>
                <button type="button" onclick="closeRuleModal()" class="btn btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .rule-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 20px;
          transition: all 0.2s;
        }
        .rule-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .rule-card.inactive {
          opacity: 0.6;
        }

        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .rule-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-alt);
          padding: 6px 12px;
          border-radius: 20px;
          flex-wrap: wrap;
        }
        .trigger-icon {
          font-size: 16px;
        }
        .trigger-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .custom-event-badge {
          font-size: 10px;
          background: var(--primary);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
        }

        .rule-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .rule-description {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .points-display {
          background: linear-gradient(135deg, var(--primary-light), #FFF3E0);
          padding: 16px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 16px;
        }
        .points-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
        }

        .rule-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--bg-alt);
        }
        .meta-tag.segment {
          background: #E3F2FD;
          color: #1976D2;
        }
        .meta-tag.tier {
          background: #E8F5E9;
          color: #388E3C;
        }
        .meta-tag.date {
          background: #FFF8E1;
          color: #F57C00;
        }

        .rule-actions {
          display: flex;
          gap: 8px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
          margin-top: 12px;
        }

        /* Switch toggle */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--success);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }

        /* Modal Styles */
        .earning-modal {
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
        .earning-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .earning-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 650px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .earning-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .earning-modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
        .earning-modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
          padding: 0;
        }
        .earning-modal-close:hover {
          color: var(--text);
        }
        .earning-modal-body {
          padding: 24px;
          overflow-y: auto;
          max-height: calc(90vh - 80px);
        }

        /* Trigger Options in Modal */
        .trigger-options {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
        }
        .trigger-option {
          cursor: pointer;
        }
        .trigger-option input {
          display: none;
        }
        .trigger-content {
          border: 2px solid var(--border);
          border-radius: 10px;
          padding: 12px 8px;
          text-align: center;
          transition: all 0.2s;
          min-height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .trigger-option input:checked + .trigger-content {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .trigger-content .trigger-icon {
          display: block;
          font-size: 24px;
          margin-bottom: 6px;
        }
        .trigger-content .trigger-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.2;
        }
        .trigger-content .trigger-desc {
          display: block;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 4px;
          line-height: 1.2;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          margin-bottom: 16px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
          color: var(--text);
        }
        .form-hint {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const rulesData = ${JSON.stringify(rules)};

        function handleTriggerChange() {
          const selectedTrigger = document.querySelector('input[name="trigger_type"]:checked')?.value;
          const customGroup = document.getElementById('custom-event-group');
          const customInput = document.getElementById('rule-custom-event');

          if (selectedTrigger === 'custom') {
            customGroup.style.display = 'block';
            customInput.required = true;
          } else {
            customGroup.style.display = 'none';
            customInput.required = false;
            customInput.value = '';
          }
        }

        function openRuleModal() {
          document.getElementById('modal-title').textContent = 'Create Earning Rule';
          document.getElementById('rule-id').value = '';
          document.getElementById('rule-name').value = '';
          document.getElementById('rule-description').value = '';
          document.getElementById('rule-custom-event').value = '';
          document.querySelector('input[name="trigger_type"][value="order"]').checked = true;
          document.getElementById('rule-points-type').value = 'fixed';
          document.getElementById('rule-points-value').value = '1';
          document.getElementById('rule-segment').value = '';
          document.getElementById('rule-start-date').value = '';
          document.getElementById('rule-end-date').value = '';
          document.getElementById('rule-tier-multiplier').checked = false;
          document.getElementById('rule-active').checked = true;
          updatePointsLabel();
          handleTriggerChange();
          document.getElementById('rule-modal').style.display = 'flex';
        }

        function editRule(id) {
          const rule = rulesData.find(r => r.id === id);
          if (!rule) return;

          document.getElementById('modal-title').textContent = 'Edit Earning Rule';
          document.getElementById('rule-id').value = rule.id;
          document.getElementById('rule-name').value = rule.name;
          document.getElementById('rule-description').value = rule.description || '';

          // Parse conditions to get custom event name
          let customEventName = '';
          try {
            const conditions = JSON.parse(rule.conditions || '{}');
            customEventName = conditions.custom_event_name || '';
          } catch (e) {}
          document.getElementById('rule-custom-event').value = customEventName;

          const triggerRadio = document.querySelector('input[name="trigger_type"][value="' + rule.trigger_type + '"]');
          if (triggerRadio) triggerRadio.checked = true;

          document.getElementById('rule-points-type').value = rule.points_type;
          document.getElementById('rule-points-value').value = rule.points_value;
          document.getElementById('rule-segment').value = rule.segment_id || '';
          document.getElementById('rule-start-date').value = rule.start_date ? rule.start_date.split('T')[0] : '';
          document.getElementById('rule-end-date').value = rule.end_date ? rule.end_date.split('T')[0] : '';
          document.getElementById('rule-tier-multiplier').checked = rule.tier_multiplier_enabled === 1;
          document.getElementById('rule-active').checked = rule.is_active === 1;
          updatePointsLabel();
          handleTriggerChange();
          document.getElementById('rule-modal').style.display = 'flex';
        }

        function closeRuleModal() {
          document.getElementById('rule-modal').style.display = 'none';
        }

        function updatePointsLabel() {
          const type = document.getElementById('rule-points-type').value;
          const label = document.getElementById('points-label');
          if (type === 'fixed') label.textContent = 'Points Value *';
          else if (type === 'multiplier') label.textContent = 'Multiplier (e.g., 2 = 2x) *';
          else label.textContent = 'Points per $1 Spent *';
        }

        async function saveRule(e) {
          e.preventDefault();

          const id = document.getElementById('rule-id').value;
          const triggerType = document.querySelector('input[name="trigger_type"]:checked')?.value;
          const customEventName = document.getElementById('rule-custom-event').value;

          // Build conditions object
          const conditions = {};
          if (triggerType === 'custom' && customEventName) {
            conditions.custom_event_name = customEventName;
          }

          const data = {
            name: document.getElementById('rule-name').value,
            description: document.getElementById('rule-description').value,
            trigger_type: triggerType,
            points_type: document.getElementById('rule-points-type').value,
            points_value: parseFloat(document.getElementById('rule-points-value').value),
            conditions: JSON.stringify(conditions),
            segment_id: document.getElementById('rule-segment').value || null,
            start_date: document.getElementById('rule-start-date').value || null,
            end_date: document.getElementById('rule-end-date').value || null,
            tier_multiplier_enabled: document.getElementById('rule-tier-multiplier').checked ? 1 : 0,
            is_active: document.getElementById('rule-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/earning-rules/' + id : '/api/earning-rules';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save rule');
            }
          } catch (err) {
            alert('Error saving rule');
          }
        }

        async function toggleRule(id) {
          try {
            const res = await fetch('/api/earning-rules/' + id + '/toggle', { method: 'PUT' });
            if (res.ok) location.reload();
            else alert('Failed to toggle rule');
          } catch (err) {
            alert('Error toggling rule');
          }
        }

        async function duplicateRule(id) {
          try {
            const res = await fetch('/api/earning-rules/' + id + '/duplicate', { method: 'POST' });
            if (res.ok) location.reload();
            else alert('Failed to duplicate');
          } catch (err) {
            alert('Error duplicating');
          }
        }

        async function deleteRule(id) {
          if (!confirm('Delete this earning rule?')) return;
          try {
            const res = await fetch('/api/earning-rules/' + id, { method: 'DELETE' });
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
