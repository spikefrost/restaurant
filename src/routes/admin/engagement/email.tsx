import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import type { EmailTemplate } from '../../../types';
import { escapeHtml, formatDate } from '../../../utils/helpers';

// Available template variables
const TEMPLATE_VARIABLES = [
  { key: '{{customer_name}}', description: 'Customer\'s full name' },
  { key: '{{customer_first_name}}', description: 'Customer\'s first name' },
  { key: '{{customer_email}}', description: 'Customer\'s email' },
  { key: '{{customer_phone}}', description: 'Customer\'s phone' },
  { key: '{{customer_tier}}', description: 'Loyalty tier name' },
  { key: '{{points_balance}}', description: 'Current points balance' },
  { key: '{{order_number}}', description: 'Order number' },
  { key: '{{order_total}}', description: 'Order total amount' },
  { key: '{{voucher_code}}', description: 'Generated voucher code' },
  { key: '{{discount_value}}', description: 'Discount amount' },
  { key: '{{restaurant_name}}', description: 'Restaurant name' },
  { key: '{{current_date}}', description: 'Today\'s date' },
];

interface EmailTemplatesPageProps {
  templates: EmailTemplate[];
}

export const AdminEmailTemplatesPage: FC<EmailTemplatesPageProps> = ({ templates }) => {
  const categories = ['transactional', 'marketing', 'loyalty', 'other'];
  const groupedTemplates = categories.map(cat => ({
    category: cat,
    templates: templates.filter(t => t.category === cat)
  }));

  return (
    <AdminLayout title="Email Templates" currentPath="/admin/engagement/email">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Email Templates</h1>
          <p class="text-muted" style="margin-top: 4px;">Create and manage email templates with the visual designer</p>
        </div>
        <a href="/admin/engagement/email/new" class="btn btn-primary">+ Create Template</a>
      </div>

      {/* Stats */}
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
        <div class="stat-card">
          <div class="stat-label">Total Templates</div>
          <div class="stat-value">{templates.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active</div>
          <div class="stat-value" style="color: var(--success);">{templates.filter(t => t.is_active).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Transactional</div>
          <div class="stat-value">{templates.filter(t => t.category === 'transactional').length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Marketing</div>
          <div class="stat-value">{templates.filter(t => t.category === 'marketing').length}</div>
        </div>
      </div>

      {/* Templates by Category */}
      {groupedTemplates.map(group => group.templates.length > 0 && (
        <div class="card" style="margin-bottom: 24px;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-transform: capitalize;">{group.category} Templates</h3>
            <span class="badge">{group.templates.length}</span>
          </div>
          <div class="template-grid">
            {group.templates.map(template => (
              <div class={`template-card ${!template.is_active ? 'inactive' : ''}`}>
                <div class="template-preview">
                  <div class="template-preview-header">
                    <span class="template-preview-subject">{escapeHtml(template.subject)}</span>
                  </div>
                  <div class="template-preview-body" dangerouslySetInnerHTML={{ __html: template.body_html?.substring(0, 200) || '<p class="text-muted">No content</p>' }} />
                </div>
                <div class="template-info">
                  <div class="template-name">{escapeHtml(template.name)}</div>
                  <div class="template-meta">
                    <span class={`badge ${template.is_active ? 'badge-new' : ''}`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span class="text-muted" style="font-size: 12px;">
                      Updated {formatDate(template.updated_at || template.created_at)}
                    </span>
                  </div>
                </div>
                <div class="template-actions">
                  <a href={`/admin/engagement/email/${template.id}`} class="btn btn-ghost btn-sm">Edit</a>
                  <button onclick={`duplicateTemplate(${template.id})`} class="btn btn-ghost btn-sm">Duplicate</button>
                  <button onclick={`previewTemplate(${template.id})`} class="btn btn-ghost btn-sm">Preview</button>
                  <button onclick={`deleteTemplate(${template.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div class="empty-state">
          <div class="empty-state-icon">📧</div>
          <h3 class="empty-state-title">No Email Templates</h3>
          <p class="empty-state-text">Create your first email template for customer communications.</p>
          <a href="/admin/engagement/email/new" class="btn btn-primary">+ Create Template</a>
        </div>
      )}

      {/* Preview Modal */}
      <div id="preview-modal" class="email-preview-modal">
        <div class="email-preview-modal-backdrop" onclick="closePreview()"></div>
        <div class="email-preview-modal-content">
          <div class="modal-header">
            <h2>Email Preview</h2>
            <button onclick="closePreview()" class="modal-close">&times;</button>
          </div>
          <div id="preview-content" style="background: #f5f5f5; padding: 20px; border-radius: 8px;"></div>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .email-preview-modal {
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
        .email-preview-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .email-preview-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 24px;
        }
        .email-preview-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .email-preview-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .email-preview-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          padding: 16px;
        }
        .template-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .template-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .template-card.inactive {
          opacity: 0.6;
        }
        .template-preview {
          height: 150px;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        .template-preview::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(transparent, white);
        }
        .template-preview-header {
          background: var(--bg-alt);
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }
        .template-preview-subject {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }
        .template-preview-body {
          padding: 12px;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-muted);
        }
        .template-preview-body * {
          font-size: inherit !important;
          margin: 0 0 6px 0 !important;
        }
        .template-info {
          padding: 12px;
        }
        .template-name {
          font-weight: 600;
          margin-bottom: 6px;
        }
        .template-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .template-actions {
          padding: 12px;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const templatesData = ${JSON.stringify(templates)};

        async function duplicateTemplate(id) {
          try {
            const res = await fetch('/api/email-templates/' + id + '/duplicate', { method: 'POST' });
            if (res.ok) location.reload();
            else alert('Failed to duplicate');
          } catch (err) {
            alert('Error duplicating');
          }
        }

        function previewTemplate(id) {
          const template = templatesData.find(t => t.id === id);
          if (!template) return;

          // Replace variables with sample data
          let html = template.body_html || '';
          html = html.replace(/{{customer_name}}/g, 'John Smith');
          html = html.replace(/{{customer_first_name}}/g, 'John');
          html = html.replace(/{{customer_tier}}/g, 'Gold');
          html = html.replace(/{{points_balance}}/g, '1,250');
          html = html.replace(/{{order_number}}/g, 'ORD-12345');
          html = html.replace(/{{order_total}}/g, '$45.00');
          html = html.replace(/{{voucher_code}}/g, 'BDAY20OFF');
          html = html.replace(/{{discount_value}}/g, '20%');
          html = html.replace(/{{restaurant_name}}/g, 'Smart Restaurant');
          html = html.replace(/{{current_date}}/g, new Date().toLocaleDateString());

          document.getElementById('preview-content').innerHTML = html;
          document.getElementById('preview-modal').style.display = 'flex';
        }

        function closePreview() {
          document.getElementById('preview-modal').style.display = 'none';
        }

        async function deleteTemplate(id) {
          if (!confirm('Delete this email template?')) return;
          try {
            const res = await fetch('/api/email-templates/' + id, { method: 'DELETE' });
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

interface EmailEditorPageProps {
  template?: EmailTemplate;
}

export const AdminEmailEditorPage: FC<EmailEditorPageProps> = ({ template }) => {
  const isEdit = !!template;
  const initialBlocks = template?.body_json ? JSON.parse(template.body_json) : [];

  return (
    <AdminLayout title={isEdit ? 'Edit Email Template' : 'New Email Template'} currentPath="/admin/engagement/email">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">{isEdit ? 'Edit Email Template' : 'Create Email Template'}</h1>
          <p class="text-muted" style="margin-top: 4px;">Design your email using the visual builder</p>
        </div>
        <div class="flex gap-2">
          <button onclick="previewEmail()" class="btn btn-ghost">Preview</button>
          <a href="/admin/engagement/email" class="btn btn-ghost">Cancel</a>
          <button onclick="saveTemplate()" class="btn btn-primary">Save Template</button>
        </div>
      </div>

      <input type="hidden" id="template-id" value={template?.id || ''} />

      <div class="email-builder">
        {/* Left: Settings & Blocks */}
        <div class="builder-sidebar">
          {/* Template Settings */}
          <div class="builder-panel">
            <div class="panel-header">Settings</div>
            <div class="panel-content">
              <div class="form-group">
                <label class="form-label">Template Name *</label>
                <input type="text" id="template-name" class="form-input" value={template?.name || ''} required placeholder="e.g., Welcome Email" />
              </div>
              <div class="form-group">
                <label class="form-label">Subject Line *</label>
                <input type="text" id="template-subject" class="form-input" value={template?.subject || ''} required placeholder="e.g., Welcome to {{restaurant_name}}!" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select id="template-category" class="form-select">
                  <option value="transactional" selected={template?.category === 'transactional'}>Transactional</option>
                  <option value="marketing" selected={template?.category === 'marketing'}>Marketing</option>
                  <option value="loyalty" selected={template?.category === 'loyalty'}>Loyalty</option>
                  <option value="other" selected={template?.category === 'other'}>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="flex items-center gap-2">
                  <input type="checkbox" id="template-active" checked={template?.is_active !== 0} />
                  <span>Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Add Blocks */}
          <div class="builder-panel">
            <div class="panel-header">Add Blocks</div>
            <div class="panel-content">
              <div class="block-buttons">
                <button type="button" class="add-block-btn" onclick="addBlock('header')">
                  <span class="block-icon">📝</span>
                  <span>Header</span>
                </button>
                <button type="button" class="add-block-btn" onclick="addBlock('text')">
                  <span class="block-icon">📄</span>
                  <span>Text</span>
                </button>
                <button type="button" class="add-block-btn" onclick="addBlock('image')">
                  <span class="block-icon">🖼️</span>
                  <span>Image</span>
                </button>
                <button type="button" class="add-block-btn" onclick="addBlock('button')">
                  <span class="block-icon">🔘</span>
                  <span>Button</span>
                </button>
                <button type="button" class="add-block-btn" onclick="addBlock('divider')">
                  <span class="block-icon">➖</span>
                  <span>Divider</span>
                </button>
                <button type="button" class="add-block-btn" onclick="addBlock('spacer')">
                  <span class="block-icon">↕️</span>
                  <span>Spacer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Variables */}
          <div class="builder-panel">
            <div class="panel-header">Variables</div>
            <div class="panel-content">
              <div class="variables-list">
                {TEMPLATE_VARIABLES.map(v => (
                  <div class="variable-item" onclick={`insertVariable('${v.key}')`}>
                    <code class="variable-code">{v.key}</code>
                    <span class="variable-desc">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div class="builder-canvas">
          <div class="canvas-wrapper">
            <div class="email-preview-frame">
              <div id="email-canvas" class="email-canvas"></div>
            </div>
          </div>
        </div>

        {/* Right: Block Editor */}
        <div class="builder-editor">
          <div class="builder-panel">
            <div class="panel-header">Block Settings</div>
            <div class="panel-content" id="block-editor">
              <p class="text-muted" style="text-align: center; padding: 20px;">Select a block to edit its settings</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .email-builder {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 20px;
          height: calc(100vh - 160px);
        }
        .builder-sidebar, .builder-editor {
          overflow-y: auto;
        }
        .builder-panel {
          background: white;
          border-radius: 10px;
          border: 1px solid var(--border);
          margin-bottom: 16px;
          overflow: hidden;
        }
        .panel-header {
          padding: 12px 16px;
          font-weight: 600;
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
        }
        .panel-content {
          padding: 16px;
        }

        .block-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .add-block-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-block-btn:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .block-icon {
          font-size: 20px;
        }
        .add-block-btn span:last-child {
          font-size: 11px;
          font-weight: 500;
        }

        .variables-list {
          max-height: 200px;
          overflow-y: auto;
        }
        .variable-item {
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 4px;
        }
        .variable-item:hover {
          background: var(--bg-alt);
        }
        .variable-code {
          display: block;
          font-size: 11px;
          background: #E3F2FD;
          padding: 2px 6px;
          border-radius: 4px;
          margin-bottom: 2px;
        }
        .variable-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .builder-canvas {
          overflow-y: auto;
        }
        .canvas-wrapper {
          min-height: 100%;
          display: flex;
          justify-content: center;
          padding: 20px;
          background: var(--bg-alt);
          border-radius: 10px;
        }
        .email-preview-frame {
          width: 600px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .email-canvas {
          min-height: 400px;
          padding: 20px;
        }
        .email-canvas:empty::before {
          content: 'Drag blocks here to build your email';
          display: block;
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          border: 2px dashed var(--border);
          border-radius: 8px;
        }

        /* Block Styles */
        .email-block {
          position: relative;
          margin-bottom: 10px;
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .email-block:hover {
          border-color: #64B5F6;
        }
        .email-block.selected {
          border-color: var(--primary);
        }
        .email-block .block-controls {
          position: absolute;
          top: -10px;
          right: -10px;
          display: none;
          gap: 4px;
        }
        .email-block:hover .block-controls {
          display: flex;
        }
        .block-control-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: none;
          background: var(--primary);
          color: white;
          cursor: pointer;
          font-size: 12px;
        }
        .block-control-btn.delete {
          background: var(--error);
        }

        /* Specific Block Types */
        .block-header h1, .block-header h2 {
          margin: 0;
          padding: 10px;
        }
        .block-text {
          padding: 10px;
          line-height: 1.6;
        }
        .block-image {
          text-align: center;
          padding: 10px;
        }
        .block-image img {
          max-width: 100%;
          height: auto;
        }
        .block-button {
          text-align: center;
          padding: 10px;
        }
        .block-button a {
          display: inline-block;
          padding: 12px 24px;
          background: var(--primary);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
        .block-divider {
          padding: 10px;
        }
        .block-divider hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0;
        }
        .block-spacer {
          height: 30px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        let blocks = ${JSON.stringify(initialBlocks)};
        let selectedBlockIndex = -1;

        const DEFAULT_BLOCKS = {
          header: { type: 'header', content: { text: 'Your Heading', level: 'h1' }, styles: { textAlign: 'center', color: '#333333' } },
          text: { type: 'text', content: { html: '<p>Your text content goes here. Use variables like {{customer_name}} to personalize.</p>' }, styles: {} },
          image: { type: 'image', content: { src: 'https://via.placeholder.com/560x200', alt: 'Image' }, styles: {} },
          button: { type: 'button', content: { text: 'Click Here', url: '#' }, styles: { backgroundColor: '#E85D04', color: '#ffffff' } },
          divider: { type: 'divider', content: {}, styles: { borderColor: '#e0e0e0' } },
          spacer: { type: 'spacer', content: { height: 30 }, styles: {} }
        };

        function generateId() {
          return 'block_' + Math.random().toString(36).substr(2, 9);
        }

        function addBlock(type) {
          const block = { ...DEFAULT_BLOCKS[type], id: generateId() };
          blocks.push(block);
          renderCanvas();
          selectBlock(blocks.length - 1);
        }

        function removeBlock(index) {
          blocks.splice(index, 1);
          selectedBlockIndex = -1;
          renderCanvas();
          renderEditor();
        }

        function moveBlock(index, direction) {
          const newIndex = index + direction;
          if (newIndex < 0 || newIndex >= blocks.length) return;
          const temp = blocks[index];
          blocks[index] = blocks[newIndex];
          blocks[newIndex] = temp;
          selectedBlockIndex = newIndex;
          renderCanvas();
        }

        function selectBlock(index) {
          selectedBlockIndex = index;
          renderCanvas();
          renderEditor();
        }

        function renderCanvas() {
          const canvas = document.getElementById('email-canvas');
          canvas.innerHTML = blocks.map((block, i) => {
            const selected = i === selectedBlockIndex ? 'selected' : '';
            let html = '';

            switch (block.type) {
              case 'header':
                const Tag = block.content.level || 'h1';
                html = \`<\${Tag} style="text-align: \${block.styles.textAlign || 'left'}; color: \${block.styles.color || '#333'};">\${block.content.text}</\${Tag}>\`;
                break;
              case 'text':
                html = \`<div class="block-text">\${block.content.html}</div>\`;
                break;
              case 'image':
                html = \`<div class="block-image"><img src="\${block.content.src}" alt="\${block.content.alt}" /></div>\`;
                break;
              case 'button':
                html = \`<div class="block-button"><a href="\${block.content.url}" style="background: \${block.styles.backgroundColor || '#E85D04'}; color: \${block.styles.color || '#fff'};">\${block.content.text}</a></div>\`;
                break;
              case 'divider':
                html = \`<div class="block-divider"><hr style="border-color: \${block.styles.borderColor || '#e0e0e0'}" /></div>\`;
                break;
              case 'spacer':
                html = \`<div class="block-spacer" style="height: \${block.content.height || 30}px;"></div>\`;
                break;
            }

            return \`
              <div class="email-block \${selected}" onclick="selectBlock(\${i})" data-index="\${i}">
                \${html}
                <div class="block-controls">
                  <button class="block-control-btn" onclick="event.stopPropagation(); moveBlock(\${i}, -1)">↑</button>
                  <button class="block-control-btn" onclick="event.stopPropagation(); moveBlock(\${i}, 1)">↓</button>
                  <button class="block-control-btn delete" onclick="event.stopPropagation(); removeBlock(\${i})">×</button>
                </div>
              </div>
            \`;
          }).join('');
        }

        function renderEditor() {
          const editor = document.getElementById('block-editor');

          if (selectedBlockIndex < 0 || !blocks[selectedBlockIndex]) {
            editor.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">Select a block to edit</p>';
            return;
          }

          const block = blocks[selectedBlockIndex];
          let html = '';

          switch (block.type) {
            case 'header':
              html = \`
                <div class="form-group">
                  <label class="form-label">Text</label>
                  <input type="text" class="form-input" value="\${block.content.text}" onchange="updateBlock('content.text', this.value)" />
                </div>
                <div class="form-group">
                  <label class="form-label">Level</label>
                  <select class="form-select" onchange="updateBlock('content.level', this.value)">
                    <option value="h1" \${block.content.level === 'h1' ? 'selected' : ''}>H1 - Large</option>
                    <option value="h2" \${block.content.level === 'h2' ? 'selected' : ''}>H2 - Medium</option>
                    <option value="h3" \${block.content.level === 'h3' ? 'selected' : ''}>H3 - Small</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Alignment</label>
                  <select class="form-select" onchange="updateBlock('styles.textAlign', this.value)">
                    <option value="left" \${block.styles.textAlign === 'left' ? 'selected' : ''}>Left</option>
                    <option value="center" \${block.styles.textAlign === 'center' ? 'selected' : ''}>Center</option>
                    <option value="right" \${block.styles.textAlign === 'right' ? 'selected' : ''}>Right</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Color</label>
                  <input type="color" class="form-input" value="\${block.styles.color || '#333333'}" onchange="updateBlock('styles.color', this.value)" style="height: 40px;" />
                </div>
              \`;
              break;

            case 'text':
              html = \`
                <div class="form-group">
                  <label class="form-label">Content</label>
                  <textarea class="form-textarea" rows="6" onchange="updateBlock('content.html', this.value)">\${block.content.html}</textarea>
                  <div class="form-hint">HTML allowed. Use variables like {{customer_name}}</div>
                </div>
              \`;
              break;

            case 'image':
              html = \`
                <div class="form-group">
                  <label class="form-label">Image URL</label>
                  <input type="url" class="form-input" value="\${block.content.src}" onchange="updateBlock('content.src', this.value)" placeholder="https://..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Alt Text</label>
                  <input type="text" class="form-input" value="\${block.content.alt}" onchange="updateBlock('content.alt', this.value)" />
                </div>
              \`;
              break;

            case 'button':
              html = \`
                <div class="form-group">
                  <label class="form-label">Button Text</label>
                  <input type="text" class="form-input" value="\${block.content.text}" onchange="updateBlock('content.text', this.value)" />
                </div>
                <div class="form-group">
                  <label class="form-label">URL</label>
                  <input type="url" class="form-input" value="\${block.content.url}" onchange="updateBlock('content.url', this.value)" />
                </div>
                <div class="form-group">
                  <label class="form-label">Background Color</label>
                  <input type="color" class="form-input" value="\${block.styles.backgroundColor || '#E85D04'}" onchange="updateBlock('styles.backgroundColor', this.value)" style="height: 40px;" />
                </div>
                <div class="form-group">
                  <label class="form-label">Text Color</label>
                  <input type="color" class="form-input" value="\${block.styles.color || '#ffffff'}" onchange="updateBlock('styles.color', this.value)" style="height: 40px;" />
                </div>
              \`;
              break;

            case 'divider':
              html = \`
                <div class="form-group">
                  <label class="form-label">Line Color</label>
                  <input type="color" class="form-input" value="\${block.styles.borderColor || '#e0e0e0'}" onchange="updateBlock('styles.borderColor', this.value)" style="height: 40px;" />
                </div>
              \`;
              break;

            case 'spacer':
              html = \`
                <div class="form-group">
                  <label class="form-label">Height (px)</label>
                  <input type="number" class="form-input" value="\${block.content.height || 30}" onchange="updateBlock('content.height', parseInt(this.value))" min="10" max="100" />
                </div>
              \`;
              break;
          }

          editor.innerHTML = html;
        }

        function updateBlock(path, value) {
          const parts = path.split('.');
          let obj = blocks[selectedBlockIndex];
          for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
          }
          obj[parts[parts.length - 1]] = value;
          renderCanvas();
        }

        function insertVariable(variable) {
          // If a text block is selected, append to it
          if (selectedBlockIndex >= 0 && blocks[selectedBlockIndex].type === 'text') {
            blocks[selectedBlockIndex].content.html += ' ' + variable;
            renderCanvas();
            renderEditor();
          } else {
            // Copy to clipboard
            navigator.clipboard.writeText(variable);
            alert('Variable copied to clipboard: ' + variable);
          }
        }

        function generateHtml() {
          let html = '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">';

          blocks.forEach(block => {
            switch (block.type) {
              case 'header':
                const Tag = block.content.level || 'h1';
                html += \`<\${Tag} style="text-align: \${block.styles.textAlign || 'left'}; color: \${block.styles.color || '#333'}; margin: 20px 0;">\${block.content.text}</\${Tag}>\`;
                break;
              case 'text':
                html += \`<div style="line-height: 1.6; margin: 15px 0;">\${block.content.html}</div>\`;
                break;
              case 'image':
                html += \`<div style="text-align: center; margin: 20px 0;"><img src="\${block.content.src}" alt="\${block.content.alt}" style="max-width: 100%; height: auto;" /></div>\`;
                break;
              case 'button':
                html += \`<div style="text-align: center; margin: 25px 0;"><a href="\${block.content.url}" style="display: inline-block; padding: 14px 28px; background: \${block.styles.backgroundColor || '#E85D04'}; color: \${block.styles.color || '#fff'}; text-decoration: none; border-radius: 6px; font-weight: 600;">\${block.content.text}</a></div>\`;
                break;
              case 'divider':
                html += \`<hr style="border: none; border-top: 1px solid \${block.styles.borderColor || '#e0e0e0'}; margin: 20px 0;" />\`;
                break;
              case 'spacer':
                html += \`<div style="height: \${block.content.height || 30}px;"></div>\`;
                break;
            }
          });

          html += '</div>';
          return html;
        }

        function previewEmail() {
          const html = generateHtml();
          const win = window.open('', 'Email Preview', 'width=700,height=600');
          win.document.write('<html><head><title>Email Preview</title></head><body style="background: #f5f5f5; padding: 20px;">' + html + '</body></html>');
        }

        async function saveTemplate() {
          const id = document.getElementById('template-id').value;
          const name = document.getElementById('template-name').value;
          const subject = document.getElementById('template-subject').value;

          if (!name || !subject) {
            alert('Please fill in template name and subject');
            return;
          }

          const data = {
            name,
            subject,
            category: document.getElementById('template-category').value,
            body_html: generateHtml(),
            body_json: JSON.stringify(blocks),
            variables: JSON.stringify(blocks.map(b => b.content.html || b.content.text || '').join(' ').match(/{{[^}]+}}/g) || []),
            is_active: document.getElementById('template-active').checked ? 1 : 0
          };

          try {
            const url = id ? '/api/email-templates/' + id : '/api/email-templates';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              window.location.href = '/admin/engagement/email';
            } else {
              alert('Failed to save template');
            }
          } catch (err) {
            alert('Error saving template');
          }
        }

        // Initialize
        renderCanvas();
      `}} />
    </AdminLayout>
  );
};
