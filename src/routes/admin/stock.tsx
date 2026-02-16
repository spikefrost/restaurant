import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { Ingredient, StockLevel, Branch, MenuItem } from '../../types';
import { escapeHtml } from '../../utils/helpers';

interface AdminStockPageProps {
  ingredients: Ingredient[];
  stockLevels: (StockLevel & { ingredient_name: string; unit: string; min_stock_level: number })[];
  lowStock: (StockLevel & { ingredient_name: string; unit: string; min_stock_level: number })[];
  branches: Branch[];
  currentBranch?: number;
}

export const AdminStockPage: FC<AdminStockPageProps> = ({
  ingredients,
  stockLevels,
  lowStock,
  branches,
  currentBranch
}) => {
  return (
    <AdminLayout title="Stock Management" currentPath="/admin/stock">
      <div class="page-header">
        <div>
          <h1>Stock Management</h1>
          <p class="text-muted">Monitor ingredients and stock levels</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <select class="form-select" id="branch-filter" onchange="filterByBranch(this.value)">
            <option value="">All Branches</option>
            {branches.map(b => (
              <option value={b.id} selected={currentBranch === b.id}>{b.name}</option>
            ))}
          </select>
          <button class="btn btn-primary" onclick="openIngredientModal()">
            + Add Ingredient
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div class="alert alert-warning" style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">⚠️</span>
            <div>
              <strong>Low Stock Alert</strong>
              <p style="margin: 4px 0 0;">{lowStock.length} ingredient(s) are running low and need restocking</p>
            </div>
          </div>
        </div>
      )}

      <div class="grid-2">
        {/* Ingredients List */}
        <div class="card">
          <div class="card-header">
            <h3>Ingredients ({ingredients.length})</h3>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Cost/Unit</th>
                  <th>Min Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(ing => (
                  <tr>
                    <td><strong>{escapeHtml(ing.name)}</strong></td>
                    <td><span class="badge badge-secondary">{escapeHtml(ing.category)}</span></td>
                    <td>{escapeHtml(ing.unit)}</td>
                    <td>${ing.cost_per_unit.toFixed(2)}</td>
                    <td>{ing.min_stock_level}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick={`editIngredient(${ing.id})`}>Edit</button>
                      <button class="btn btn-ghost btn-sm text-error" onclick={`deleteIngredient(${ing.id})`}>Delete</button>
                    </td>
                  </tr>
                ))}
                {ingredients.length === 0 && (
                  <tr>
                    <td colspan="6" class="text-center text-muted" style="padding: 40px;">
                      No ingredients added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Levels */}
        <div class="card">
          <div class="card-header">
            <h3>Current Stock Levels</h3>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Current Qty</th>
                  <th>Min Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map(sl => {
                  const isLow = sl.current_quantity <= sl.min_stock_level;
                  const percentage = sl.min_stock_level > 0 ? (sl.current_quantity / sl.min_stock_level) * 100 : 100;
                  return (
                    <tr class={isLow ? 'row-warning' : ''}>
                      <td>
                        <strong>{escapeHtml(sl.ingredient_name)}</strong>
                        <div class="text-muted text-sm">{escapeHtml(sl.unit)}</div>
                      </td>
                      <td>
                        <span style={isLow ? 'color: var(--error); font-weight: 700;' : ''}>
                          {sl.current_quantity}
                        </span>
                      </td>
                      <td>{sl.min_stock_level}</td>
                      <td>
                        <div class="progress-bar" style="width: 80px;">
                          <div
                            class={`progress-fill ${percentage < 50 ? 'danger' : percentage < 100 ? 'warning' : 'success'}`}
                            style={`width: ${Math.min(percentage, 100)}%`}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <button class="btn btn-ghost btn-sm" onclick={`adjustStock(${sl.ingredient_id}, '${escapeHtml(sl.ingredient_name)}')`}>
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {stockLevels.length === 0 && (
                  <tr>
                    <td colspan="5" class="text-center text-muted" style="padding: 40px;">
                      No stock levels recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      {lowStock.length > 0 && (
        <div class="card" style="margin-top: 24px;">
          <div class="card-header" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--error);">
            <h3 style="color: var(--error);">⚠️ Items Needing Restock ({lowStock.length})</h3>
          </div>
          <div class="card-body">
            <div class="low-stock-grid">
              {lowStock.map(item => (
                <div class="low-stock-item">
                  <div class="low-stock-icon">📦</div>
                  <div class="low-stock-info">
                    <strong>{escapeHtml(item.ingredient_name)}</strong>
                    <div class="text-muted">{item.current_quantity} {item.unit} remaining</div>
                    <div class="text-error text-sm">Minimum: {item.min_stock_level} {item.unit}</div>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick={`adjustStock(${item.ingredient_id}, '${escapeHtml(item.ingredient_name)}')`}>
                    Restock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Modal */}
      <div id="ingredient-modal" class="stock-modal">
        <div class="stock-modal-backdrop" onclick="closeIngredientModal()"></div>
        <div class="stock-modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Add Ingredient</h3>
            <button class="modal-close" onclick="closeIngredientModal()">&times;</button>
          </div>
          <form id="ingredient-form" onsubmit="saveIngredient(event)">
            <input type="hidden" id="ing-id" />
            <div class="form-group">
              <label>Name *</label>
              <input type="text" id="ing-name" class="form-input" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select id="ing-category" class="form-select" required>
                  <option value="">Select category</option>
                  <option value="produce">Produce</option>
                  <option value="meat">Meat & Poultry</option>
                  <option value="seafood">Seafood</option>
                  <option value="dairy">Dairy</option>
                  <option value="dry_goods">Dry Goods</option>
                  <option value="spices">Spices & Seasonings</option>
                  <option value="sauces">Sauces & Condiments</option>
                  <option value="beverages">Beverages</option>
                  <option value="packaging">Packaging</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Unit *</label>
                <select id="ing-unit" class="form-select" required>
                  <option value="">Select unit</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="L">Liters (L)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="lb">Pounds (lb)</option>
                  <option value="cups">Cups</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cost per Unit ($) *</label>
                <input type="number" id="ing-cost" class="form-input" step="0.01" min="0" required />
              </div>
              <div class="form-group">
                <label>Minimum Stock Level *</label>
                <input type="number" id="ing-min-stock" class="form-input" min="0" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" onclick="closeIngredientModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Ingredient</button>
            </div>
          </form>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <div id="adjust-modal" class="stock-modal">
        <div class="stock-modal-backdrop" onclick="closeAdjustModal()"></div>
        <div class="stock-modal-content">
          <div class="modal-header">
            <h3>Adjust Stock: <span id="adjust-name"></span></h3>
            <button class="modal-close" onclick="closeAdjustModal()">&times;</button>
          </div>
          <form id="adjust-form" onsubmit="submitAdjustment(event)">
            <input type="hidden" id="adjust-ing-id" />
            <div class="form-group">
              <label>Branch *</label>
              <select id="adjust-branch" class="form-select" required>
                {branches.map(b => (
                  <option value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label>Adjustment Type</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="adjust-type" value="set" checked /> Set to specific quantity
                </label>
                <label class="radio-label">
                  <input type="radio" name="adjust-type" value="add" /> Add to current stock
                </label>
                <label class="radio-label">
                  <input type="radio" name="adjust-type" value="subtract" /> Subtract from stock
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" id="adjust-qty" class="form-input" min="0" step="0.01" required />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" onclick="closeAdjustModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Update Stock</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .alert {
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid;
        }
        .alert-warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--warning);
          color: var(--warning);
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        @media (max-width: 1200px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .table-container {
          max-height: 500px;
          overflow-y: auto;
        }
        .row-warning {
          background: rgba(245, 158, 11, 0.1) !important;
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }
        .progress-fill.success { background: var(--success); }
        .progress-fill.warning { background: var(--warning); }
        .progress-fill.danger { background: var(--error); }
        .low-stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .low-stock-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
        }
        .low-stock-icon {
          font-size: 32px;
        }
        .low-stock-info {
          flex: 1;
        }
        .stock-modal {
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
        .stock-modal.active {
          display: flex;
        }
        .stock-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .stock-modal-content {
          position: relative;
          background: var(--bg-card);
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-muted);
        }
        .modal-close:hover {
          color: var(--text);
        }
        #ingredient-form, #adjust-form {
          padding: 24px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          margin-top: 16px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .text-sm {
          font-size: 12px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const ingredientsData = ${JSON.stringify(ingredients)};

        function filterByBranch(branchId) {
          const url = new URL(window.location);
          if (branchId) {
            url.searchParams.set('branch', branchId);
          } else {
            url.searchParams.delete('branch');
          }
          window.location = url;
        }

        function openIngredientModal() {
          document.getElementById('modal-title').textContent = 'Add Ingredient';
          document.getElementById('ing-id').value = '';
          document.getElementById('ing-name').value = '';
          document.getElementById('ing-category').value = '';
          document.getElementById('ing-unit').value = '';
          document.getElementById('ing-cost').value = '';
          document.getElementById('ing-min-stock').value = '';
          document.getElementById('ingredient-modal').classList.add('active');
        }

        function editIngredient(id) {
          const ing = ingredientsData.find(i => i.id === id);
          if (!ing) return;

          document.getElementById('modal-title').textContent = 'Edit Ingredient';
          document.getElementById('ing-id').value = ing.id;
          document.getElementById('ing-name').value = ing.name;
          document.getElementById('ing-category').value = ing.category;
          document.getElementById('ing-unit').value = ing.unit;
          document.getElementById('ing-cost').value = ing.cost_per_unit;
          document.getElementById('ing-min-stock').value = ing.min_stock_level;
          document.getElementById('ingredient-modal').classList.add('active');
        }

        function closeIngredientModal() {
          document.getElementById('ingredient-modal').classList.remove('active');
        }

        async function saveIngredient(e) {
          e.preventDefault();
          const id = document.getElementById('ing-id').value;
          const data = {
            name: document.getElementById('ing-name').value,
            category: document.getElementById('ing-category').value,
            unit: document.getElementById('ing-unit').value,
            cost_per_unit: parseFloat(document.getElementById('ing-cost').value),
            min_stock_level: parseInt(document.getElementById('ing-min-stock').value)
          };

          try {
            const url = id ? '/api/ingredients/' + id : '/api/ingredients';
            const res = await fetch(url, {
              method: id ? 'PUT' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to save ingredient');
            }
          } catch (err) {
            alert('Error saving ingredient');
          }
        }

        async function deleteIngredient(id) {
          if (!confirm('Are you sure you want to delete this ingredient?')) return;

          try {
            const res = await fetch('/api/ingredients/' + id, { method: 'DELETE' });
            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to delete ingredient');
            }
          } catch (err) {
            alert('Error deleting ingredient');
          }
        }

        function adjustStock(ingredientId, ingredientName) {
          document.getElementById('adjust-name').textContent = ingredientName;
          document.getElementById('adjust-ing-id').value = ingredientId;
          document.getElementById('adjust-qty').value = '';
          document.querySelector('input[name="adjust-type"][value="set"]').checked = true;
          document.getElementById('adjust-modal').classList.add('active');
        }

        function closeAdjustModal() {
          document.getElementById('adjust-modal').classList.remove('active');
        }

        async function submitAdjustment(e) {
          e.preventDefault();
          const ingredientId = document.getElementById('adjust-ing-id').value;
          const branchId = document.getElementById('adjust-branch').value;
          const adjustType = document.querySelector('input[name="adjust-type"]:checked').value;
          const quantity = parseFloat(document.getElementById('adjust-qty').value);

          try {
            const res = await fetch('/api/stock/adjust', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ingredient_id: parseInt(ingredientId),
                branch_id: parseInt(branchId),
                adjust_type: adjustType,
                quantity: quantity
              })
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to adjust stock');
            }
          } catch (err) {
            alert('Error adjusting stock');
          }
        }
      `}} />
    </AdminLayout>
  );
};

// Stock Usage Report Page
interface AdminStockReportPageProps {
  usageReport: {
    ingredient_id: number;
    ingredient_name: string;
    unit: string;
    total_used: number;
    cost: number;
  }[];
  dailyUsage: {
    date: string;
    total_items: number;
    total_cost: number;
  }[];
  branches: Branch[];
  startDate: string;
  endDate: string;
  currentBranch?: number;
}

export const AdminStockReportPage: FC<AdminStockReportPageProps> = ({
  usageReport,
  dailyUsage,
  branches,
  startDate,
  endDate,
  currentBranch
}) => {
  const totalCost = usageReport.reduce((sum, r) => sum + r.cost, 0);

  return (
    <AdminLayout title="Stock Usage Report" currentPath="/admin/stock/reports">
      <div class="page-header">
        <div>
          <h1>Stock Usage Report</h1>
          <p class="text-muted">Track ingredient usage and costs</p>
        </div>
      </div>

      {/* Filters */}
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-body">
          <form id="filter-form" class="filter-form" onsubmit="applyFilters(event)">
            <div class="form-group">
              <label>Branch</label>
              <select id="branch-filter" class="form-select">
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option value={b.id} selected={currentBranch === b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="start-date" class="form-input" value={startDate} />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" id="end-date" class="form-input" value={endDate} />
            </div>
            <button type="submit" class="btn btn-primary" style="align-self: flex-end;">
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-value">{usageReport.length}</div>
            <div class="stat-label">Ingredients Used</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">${totalCost.toFixed(2)}</div>
            <div class="stat-label">Total Cost</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{dailyUsage.length}</div>
            <div class="stat-label">Days Tracked</div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        {/* Usage by Ingredient */}
        <div class="card">
          <div class="card-header">
            <h3>Usage by Ingredient</h3>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Quantity Used</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {usageReport.map(item => (
                  <tr>
                    <td>
                      <strong>{escapeHtml(item.ingredient_name)}</strong>
                      <div class="text-muted text-sm">{item.unit}</div>
                    </td>
                    <td>{item.total_used.toFixed(2)} {item.unit}</td>
                    <td>${item.cost.toFixed(2)}</td>
                  </tr>
                ))}
                {usageReport.length === 0 && (
                  <tr>
                    <td colspan="3" class="text-center text-muted" style="padding: 40px;">
                      No usage data for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Usage */}
        <div class="card">
          <div class="card-header">
            <h3>Daily Usage</h3>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items Used</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {dailyUsage.map(day => (
                  <tr>
                    <td>{new Date(day.date).toLocaleDateString()}</td>
                    <td>{day.total_items}</td>
                    <td>${(day.total_cost || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {dailyUsage.length === 0 && (
                  <tr>
                    <td colspan="3" class="text-center text-muted" style="padding: 40px;">
                      No daily data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .filter-form {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .filter-form .form-group {
          margin-bottom: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          font-size: 32px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }
        .stat-label {
          color: var(--text-muted);
          font-size: 14px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .table-container {
          max-height: 400px;
          overflow-y: auto;
        }
        .text-sm {
          font-size: 12px;
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function applyFilters(e) {
          e.preventDefault();
          const url = new URL(window.location);
          const branch = document.getElementById('branch-filter').value;
          const start = document.getElementById('start-date').value;
          const end = document.getElementById('end-date').value;

          if (branch) url.searchParams.set('branch', branch);
          else url.searchParams.delete('branch');

          if (start) url.searchParams.set('start', start);
          if (end) url.searchParams.set('end', end);

          window.location = url;
        }
      `}} />
    </AdminLayout>
  );
};

// Menu Item Ingredients Page
interface AdminMenuIngredientsPageProps {
  menuItem: MenuItem;
  ingredients: Ingredient[];
  currentIngredients: { ingredient_id: number; ingredient_name: string; quantity: number; unit: string }[];
}

export const AdminMenuIngredientsPage: FC<AdminMenuIngredientsPageProps> = ({
  menuItem,
  ingredients,
  currentIngredients
}) => {
  return (
    <AdminLayout title={`Ingredients: ${menuItem.name}`} currentPath="/admin/menu">
      <div class="page-header">
        <div>
          <h1>Manage Ingredients: {escapeHtml(menuItem.name)}</h1>
          <p class="text-muted">Define what ingredients are used in this menu item</p>
        </div>
        <a href="/admin/menu" class="btn btn-ghost">Back to Menu</a>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Recipe Ingredients</h3>
        </div>
        <div class="card-body">
          <form id="ingredients-form" onsubmit="saveIngredients(event)">
            <div id="ingredients-list">
              {currentIngredients.map((ing, index) => (
                <div class="ingredient-row" data-index={index}>
                  <select class="form-select ingredient-select" value={ing.ingredient_id}>
                    <option value="">Select ingredient</option>
                    {ingredients.map(i => (
                      <option value={i.id} selected={i.id === ing.ingredient_id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    class="form-input quantity-input"
                    value={ing.quantity}
                    placeholder="Quantity"
                    step="0.01"
                    min="0"
                  />
                  <button type="button" class="btn btn-ghost btn-sm text-error" onclick="removeIngredientRow(this)">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" class="btn btn-ghost" onclick="addIngredientRow()" style="margin-top: 12px;">
              + Add Ingredient
            </button>
            <div class="form-actions" style="margin-top: 24px;">
              <button type="submit" class="btn btn-primary">Save Recipe</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .ingredient-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: center;
        }
        .ingredient-select {
          flex: 2;
        }
        .quantity-input {
          flex: 1;
          max-width: 150px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const menuItemId = ${menuItem.id};
        const ingredientOptions = ${JSON.stringify(ingredients)};

        function addIngredientRow() {
          const list = document.getElementById('ingredients-list');
          const index = list.children.length;
          const row = document.createElement('div');
          row.className = 'ingredient-row';
          row.dataset.index = index;
          row.innerHTML = \`
            <select class="form-select ingredient-select">
              <option value="">Select ingredient</option>
              \${ingredientOptions.map(i => \`<option value="\${i.id}">\${i.name} (\${i.unit})</option>\`).join('')}
            </select>
            <input type="number" class="form-input quantity-input" placeholder="Quantity" step="0.01" min="0" />
            <button type="button" class="btn btn-ghost btn-sm text-error" onclick="removeIngredientRow(this)">Remove</button>
          \`;
          list.appendChild(row);
        }

        function removeIngredientRow(btn) {
          btn.closest('.ingredient-row').remove();
        }

        async function saveIngredients(e) {
          e.preventDefault();
          const rows = document.querySelectorAll('.ingredient-row');
          const ingredients = [];

          rows.forEach(row => {
            const ingredientId = row.querySelector('.ingredient-select').value;
            const quantity = row.querySelector('.quantity-input').value;
            if (ingredientId && quantity) {
              ingredients.push({
                ingredient_id: parseInt(ingredientId),
                quantity: parseFloat(quantity)
              });
            }
          });

          try {
            const res = await fetch('/api/menu/' + menuItemId + '/ingredients', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ingredients })
            });

            if (res.ok) {
              alert('Recipe saved successfully!');
              location.reload();
            } else {
              alert('Failed to save recipe');
            }
          } catch (err) {
            alert('Error saving recipe');
          }
        }
      `}} />
    </AdminLayout>
  );
};
