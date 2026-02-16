import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { Category } from '../../types';
import { escapeHtml } from '../../utils/helpers';

interface CategoriesPageProps {
  categories: Category[];
}

export const AdminCategoriesPage: FC<CategoriesPageProps> = ({ categories }) => {
  return (
    <AdminLayout title="Categories" currentPath="/admin/categories">
      <div class="admin-header">
        <h1 class="admin-title">Categories</h1>
        <a href="/admin/categories/new" class="btn btn-primary">+ Add Category</a>
      </div>

      {categories.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr>
                  <td>
                    <span style="font-weight: 600; color: var(--text-muted);">#{cat.sort_order}</span>
                  </td>
                  <td>
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={escapeHtml(cat.name)}
                        style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                      />
                    ) : (
                      <div style="width: 50px; height: 50px; background: var(--bg-alt); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        📁
                      </div>
                    )}
                  </td>
                  <td style="font-weight: 600;">{escapeHtml(cat.name)}</td>
                  <td class="text-muted" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {escapeHtml(cat.description) || '-'}
                  </td>
                  <td>
                    <span class={`badge ${cat.is_active ? 'badge-new' : ''}`} style={cat.is_active ? '' : 'background: var(--text-muted); color: white;'}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a href={`/admin/categories/${cat.id}`} class="btn btn-ghost btn-sm">Edit</a>
                      <button onclick={`deleteCategory(${cat.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📁</div>
          <h3 class="empty-state-title">No Categories</h3>
          <p class="empty-state-text">Create categories to organize your menu items.</p>
          <a href="/admin/categories/new" class="btn btn-primary">+ Add Category</a>
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        async function deleteCategory(id) {
          if (!confirm('Are you sure? This will not delete menu items but they will become uncategorized.')) return;

          try {
            const res = await fetch('/api/categories/' + id, { method: 'DELETE' });
            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to delete category');
            }
          } catch (err) {
            alert('Failed to delete category');
          }
        }
      `}} />
    </AdminLayout>
  );
};

interface CategoryFormProps {
  category?: Category;
}

export const AdminCategoryFormPage: FC<CategoryFormProps> = ({ category }) => {
  const isEdit = !!category;

  return (
    <AdminLayout title={isEdit ? 'Edit Category' : 'New Category'} currentPath="/admin/categories">
      <div class="admin-header">
        <h1 class="admin-title">{isEdit ? 'Edit Category' : 'Add Category'}</h1>
        <a href="/admin/categories" class="btn btn-ghost">Cancel</a>
      </div>

      <div class="card" style="padding: 24px; max-width: 600px;">
        <form method="POST" action={isEdit ? `/api/categories/${category.id}` : '/api/categories'}>
          <input type="hidden" name="_method" value={isEdit ? 'PUT' : 'POST'} />

          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" name="name" class="form-input" value={category?.name || ''} required />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-textarea">{category?.description || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" name="image_url" class="form-input" value={category?.image_url || ''} placeholder="https://..." />
          </div>

          <div class="form-group">
            <label class="form-label">Sort Order</label>
            <input type="number" name="sort_order" class="form-input" value={category?.sort_order || 0} />
            <div class="form-hint">Lower numbers appear first</div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="is_active" value="1" checked={category?.is_active !== 0} />
              <span>Active (visible on menu)</span>
            </label>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">{isEdit ? 'Update Category' : 'Create Category'}</button>
            <a href="/admin/categories" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
