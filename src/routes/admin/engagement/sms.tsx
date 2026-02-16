import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { SmsTemplate } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

// Available template variables
const TEMPLATE_VARIABLES = [
  { key: '{{customer_name}}', description: 'Customer\'s name' },
  { key: '{{customer_first_name}}', description: 'First name' },
  { key: '{{points_balance}}', description: 'Points balance' },
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{voucher_code}}', description: 'Voucher code' },
  { key: '{{discount_value}}', description: 'Discount amount' },
  { key: '{{restaurant_name}}', description: 'Restaurant name' },
];

interface SmsTemplatesPageProps {
  templates: SmsTemplate[];
}

export const AdminSmsTemplatesPage: FC<SmsTemplatesPageProps> = ({ templates }) => {
  return (
    <AdminLayout title="SMS Templates" currentPath="/admin/engagement/sms">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">SMS Templates</h1>
          <p class="text-muted" style="margin-top: 4px;">Create short, impactful SMS messages with personalization</p>
        </div>
        <button onclick="openSmsModal()" class="btn btn-primary">+ Create Template</button>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Templates</div>
          <div class="stat-value">{templates.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{templates.filter(t => t.is_active).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Characters</div>
          <div class="stat-value">{templates.length > 0 ? Math.round(templates.reduce((a, t) => a + t.character_count, 0) / templates.length) : 0}</div>
        </div>
      </div>

      {/* SMS Info Card */}
      <div class="card" style="padding: 16px; margin-bottom: 24px; background: #FFF8E1; border-color: #FFB74D;">
        <div class="flex items-center gap-3">
          <span style="font-size: 24px;">💡</span>
          <div>
            <strong>SMS Best Practices</strong>
            <p class="text-muted" style="margin: 4px 0 0; font-size: 13px;">
              Keep messages under 160 characters for a single SMS. Messages over 160 chars will be split into multiple parts.
              Use variables to personalize messages. Always include an opt-out option for marketing messages.
            </p>
          </div>
        </div>
      </div>

      {/* Templates List */}
      {templates.length > 0 ? (
        <div class="card">
          <div class="table-container" style="box-shadow: none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message Preview</th>
                  <th>Category</th>
                  <th>Characters</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr>
                    <td>
                      <div style="font-weight: 600;">{escapeHtml(template.name)}</div>
                    </td>
                    <td>
                      <div class="sms-preview">
                        <div class="sms-bubble">{escapeHtml(template.body.substring(0, 80))}{template.body.length > 80 ? '...' : ''}</div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" style="text-transform: capitalize;">{template.category}</span>
                    </td>
                    <td>
                      <span class={template.character_count > 160 ? 'text-error' : ''}>
                        {template.character_count}
                        {template.character_count > 160 && (
                          <span class="text-muted" style="font-size: 11px;"> ({Math.ceil(template.character_count / 160)} SMS)</span>
                        )}
                      </span>
                    </td>
                    <td>
                      {template.is_active ? (
                        <span class="badge badge-new">Active</span>
                      ) : (
                        <span class="badge" style="background: var(--text-muted); color: white;">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div class="table-actions">
                        <button onclick={`editSmsTemplate(${template.id})`} class="btn btn-ghost btn-sm">Edit</button>
                        <button onclick={`deleteSmsTemplate(${template.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <h3 class="empty-state-title">No SMS Templates</h3>
          <p class="empty-state-text">Create your first SMS template for customer communications.</p>
          <button onclick="openSmsModal()" class="btn btn-primary">+ Create Template</button>
        </div>
      )}

      {/* SMS Modal */}
      <div id="sms-modal" class="sms-modal">
        <div class="sms-modal-backdrop" onclick="closeSmsModal()"></div>
        <div class="sms-modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Create SMS Template</h2>
            <button onclick="closeSmsModal()" class="modal-close">&times;</button>
          </div>

          <form id="sms-form" onsubmit="saveSmsTemplate(event)">
            <input type="hidden" id="sms-id" value="" />

            <div class="form-group">
              <label class="form-label">Template Name *</label>
              <input type="text" id="sms-name" class="form-input" required placeholder="e.g., Order Confirmation" />
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="sms-category" class="form-select">
                <option value="transactional">Transactional</option>
                <option value="marketing">Marketing</option>
                <option value="loyalty">Loyalty</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea id="sms-body" class="form-textarea" rows={4} required placeholder="Hi {{customer_first_name}}, your order #{{order_number}} is ready for pickup!"></textarea>
              <div class="flex justify-between" style="margin-top: 8px;">
                <div class="form-hint">Use variables for personalization</div>
                <div id="char-counter" class="char-counter">0 / 160</div>
              </div>
            </div>

            {/* Variables Helper */}
            <div class="variables-section">
              <label class="form-label" style="margin-bottom: 8px;">Insert Variable:</label>
              <div class="variable-chips">
                {TEMPLATE_VARIABLES.map(v => (
                  <button type="button" class="variable-chip" onclick={`insertSmsVariable('${v.key}')`} title={v.description}>
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Preview */}
            <div class="phone-preview-container">
              <div class="phone-preview">
                <div class="phone-header">Messages</div>
                <div class="phone-body">
                  <div id="phone-message" class="phone-message"></div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="sms-active" checked />
                <span>Active</span>
              </label>
            </div>

            <div class="flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary">Save Template</button>
              <button type="button" onclick="closeSmsModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .sms-modal {
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
        .sms-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .sms-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .sms-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .sms-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .sms-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .sms-modal-content form {
          padding: 24px;
        }
        .sms-modal-content .form-group {
          margin-bottom: 16px;
        }
        .sms-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .sms-modal-content .form-input,
        .sms-modal-content .form-select,
        .sms-modal-content .form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }

        .sms-preview {
          max-width: 250px;
        }
        .sms-bubble {
          background: #E3F2FD;
          padding: 8px 12px;
          border-radius: 12px 12px 12px 4px;
          font-size: 12px;
          line-height: 1.4;
        }

        .char-counter {
          font-size: 12px;
          font-weight: 600;
        }
        .char-counter.warning {
          color: #FF9800;
        }
        .char-counter.error {
          color: var(--error);
        }

        .variables-section {
          background: var(--bg-alt);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .variable-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .variable-chip {
          background: white;
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 11px;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s;
        }
        .variable-chip:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .phone-preview-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        .phone-preview {
          width: 240px;
          height: 300px;
          background: #1a1a1a;
          border-radius: 24px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .phone-header {
          background: #2a2a2a;
          color: white;
          text-align: center;
          padding: 8px;
          border-radius: 16px 16px 0 0;
          font-size: 12px;
          font-weight: 600;
        }
        .phone-body {
          background: white;
          height: calc(100% - 36px);
          border-radius: 0 0 16px 16px;
          padding: 12px;
          overflow-y: auto;
        }
        .phone-message {
          background: #34C759;
          color: white;
          padding: 10px 12px;
          border-radius: 16px 16px 4px 16px;
          font-size: 13px;
          line-height: 1.4;
          margin-left: 20%;
          word-wrap: break-word;
        }
        .phone-message:empty::before {
          content: 'Your message will appear here...';
          opacity: 0.7;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const templatesData = ${JSON.stringify(templates)};

        function openSmsModal() {
          document.getElementById('modal-title').textContent = 'Create SMS Template';
          document.getElementById('sms-id').value = '';
          document.getElementById('sms-name').value = '';
          document.getElementById('sms-body').value = '';
          document.getElementById('sms-category').value = 'transactional';
          document.getElementById('sms-active').checked = true;
          updateCharCounter();
          updatePhonePreview();
          document.getElementById('sms-modal').style.display = 'flex';
        }

        function editSmsTemplate(id) {
          const template = templatesData.find(t => t.id === id);
          if (!template) return;

          document.getElementById('modal-title').textContent = 'Edit SMS Template';
          document.getElementById('sms-id').value = template.id;
          document.getElementById('sms-name').value = template.name;
          document.getElementById('sms-body').value = template.body;
          document.getElementById('sms-category').value = template.category;
          document.getElementById('sms-active').checked = template.is_active === 1;
          updateCharCounter();
          updatePhonePreview();
          document.getElementById('sms-modal').style.display = 'flex';
        }

        function closeSmsModal() {
          document.getElementById('sms-modal').style.display = 'none';
        }

        function insertSmsVariable(variable) {
          const textarea = document.getElementById('sms-body');
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          textarea.value = text.substring(0, start) + variable + text.substring(end);
          textarea.focus();
          textarea.setSelectionRange(start + variable.length, start + variable.length);
          updateCharCounter();
          updatePhonePreview();
        }

        function updateCharCounter() {
          const body = document.getElementById('sms-body').value;
          const count = body.length;
          const counter = document.getElementById('char-counter');

          counter.textContent = count + ' / 160';
          counter.classList.remove('warning', 'error');

          if (count > 160) {
            const parts = Math.ceil(count / 160);
            counter.textContent = count + ' (' + parts + ' SMS)';
            counter.classList.add('error');
          } else if (count > 140) {
            counter.classList.add('warning');
          }
        }

        function updatePhonePreview() {
          const body = document.getElementById('sms-body').value;
          let preview = body
            .replace(/{{customer_name}}/g, 'John Smith')
            .replace(/{{customer_first_name}}/g, 'John')
            .replace(/{{points_balance}}/g, '1,250')
            .replace(/{{order_number}}/g, 'ORD-12345')
            .replace(/{{voucher_code}}/g, 'SAVE20')
            .replace(/{{discount_value}}/g, '20%')
            .replace(/{{restaurant_name}}/g, 'Smart Restaurant');

          document.getElementById('phone-message').textContent = preview;
        }

        // Add event listeners
        document.getElementById('sms-body').addEventListener('input', function() {
          updateCharCounter();
          updatePhonePreview();
        });

        async function saveSmsTemplate(e) {
          e.preventDefault();

          const id = document.getElementById('sms-id').value;
          const data = {
            name: document.getElementById('sms-name').value,
            body: document.getElementById('sms-body').value,
            category: document.getElementById('sms-category').value,
            variables: JSON.stringify(document.getElementById('sms-body').value.match(/{{[^}]+}}/g) || []),
            is_active: document.getElementById('sms-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/sms-templates/' + id : '/api/sms-templates';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save template');
            }
          } catch (err) {
            alert('Error saving template');
          }
        }

        async function deleteSmsTemplate(id) {
          if (!confirm('Delete this SMS template?')) return;
          try {
            const res = await fetch('/api/sms-templates/' + id, { method: 'DELETE' });
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
