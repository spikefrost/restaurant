import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { MenuItemWithCategory, Category } from '../../types';
import { formatCurrency, escapeHtml } from '../../utils/helpers';

interface MenuPageProps {
  items: MenuItemWithCategory[];
  categories: Category[];
  selectedCategory?: number;
}

export const AdminMenuPage: FC<MenuPageProps> = ({ items, categories, selectedCategory }) => {
  const filteredItems = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items;

  return (
    <AdminLayout title="Menu Management" currentPath="/admin/menu">
      <div class="admin-header">
        <h1 class="admin-title">Menu Items</h1>
        <div class="flex gap-2">
          <button onclick="window.openBatchImportModal()" class="btn btn-ghost">
            📥 Batch Import
          </button>
          <a href="/admin/menu/new" class="btn btn-primary">+ Add Item</a>
        </div>
      </div>

      {/* Category Filter */}
      <div class="category-nav" style="margin-bottom: 24px;">
        <a
          href="/admin/menu"
          class={`category-btn ${!selectedCategory ? 'active' : ''}`}
        >
          All ({items.length})
        </a>
        {categories.map(cat => {
          const count = items.filter(i => i.category_id === cat.id).length;
          return (
            <a
              href={`/admin/menu?category=${cat.id}`}
              class={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {escapeHtml(cat.name)} ({count})
            </a>
          );
        })}
      </div>

      {filteredItems.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr>
                  <td>
                    <img
                      src={item.image_url || 'https://via.placeholder.com/60x60?text=No+Image'}
                      alt={escapeHtml(item.name)}
                      style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                    />
                  </td>
                  <td>
                    <div style="font-weight: 600;">{escapeHtml(item.name)}</div>
                    <div class="text-muted" style="font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {escapeHtml(item.description)}
                    </div>
                  </td>
                  <td>{escapeHtml(item.category_name)}</td>
                  <td style="font-weight: 600;">{formatCurrency(item.price)}</td>
                  <td>
                    <div class="flex gap-1 flex-wrap">
                      {item.is_popular === 1 && <span class="badge badge-popular">Popular</span>}
                      {item.is_new === 1 && <span class="badge badge-new">New</span>}
                      {item.is_vegetarian === 1 && <span class="badge badge-veg">V</span>}
                      {item.is_vegan === 1 && <span class="badge badge-vegan">VG</span>}
                      {item.is_gluten_free === 1 && <span class="badge badge-gf">GF</span>}
                    </div>
                  </td>
                  <td>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        checked={item.is_available === 1}
                        onchange={`toggleAvailability(${item.id})`}
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a href={`/admin/menu/${item.id}`} class="btn btn-ghost btn-sm">Edit</a>
                      <button onclick={`deleteItem(${item.id})`} class="btn btn-ghost btn-sm text-error">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">🍔</div>
          <h3 class="empty-state-title">No Menu Items</h3>
          <p class="empty-state-text">Add your first menu item to get started.</p>
          <a href="/admin/menu/new" class="btn btn-primary">+ Add Item</a>
        </div>
      )}

      {/* Batch Import Modal */}
      <div id="batchImportModal" class="modal-overlay hidden">
        <div class="modal" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title">Batch Import Menu Items</h3>
            <button onclick="closeBatchImportModal()" class="btn btn-ghost btn-icon">&times;</button>
          </div>
          <div class="modal-body">
            {/* Import Tabs */}
            <div class="import-tabs">
              <button class="import-tab active" data-tab="excel" onclick="switchImportTab('excel')">
                📊 Excel Upload
              </button>
              <button class="import-tab" data-tab="photo" onclick="switchImportTab('photo')">
                📷 Photo Scan
              </button>
            </div>

            {/* Excel Import Tab */}
            <div id="excel-tab" style="display: block;">
              <div class="import-section">
                <h4 style="margin-bottom: 12px;">Step 1: Download Template</h4>
                <p class="text-muted" style="margin-bottom: 12px; font-size: 14px;">
                  Download our CSV template and fill in your menu items. The template includes all required fields and example data.
                </p>
                <a href="/api/menu/template" download class="btn btn-secondary">
                  📥 Download Template (.csv)
                </a>
              </div>

              <div class="import-section" style="margin-top: 24px;">
                <h4 style="margin-bottom: 12px;">Step 2: Upload Filled Template</h4>
                <div class="file-upload-area" id="excelUploadArea">
                  <input type="file" id="excelFile" accept=".xlsx,.xls,.csv" style="display: none;" onchange="handleExcelUpload(event)" />
                  <div class="file-upload-content">
                    <div class="file-upload-icon">📊</div>
                    <p style="font-weight: 600; margin-bottom: 4px;">Drop your Excel/CSV file here</p>
                    <p class="text-muted" style="font-size: 14px;">or click to browse</p>
                    <button type="button" class="btn btn-primary btn-sm" style="margin-top: 12px;" onclick="document.getElementById('excelFile').click()">
                      Choose File
                    </button>
                  </div>
                </div>
                <div id="excelFileInfo" class="file-info" style="display: none;"></div>
              </div>
            </div>

            {/* Photo Import Tab */}
            <div id="photo-tab" style="display: none;">
              <div class="import-section">
                <p class="text-muted" style="margin-bottom: 16px; font-size: 14px;">
                  Upload a photo of your menu and our AI will extract the items automatically. Works best with clear, well-lit photos of printed menus.
                </p>
                <div class="file-upload-area" id="photoUploadArea">
                  <input type="file" id="photoFile" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)" />
                  <div class="file-upload-content">
                    <div class="file-upload-icon">📷</div>
                    <p style="font-weight: 600; margin-bottom: 4px;">Drop your menu photo here</p>
                    <p class="text-muted" style="font-size: 14px;">Supports JPG, PNG, WEBP</p>
                    <button type="button" class="btn btn-primary btn-sm" style="margin-top: 12px;" onclick="document.getElementById('photoFile').click()">
                      Choose Photo
                    </button>
                  </div>
                </div>
                <div id="photoPreview" class="photo-preview" style="display: none;"></div>
              </div>
            </div>

            {/* Preview Section */}
            <div id="importPreview" class="import-preview" style="display: none;">
              <h4 style="margin: 24px 0 12px;">Preview Items to Import</h4>
              <div class="import-preview-count">
                <span id="validCount">0</span> items ready to import
                <span id="errorCount" class="text-error" style="display: none;"> • <span id="errorNum">0</span> errors</span>
              </div>
              <div class="import-preview-table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="previewTableBody"></tbody>
                </table>
              </div>
            </div>

            {/* Processing Indicator */}
            <div id="importProcessing" class="import-processing" style="display: none;">
              <div class="spinner"></div>
              <p id="processingText">Processing...</p>
            </div>
          </div>
          <div class="modal-footer">
            <button onclick="closeBatchImportModal()" class="btn btn-ghost">Cancel</button>
            <button id="importBtn" onclick="executeImport()" class="btn btn-primary" disabled>
              Import Items
            </button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        let importItems = [];
        const categories = ${JSON.stringify(categories)};

        window.openBatchImportModal = function() {
          document.getElementById('batchImportModal').classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }

        function closeBatchImportModal() {
          document.getElementById('batchImportModal').classList.add('hidden');
          document.body.style.overflow = '';
          resetImportModal();
        }

        function resetImportModal() {
          importItems = [];
          document.getElementById('importPreview').style.display = 'none';
          document.getElementById('importProcessing').style.display = 'none';
          document.getElementById('excelFileInfo').style.display = 'none';
          document.getElementById('photoPreview').style.display = 'none';
          document.getElementById('importBtn').disabled = true;
          document.getElementById('excelFile').value = '';
          document.getElementById('photoFile').value = '';
        }

        function switchImportTab(tab) {
          // Update tab buttons
          document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
          document.querySelector('[data-tab="' + tab + '"]').classList.add('active');

          // Show/hide tab content
          document.getElementById('excel-tab').style.display = tab === 'excel' ? 'block' : 'none';
          document.getElementById('photo-tab').style.display = tab === 'photo' ? 'block' : 'none';

          // Reset other state
          importItems = [];
          document.getElementById('importPreview').style.display = 'none';
          document.getElementById('importProcessing').style.display = 'none';
          document.getElementById('excelFileInfo').style.display = 'none';
          document.getElementById('photoPreview').style.display = 'none';
          document.getElementById('importBtn').disabled = true;
        }

        async function handleExcelUpload(event) {
          const file = event.target.files[0];
          if (!file) return;

          // Show file info
          const fileInfo = document.getElementById('excelFileInfo');
          fileInfo.innerHTML = '<span>📄 ' + file.name + '</span><span class="text-muted"> (' + (file.size / 1024).toFixed(1) + ' KB)</span>';
          fileInfo.style.display = 'flex';

          // Show processing
          showProcessing('Parsing Excel file...');

          try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/menu/import/parse-excel', {
              method: 'POST',
              body: formData
            });

            const data = await res.json();
            hideProcessing();

            if (data.success) {
              importItems = data.items;
              showPreview(data.items);
            } else {
              alert('Error parsing file: ' + data.error);
            }
          } catch (err) {
            hideProcessing();
            alert('Failed to parse file: ' + err.message);
          }
        }

        async function handlePhotoUpload(event) {
          const file = event.target.files[0];
          if (!file) return;

          // Show preview
          const preview = document.getElementById('photoPreview');
          const reader = new FileReader();
          reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" alt="Menu preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;" />';
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);

          // Show processing
          showProcessing('Analyzing menu photo with AI...');

          try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/menu/import/scan-photo', {
              method: 'POST',
              body: formData
            });

            const data = await res.json();
            hideProcessing();

            if (data.success) {
              importItems = data.items;
              showPreview(data.items);
            } else {
              alert('Error scanning photo: ' + data.error);
            }
          } catch (err) {
            hideProcessing();
            alert('Failed to scan photo: ' + err.message);
          }
        }

        function showProcessing(text) {
          document.getElementById('processingText').textContent = text;
          document.getElementById('importProcessing').style.display = 'block';
        }

        function hideProcessing() {
          document.getElementById('importProcessing').style.display = 'none';
        }

        function showPreview(items) {
          const validItems = items.filter(i => i.valid);
          const errorItems = items.filter(i => !i.valid);

          document.getElementById('validCount').textContent = validItems.length;

          if (errorItems.length > 0) {
            document.getElementById('errorCount').style.display = 'inline';
            document.getElementById('errorNum').textContent = errorItems.length;
          } else {
            document.getElementById('errorCount').style.display = 'none';
          }

          const tbody = document.getElementById('previewTableBody');
          tbody.innerHTML = items.map(item => {
            const categoryName = categories.find(c => c.id === item.category_id)?.name || item.category_name || 'Unknown';
            return '<tr class="' + (item.valid ? '' : 'row-error') + '">' +
              '<td>' + escapeHtml(item.name) + '</td>' +
              '<td>' + escapeHtml(categoryName) + '</td>' +
              '<td>$' + (item.price || 0).toFixed(2) + '</td>' +
              '<td>' + (item.valid ? '<span class="badge badge-new">Ready</span>' : '<span class="badge" style="background:#fee2e2;color:#991b1b;">' + escapeHtml(item.error || 'Error') + '</span>') + '</td>' +
            '</tr>';
          }).join('');

          document.getElementById('importPreview').style.display = 'block';
          document.getElementById('importBtn').disabled = validItems.length === 0;
        }

        function escapeHtml(text) {
          if (!text) return '';
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        async function executeImport() {
          const validItems = importItems.filter(i => i.valid);
          if (validItems.length === 0) return;

          showProcessing('Importing ' + validItems.length + ' items...');
          document.getElementById('importBtn').disabled = true;

          try {
            const res = await fetch('/api/menu/import/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: validItems })
            });

            const data = await res.json();
            hideProcessing();

            if (data.success) {
              alert('Successfully imported ' + data.imported + ' items!');
              closeBatchImportModal();
              location.reload();
            } else {
              alert('Import failed: ' + data.error);
              document.getElementById('importBtn').disabled = false;
            }
          } catch (err) {
            hideProcessing();
            alert('Import failed: ' + err.message);
            document.getElementById('importBtn').disabled = false;
          }
        }

        // Drag and drop handlers
        ['excelUploadArea', 'photoUploadArea'].forEach(id => {
          const area = document.getElementById(id);
          if (!area) return;

          area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('drag-over');
          });

          area.addEventListener('dragleave', () => {
            area.classList.remove('drag-over');
          });

          area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
            const input = area.querySelector('input[type="file"]');
            if (e.dataTransfer.files.length > 0) {
              input.files = e.dataTransfer.files;
              input.dispatchEvent(new Event('change'));
            }
          });

          area.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
              const input = area.querySelector('input[type="file"]');
              input.click();
            }
          });
        });

        async function toggleAvailability(id) {
          try {
            await fetch('/api/menu/' + id + '/toggle', { method: 'PUT' });
          } catch (err) {
            alert('Failed to update availability');
            location.reload();
          }
        }

        async function deleteItem(id) {
          if (!confirm('Are you sure you want to delete this item?')) return;

          try {
            const res = await fetch('/api/menu/' + id, { method: 'DELETE' });
            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to delete item');
            }
          } catch (err) {
            alert('Failed to delete item');
          }
        }
      `}} />
    </AdminLayout>
  );
};

interface MenuFormProps {
  item?: MenuItemWithCategory;
  categories: Category[];
}

export const AdminMenuFormPage: FC<MenuFormProps> = ({ item, categories }) => {
  const isEdit = !!item;

  return (
    <AdminLayout title={isEdit ? 'Edit Item' : 'New Item'} currentPath="/admin/menu">
      <div class="admin-header">
        <h1 class="admin-title">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h1>
        <a href="/admin/menu" class="btn btn-ghost">Cancel</a>
      </div>

      <div class="card" style="padding: 24px; max-width: 800px;">
        <form method="POST" action={isEdit ? `/api/menu/${item.id}` : '/api/menu'}>
          <input type="hidden" name="_method" value={isEdit ? 'PUT' : 'POST'} />

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input type="text" name="name" class="form-input" value={item?.name || ''} required />
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select name="category_id" class="form-select" required>
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option value={cat.id} selected={item?.category_id === cat.id}>
                    {escapeHtml(cat.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-textarea">{item?.description || ''}</textarea>
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Price (USD) *</label>
              <input type="number" name="price" step="0.01" class="form-input" value={item?.price || ''} required />
            </div>

            <div class="form-group">
              <label class="form-label">Calories</label>
              <input type="number" name="calories" class="form-input" value={item?.calories || ''} />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" name="image_url" class="form-input" value={item?.image_url || ''} placeholder="https://..." />
          </div>

          <div class="grid grid-2" style="gap: 20px;">
            <div class="form-group">
              <label class="form-label">Prep Time (minutes)</label>
              <input type="number" name="prep_time_minutes" class="form-input" value={item?.prep_time_minutes || '15'} />
            </div>

            <div class="form-group">
              <label class="form-label">Allergens</label>
              <input type="text" name="allergens" class="form-input" value={item?.allergens || ''} placeholder="e.g., nuts, dairy" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tags & Dietary</label>
            <div class="flex gap-3 flex-wrap" style="margin-top: 8px;">
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_popular" value="1" checked={item?.is_popular === 1} />
                <span>Popular</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_new" value="1" checked={item?.is_new === 1} />
                <span>New</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_vegetarian" value="1" checked={item?.is_vegetarian === 1} />
                <span>Vegetarian</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_vegan" value="1" checked={item?.is_vegan === 1} />
                <span>Vegan</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_gluten_free" value="1" checked={item?.is_gluten_free === 1} />
                <span>Gluten Free</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="is_available" value="1" checked={item?.is_available !== 0} />
              <span class="form-label" style="margin: 0;">Available for ordering</span>
            </label>
          </div>

          <div class="flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary">{isEdit ? 'Update Item' : 'Create Item'}</button>
            <a href="/admin/menu" class="btn btn-ghost">Cancel</a>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
