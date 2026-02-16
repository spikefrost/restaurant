import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { QRCode, Branch } from '../../types';
import { escapeHtml, formatDateTime } from '../../utils/helpers';

interface QRCodesPageProps {
  qrcodes: (QRCode & { branch_name: string })[];
  branches: Branch[];
  selectedBranch?: number;
}

export const AdminQRCodesPage: FC<QRCodesPageProps> = ({ qrcodes, branches, selectedBranch }) => {
  const filteredCodes = selectedBranch
    ? qrcodes.filter(q => q.branch_id === selectedBranch)
    : qrcodes;

  return (
    <AdminLayout title="QR Codes" currentPath="/admin/qrcodes">
      <div class="admin-header">
        <h1 class="admin-title">QR Codes</h1>
        <button onclick="openGenerateModal()" class="btn btn-primary">+ Generate QR Codes</button>
      </div>

      {/* Branch Filter */}
      <div class="category-nav" style="margin-bottom: 24px;">
        <a
          href="/admin/qrcodes"
          class={`category-btn ${!selectedBranch ? 'active' : ''}`}
        >
          All Branches
        </a>
        {branches.map(b => (
          <a
            href={`/admin/qrcodes?branch=${b.id}`}
            class={`category-btn ${selectedBranch === b.id ? 'active' : ''}`}
          >
            {escapeHtml(b.name)}
          </a>
        ))}
      </div>

      {filteredCodes.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>QR Code</th>
                <th>Branch</th>
                <th>Table</th>
                <th>Code</th>
                <th>Scans</th>
                <th>Last Scanned</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map(qr => (
                <tr>
                  <td>
                    <div style="width: 60px; height: 60px; background: white; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(getQRUrl(qr))}`}
                        alt="QR Code"
                        style="width: 50px; height: 50px;"
                      />
                    </div>
                  </td>
                  <td>{escapeHtml(qr.branch_name)}</td>
                  <td style="font-weight: 600; font-size: 18px;">{qr.table_number}</td>
                  <td>
                    <code style="font-size: 11px; background: var(--bg-alt); padding: 4px 8px; border-radius: 4px;">
                      {qr.code}
                    </code>
                  </td>
                  <td>{qr.scan_count}</td>
                  <td class="text-muted">
                    {qr.last_scanned_at ? formatDateTime(qr.last_scanned_at) : 'Never'}
                  </td>
                  <td>
                    <span class={`badge ${qr.is_active ? 'badge-new' : ''}`} style={!qr.is_active ? 'background: var(--text-muted); color: white;' : ''}>
                      {qr.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button onclick={`downloadQR(${qr.id}, '${qr.code}')`} class="btn btn-ghost btn-sm">Download</button>
                      <button onclick={`toggleQR(${qr.id})`} class="btn btn-ghost btn-sm">
                        {qr.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onclick={`deleteQR(${qr.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <h3 class="empty-state-title">No QR Codes</h3>
          <p class="empty-state-text">Generate QR codes for your tables to enable contactless ordering.</p>
          <button onclick="openGenerateModal()" class="btn btn-primary">+ Generate QR Codes</button>
        </div>
      )}

      {/* Generate Modal */}
      <div id="generate-modal" class="qr-modal">
        <div class="qr-modal-backdrop" onclick="closeGenerateModal()"></div>
        <div class="qr-modal-content">
          <div class="modal-header">
            <h2>Generate QR Codes</h2>
            <button onclick="closeGenerateModal()" class="modal-close">&times;</button>
          </div>

          <form id="generate-form" onsubmit="return generateQRCodes(event)">
            <div class="form-group">
              <label class="form-label">Branch *</label>
              <select name="branch_id" class="form-select" required>
                <option value="">Select branch</option>
                {branches.map(b => (
                  <option value={b.id}>{escapeHtml(b.name)}</option>
                ))}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 1;">
                <label class="form-label">Start Table #</label>
                <input type="number" name="start_table" class="form-input" value="1" min="1" required />
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label">End Table #</label>
                <input type="number" name="end_table" class="form-input" value="10" min="1" required />
              </div>
            </div>

            <div class="form-hint" style="margin-bottom: 16px;">
              This will generate QR codes for tables T1 through T10 (based on your input).
            </div>

            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary">Generate</button>
              <button type="button" onclick="closeGenerateModal()" class="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        /* Modal Styles */
        .qr-modal {
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
        .qr-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .qr-modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 24px;
        }
        .qr-modal-content .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .qr-modal-content .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .qr-modal-content .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text-muted);
          line-height: 1;
        }
        .qr-modal-content .modal-close:hover {
          color: var(--text);
        }
        .qr-modal-content .form-group {
          margin-bottom: 16px;
        }
        .qr-modal-content .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .qr-modal-content .form-input,
        .qr-modal-content .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const baseUrl = window.location.origin;

        function getQRUrl(qr) {
          return baseUrl + '/order?code=' + qr.code;
        }

        function openGenerateModal() {
          document.getElementById('generate-modal').style.display = 'flex';
        }

        function closeGenerateModal() {
          document.getElementById('generate-modal').style.display = 'none';
        }

        async function generateQRCodes(e) {
          e.preventDefault();
          const form = document.getElementById('generate-form');
          const formData = new FormData(form);

          try {
            const res = await fetch('/api/qrcodes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                branch_id: parseInt(formData.get('branch_id')),
                start_table: parseInt(formData.get('start_table')),
                end_table: parseInt(formData.get('end_table'))
              })
            });

            const result = await res.json();
            if (result.success) {
              alert('Generated ' + result.created.length + ' QR codes!');
              location.reload();
            } else {
              alert('Failed: ' + (result.error || 'Unknown error'));
            }
          } catch (err) {
            alert('Failed to generate QR codes');
          }
          return false;
        }

        async function toggleQR(id) {
          try {
            await fetch('/api/qrcodes/' + id + '/toggle', { method: 'PUT' });
            location.reload();
          } catch (err) {
            alert('Failed to toggle QR code');
          }
        }

        async function deleteQR(id) {
          if (!confirm('Delete this QR code?')) return;
          try {
            const res = await fetch('/api/qrcodes/' + id, { method: 'DELETE' });
            if (res.ok) location.reload();
            else alert('Failed to delete');
          } catch (err) {
            alert('Failed to delete');
          }
        }

        function downloadQR(id, code) {
          const url = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(baseUrl + '/order?code=' + code);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'qr-' + code + '.png';
          a.click();
        }
      `}} />
    </AdminLayout>
  );
};

function getQRUrl(qr: QRCode): string {
  return `/order?code=${qr.code}`;
}
