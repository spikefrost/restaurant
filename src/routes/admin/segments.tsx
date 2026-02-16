import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { CustomerSegment } from '../../types';
import { escapeHtml, formatDate } from '../../utils/helpers';

// Segment rule field options
const SEGMENT_FIELDS = [
  { id: 'total_spent', name: 'Total Spent', type: 'number' },
  { id: 'total_orders', name: 'Total Orders', type: 'number' },
  { id: 'tier', name: 'Loyalty Tier', type: 'select' },
  { id: 'points_balance', name: 'Points Balance', type: 'number' },
  { id: 'last_order_days', name: 'Days Since Last Order', type: 'number' },
  { id: 'signup_days', name: 'Days Since Signup', type: 'number' },
  { id: 'avg_order_value', name: 'Average Order Value', type: 'number' },
];

const OPERATORS = [
  { id: 'equals', name: 'equals' },
  { id: 'not_equals', name: 'does not equal' },
  { id: 'greater_than', name: 'is greater than' },
  { id: 'less_than', name: 'is less than' },
  { id: 'between', name: 'is between' },
];

interface SegmentsPageProps {
  segments: CustomerSegment[];
}

export const AdminSegmentsPage: FC<SegmentsPageProps> = ({ segments }) => {
  const totalCustomers = segments.reduce((sum, s) => sum + (s.customer_count || 0), 0);

  return (
    <AdminLayout title="Customer Segments" currentPath="/admin/segments">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Customer Segments</h1>
          <p class="text-muted" style="margin-top: 4px;">Create and manage customer segments for targeted campaigns</p>
        </div>
        <button onclick="openSegmentModal()" class="btn btn-primary">+ Create Segment</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Segments</div>
          <div class="stat-value">{segments.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Segments</div>
          <div class="stat-value" style="color: var(--success);">{segments.filter(s => s.is_active).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Customers Segmented</div>
          <div class="stat-value">{totalCustomers.toLocaleString()}</div>
        </div>
      </div>

      {/* Segments Grid */}
      {segments.length > 0 ? (
        <div class="segments-grid">
          {segments.map(segment => {
            // Handle both old format (array) and new format (object with logic)
            const parsedRules = segment.rules ? JSON.parse(segment.rules) : [];
            const rulesLogic = parsedRules.logic || 'and';
            const rules = parsedRules.rules || (Array.isArray(parsedRules) ? parsedRules : []);
            return (
              <div class={`segment-card ${!segment.is_active ? 'inactive' : ''}`}>
                <div class="segment-header">
                  <div class="segment-icon">
                    {segment.is_dynamic ? '🔄' : '📋'}
                  </div>
                  <div class="segment-info">
                    <div class="segment-name">{escapeHtml(segment.name)}</div>
                    <div class="segment-type">{segment.is_dynamic ? 'Dynamic' : 'Static'}</div>
                  </div>
                  <div class="segment-count">
                    <span class="count-number">{(segment.customer_count || 0).toLocaleString()}</span>
                    <span class="count-label">customers</span>
                  </div>
                </div>

                {segment.description && (
                  <div class="segment-description">{escapeHtml(segment.description)}</div>
                )}

                {rules.length > 0 && (
                  <div class="segment-rules">
                    <div class="rules-label">Rules ({rulesLogic === 'or' ? 'ANY' : 'ALL'}):</div>
                    {rules.slice(0, 3).map((rule: any, idx: number) => (
                      <span>
                        {idx > 0 && <span class="rule-logic-small">{rulesLogic.toUpperCase()}</span>}
                        <div class="rule-tag">
                          <span class="rule-field">{rule.field}</span>
                          <span class="rule-op">{rule.operator.replace('_', ' ')}</span>
                          <span class="rule-value">{rule.value}</span>
                        </div>
                      </span>
                    ))}
                    {rules.length > 3 && <span class="rules-more">+{rules.length - 3} more</span>}
                  </div>
                )}

                <div class="segment-footer">
                  <span class={`status-badge ${segment.is_active ? 'active' : ''}`}>
                    {segment.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div class="segment-actions">
                    <button onclick={`editSegment(${segment.id})`} class="btn btn-ghost btn-sm">Edit</button>
                    {segment.is_dynamic && (
                      <button onclick={`refreshSegment(${segment.id})`} class="btn btn-ghost btn-sm">Refresh</button>
                    )}
                    <button onclick={`deleteSegment(${segment.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <h3 class="empty-state-title">No Segments</h3>
          <p class="empty-state-text">Create customer segments to target specific groups with promotions and communications.</p>
          <button onclick="openSegmentModal()" class="btn btn-primary">+ Create Segment</button>
        </div>
      )}

      {/* Segment Modal */}
      <div id="segment-modal" class="segment-modal">
        <div class="segment-modal-backdrop" onclick="closeSegmentModal()"></div>
        <div class="segment-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Create Segment</h2>
            <button onclick="closeSegmentModal()" class="modal-close">&times;</button>
          </div>

          <form id="segment-form" onsubmit="saveSegment(event)">
            <input type="hidden" id="segment-id" value="" />

            <div class="form-group">
              <label class="form-label">Segment Name *</label>
              <input type="text" id="segment-name" class="form-input" required placeholder="e.g., High Value Customers" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="segment-description" class="form-textarea" rows={2} placeholder="Describe this segment"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Segment Type</label>
              <div class="segment-type-options">
                <label class="type-option">
                  <input type="radio" name="segment_type" value="dynamic" checked onchange="updateSegmentType()" />
                  <div class="type-content">
                    <span class="type-icon">🔄</span>
                    <span class="type-name">Dynamic</span>
                    <span class="type-desc">Auto-updates based on rules</span>
                  </div>
                </label>
                <label class="type-option">
                  <input type="radio" name="segment_type" value="static" onchange="updateSegmentType()" />
                  <div class="type-content">
                    <span class="type-icon">📋</span>
                    <span class="type-name">Static</span>
                    <span class="type-desc">Manually selected customers</span>
                  </div>
                </label>
              </div>
            </div>

            <div id="rules-section">
              <label class="form-label">Segment Rules</label>
              <div class="logic-selector" style="margin-bottom: 12px;">
                <span class="form-hint">Customers matching</span>
                <select id="rules-logic" class="form-select-inline" onchange="updateRulesLogicHint()">
                  <option value="and">ALL</option>
                  <option value="or">ANY</option>
                </select>
                <span class="form-hint">of the rules will be included</span>
              </div>
              <div id="rules-container"></div>
              <button type="button" onclick="addRule()" class="btn btn-ghost btn-sm" style="margin-top: 8px;">+ Add Rule</button>
            </div>

            <div class="form-group" style="margin-top: 20px;">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="segment-active" checked />
                <span>Active</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Segment</button>
              <button type="button" onclick="closeSegmentModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .segment-modal {
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
        .segment-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .segment-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .segment-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .segment-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .segment-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .segment-modal-content form {
          padding: 24px;
        }
        .segment-modal-content .form-group {
          margin-bottom: 16px;
        }
        .segment-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .segment-modal-content .form-input,
        .segment-modal-content .form-select,
        .segment-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }

        .segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .segment-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .segment-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .segment-card.inactive {
          opacity: 0.6;
        }
        .segment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .segment-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--bg-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .segment-info {
          flex: 1;
        }
        .segment-name {
          font-weight: 600;
          font-size: 15px;
        }
        .segment-type {
          font-size: 12px;
          color: var(--text-muted);
        }
        .segment-count {
          text-align: right;
        }
        .count-number {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }
        .count-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .segment-description {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        .segment-rules {
          padding: 12px 16px;
          background: var(--bg-alt);
        }
        .rules-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .rule-tag {
          display: inline-flex;
          gap: 4px;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          margin-right: 6px;
          margin-bottom: 6px;
          border: 1px solid var(--border);
        }
        .rule-field {
          font-weight: 600;
        }
        .rule-op {
          color: var(--text-muted);
        }
        .rule-value {
          color: var(--primary);
          font-weight: 600;
        }
        .rules-more {
          font-size: 11px;
          color: var(--text-muted);
        }
        .rule-logic-small {
          font-size: 9px;
          font-weight: 700;
          color: var(--primary);
          margin: 0 4px;
        }
        .segment-footer {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          background: var(--text-muted);
          color: white;
        }
        .status-badge.active {
          background: var(--success);
        }
        .segment-actions {
          display: flex;
          gap: 8px;
        }

        /* Modal Styles */
        .segment-type-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
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
          padding: 16px;
          text-align: center;
          transition: all 0.2s;
        }
        .type-option input:checked + .type-content {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .type-icon {
          font-size: 28px;
          display: block;
          margin-bottom: 8px;
        }
        .type-name {
          font-weight: 600;
          display: block;
        }
        .type-desc {
          font-size: 12px;
          color: var(--text-muted);
        }

        .rule-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }
        .rule-row select, .rule-row input {
          font-size: 13px;
          padding: 8px;
        }
        .rule-row .form-select {
          flex: 1;
        }
        .rule-row .form-input {
          flex: 1;
        }

        /* Logic Selector */
        .logic-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .form-select-inline {
          padding: 4px 24px 4px 8px;
          border: 1px solid var(--primary);
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          background: var(--primary-light);
          cursor: pointer;
        }
        .form-select-inline:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
        }

        /* Rule Logic Indicator */
        .rule-logic-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
          margin: 4px 0;
        }
        .logic-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          background: var(--primary-light);
          padding: 2px 10px;
          border-radius: 10px;
          text-transform: uppercase;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const segmentsData = ${JSON.stringify(segments)};
        let currentRules = [];
        let currentRulesLogic = 'and';

        function openSegmentModal() {
          document.getElementById('modal-title').textContent = 'Create Segment';
          document.getElementById('segment-id').value = '';
          document.getElementById('segment-name').value = '';
          document.getElementById('segment-description').value = '';
          document.querySelector('input[name="segment_type"][value="dynamic"]').checked = true;
          document.getElementById('segment-active').checked = true;
          document.getElementById('rules-logic').value = 'and';
          currentRulesLogic = 'and';
          currentRules = [];
          addRule();
          updateSegmentType();
          document.getElementById('segment-modal').style.display = 'flex';
        }

        function editSegment(id) {
          const segment = segmentsData.find(s => s.id === id);
          if (!segment) return;

          document.getElementById('modal-title').textContent = 'Edit Segment';
          document.getElementById('segment-id').value = segment.id;
          document.getElementById('segment-name').value = segment.name;
          document.getElementById('segment-description').value = segment.description || '';
          document.querySelector('input[name="segment_type"][value="' + (segment.is_dynamic ? 'dynamic' : 'static') + '"]').checked = true;
          document.getElementById('segment-active').checked = segment.is_active === 1;

          // Parse rules - check if it's the new format with logic
          let parsedRules = segment.rules ? JSON.parse(segment.rules) : [];
          if (parsedRules.logic) {
            currentRulesLogic = parsedRules.logic;
            currentRules = parsedRules.rules || [];
          } else {
            // Old format - just an array of rules
            currentRulesLogic = 'and';
            currentRules = Array.isArray(parsedRules) ? parsedRules : [];
          }
          document.getElementById('rules-logic').value = currentRulesLogic;

          if (currentRules.length === 0) addRule();
          else renderRules();
          updateSegmentType();

          document.getElementById('segment-modal').style.display = 'flex';
        }

        function updateRulesLogicHint() {
          currentRulesLogic = document.getElementById('rules-logic').value;
          renderRules();
        }

        function closeSegmentModal() {
          document.getElementById('segment-modal').style.display = 'none';
        }

        function updateSegmentType() {
          const isDynamic = document.querySelector('input[name="segment_type"]:checked').value === 'dynamic';
          document.getElementById('rules-section').style.display = isDynamic ? 'block' : 'none';
        }

        function addRule() {
          currentRules.push({ field: 'total_spent', operator: 'greater_than', value: '' });
          renderRules();
        }

        function removeRule(index) {
          if (currentRules.length > 1) {
            currentRules.splice(index, 1);
            renderRules();
          }
        }

        function renderRules() {
          const container = document.getElementById('rules-container');
          const logicLabel = currentRulesLogic === 'and' ? 'AND' : 'OR';
          container.innerHTML = currentRules.map((rule, i) => \`
            \${i > 0 ? '<div class="rule-logic-indicator"><span class="logic-badge">' + logicLabel + '</span></div>' : ''}
            <div class="rule-row">
              <select class="form-select" onchange="currentRules[\${i}].field = this.value">
                <option value="total_spent" \${rule.field === 'total_spent' ? 'selected' : ''}>Total Spent</option>
                <option value="total_orders" \${rule.field === 'total_orders' ? 'selected' : ''}>Total Orders</option>
                <option value="tier" \${rule.field === 'tier' ? 'selected' : ''}>Loyalty Tier</option>
                <option value="points_balance" \${rule.field === 'points_balance' ? 'selected' : ''}>Points Balance</option>
                <option value="last_order_days" \${rule.field === 'last_order_days' ? 'selected' : ''}>Days Since Last Order</option>
                <option value="signup_days" \${rule.field === 'signup_days' ? 'selected' : ''}>Days Since Signup</option>
                <option value="avg_order_value" \${rule.field === 'avg_order_value' ? 'selected' : ''}>Avg Order Value</option>
              </select>
              <select class="form-select" onchange="currentRules[\${i}].operator = this.value">
                <option value="equals" \${rule.operator === 'equals' ? 'selected' : ''}>equals</option>
                <option value="not_equals" \${rule.operator === 'not_equals' ? 'selected' : ''}>does not equal</option>
                <option value="greater_than" \${rule.operator === 'greater_than' ? 'selected' : ''}>is greater than</option>
                <option value="less_than" \${rule.operator === 'less_than' ? 'selected' : ''}>is less than</option>
              </select>
              <input type="text" class="form-input" value="\${rule.value}" placeholder="Value" onchange="currentRules[\${i}].value = this.value" />
              <button type="button" onclick="removeRule(\${i})" class="btn btn-ghost btn-sm text-error">×</button>
            </div>
          \`).join('');
        }

        async function saveSegment(e) {
          e.preventDefault();

          const id = document.getElementById('segment-id').value;
          const isDynamic = document.querySelector('input[name="segment_type"]:checked').value === 'dynamic';

          // Build rules object with logic operator
          const filteredRules = currentRules.filter(r => r.value);
          const rulesWithLogic = {
            logic: currentRulesLogic,
            rules: filteredRules
          };

          const data = {
            name: document.getElementById('segment-name').value,
            description: document.getElementById('segment-description').value,
            is_dynamic: isDynamic ? 1 : 0,
            rules: isDynamic ? JSON.stringify(rulesWithLogic) : '[]',
            is_active: document.getElementById('segment-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/segments/' + id : '/api/segments';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save segment');
            }
          } catch (err) {
            alert('Error saving segment');
          }
        }

        async function refreshSegment(id) {
          try {
            const res = await fetch('/api/segments/' + id + '/refresh', { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              alert('Segment refreshed: ' + data.count + ' customers matched');
              location.reload();
            } else {
              alert('Failed to refresh segment');
            }
          } catch (err) {
            alert('Error refreshing segment');
          }
        }

        async function deleteSegment(id) {
          if (!confirm('Delete this segment?')) return;
          try {
            const res = await fetch('/api/segments/' + id, { method: 'DELETE' });
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
