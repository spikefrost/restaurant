import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { Branch } from '../../types';
import { escapeHtml, isOpen } from '../../utils/helpers';

interface BranchesPageProps {
  branches: Branch[];
}

export const AdminBranchesPage: FC<BranchesPageProps> = ({ branches }) => {
  return (
    <AdminLayout title="Branches" currentPath="/admin/branches">
      <div class="admin-header">
        <h1 class="admin-title">Branches / Locations</h1>
        <a href="/admin/branches/new" class="btn btn-primary">+ Add Branch</a>
      </div>

      {branches.length > 0 ? (
        <div class="grid grid-2" style="gap: 24px;">
          {branches.map(branch => {
            const open = isOpen(branch.opening_hours, branch.closing_hours);

            return (
              <div class="card" style="padding: 24px;">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">{escapeHtml(branch.name)}</h3>
                    <span class={`badge ${branch.is_active ? (open ? 'badge-new' : 'badge-popular') : ''}`}
                          style={!branch.is_active ? 'background: var(--text-muted); color: white;' : ''}>
                      {branch.is_active ? (open ? 'Open Now' : 'Closed') : 'Inactive'}
                    </span>
                  </div>
                  <a href={`/admin/branches/${branch.id}`} class="btn btn-ghost btn-sm">Edit</a>
                </div>

                <div style="margin: 16px 0;">
                  <div class="flex gap-1 mb-1 text-muted">
                    <span>📍</span>
                    <span>{escapeHtml(branch.address)}</span>
                  </div>
                  <div class="flex gap-1 mb-1 text-muted">
                    <span>📞</span>
                    <span>{escapeHtml(branch.phone)}</span>
                  </div>
                  <div class="flex gap-1 mb-1 text-muted">
                    <span>🕐</span>
                    <span>{branch.opening_hours} - {branch.closing_hours}</span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <a href={`/admin/qrcodes?branch=${branch.id}`} class="btn btn-secondary btn-sm">
                    📱 QR Codes
                  </a>
                  <a href={`/menu?branch=${branch.id}`} target="_blank" class="btn btn-ghost btn-sm">
                    View Menu
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🏪</div>
          <h3 class="empty-state-title">No Branches</h3>
          <p class="empty-state-text">Add your first restaurant location.</p>
          <a href="/admin/branches/new" class="btn btn-primary">+ Add Branch</a>
        </div>
      )}
    </AdminLayout>
  );
};

interface BranchFormProps {
  branch?: Branch;
}

export const AdminBranchFormPage: FC<BranchFormProps> = ({ branch }) => {
  const isEdit = !!branch;

  return (
    <AdminLayout title={isEdit ? 'Edit Branch' : 'New Branch'} currentPath="/admin/branches">
      <div class="admin-header">
        <h1 class="admin-title">{isEdit ? 'Edit Branch' : 'Add Branch'}</h1>
        <a href="/admin/branches" class="btn btn-ghost">Cancel</a>
      </div>

      <div class="card" style="padding: 24px; max-width: 800px;">
        <form method="POST" action={isEdit ? `/api/branches/${branch.id}` : '/api/branches'}>
          <input type="hidden" name="_method" value={isEdit ? 'PUT' : 'POST'} />

          <div class="form-group">
            <label class="form-label">Branch Name *</label>
            <input type="text" name="name" class="form-input" value={branch?.name || ''} required placeholder="e.g., Downtown Branch" />
          </div>

          <div class="form-group">
            <label class="form-label">Full Address *</label>
            <textarea name="address" class="form-textarea" required placeholder="Street, Building, City, Country">{branch?.address || ''}</textarea>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" name="phone" class="form-input" value={branch?.phone || ''} required placeholder="+971 4 XXX XXXX" />
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="email" class="form-input" value={branch?.email || ''} placeholder="branch@restaurant.com" />
            </div>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Opening Time *</label>
              <input type="time" name="opening_hours" class="form-input" value={branch?.opening_hours || '09:00'} required />
            </div>

            <div class="form-group">
              <label class="form-label">Closing Time *</label>
              <input type="time" name="closing_hours" class="form-input" value={branch?.closing_hours || '22:00'} required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Features (comma-separated)</label>
            <input type="text" name="features" class="form-input" value={branch?.features || ''} placeholder="WiFi, Parking, Outdoor Seating, Kids Area" />
          </div>

          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" name="image_url" class="form-input" value={branch?.image_url || ''} placeholder="https://..." />
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="is_active" value="1" checked={branch?.is_active !== 0} />
              <span>Active (visible to customers)</span>
            </label>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">{isEdit ? 'Update Branch' : 'Create Branch'}</button>
            <a href="/admin/branches" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
