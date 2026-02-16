import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { OrderWithDetails, MenuItem } from '../../types';
import { formatCurrency, formatTimeAgo, getStatusColor, escapeHtml } from '../../utils/helpers';

interface TodayStats {
  revenue: number;
  orders: number;
  avg: number;
}

interface PrepTimeStats {
  avg: number;
  min: number;
  max: number;
  total: number;
}

interface LowStockItem {
  ingredient_name: string;
  current_quantity: number;
  min_stock_level: number;
  unit: string;
}

interface DashboardPageProps {
  todayStats: TodayStats;
  recentOrders: OrderWithDetails[];
  topItems: MenuItem[];
  totalCustomers: number;
  totalBranches: number;
  prepTimeStats?: PrepTimeStats;
  lowStockItems?: LowStockItem[];
}

export const AdminDashboardPage: FC<DashboardPageProps> = ({
  todayStats,
  recentOrders,
  topItems,
  totalCustomers,
  totalBranches,
  prepTimeStats,
  lowStockItems
}) => {
  const formatPrepTime = (seconds: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <AdminLayout title="Dashboard" currentPath="/admin">
      <div class="admin-header">
        <h1 class="admin-title">Dashboard</h1>
        <div class="flex gap-2">
          <a href="/admin/orders" class="btn btn-primary">View All Orders</a>
        </div>
      </div>

      {/* Stats Cards */}
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Today's Revenue</div>
          <div class="stat-value">{formatCurrency(todayStats.revenue)}</div>
          <div class="stat-change">From {todayStats.orders} orders</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Orders Today</div>
          <div class="stat-value">{todayStats.orders}</div>
          <div class="stat-change">Total orders received</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Avg. Order Value</div>
          <div class="stat-value">{formatCurrency(todayStats.avg)}</div>
          <div class="stat-change">Per order</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Total Customers</div>
          <div class="stat-value">{totalCustomers}</div>
          <div class="stat-change">Across {totalBranches} branches</div>
        </div>

        {prepTimeStats && prepTimeStats.total > 0 && (
          <div class="stat-card">
            <div class="stat-label">Avg. Prep Time</div>
            <div class="stat-value">{formatPrepTime(prepTimeStats.avg)}</div>
            <div class="stat-change">{prepTimeStats.total} orders completed today</div>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div class="alert alert-warning" style="margin-bottom: 24px; display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--warning); border-radius: 8px;">
          <span style="font-size: 24px;">⚠️</span>
          <div style="flex: 1;">
            <strong style="color: var(--warning);">Low Stock Alert</strong>
            <p style="margin: 4px 0 0; color: var(--text-muted); font-size: 14px;">
              {lowStockItems.length} ingredient(s) running low: {lowStockItems.slice(0, 3).map(i => i.ingredient_name).join(', ')}
              {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
            </p>
          </div>
          <a href="/admin/stock" class="btn btn-warning btn-sm" style="background: var(--warning); color: #000;">View Stock</a>
        </div>
      )}

      <div class="grid grid-2" style="gap: 24px;">
        {/* Recent Orders */}
        <div class="card" style="padding: 24px;">
          <div class="flex justify-between items-center mb-3">
            <h3 style="font-size: 18px; font-weight: 600;">Recent Orders</h3>
            <a href="/admin/orders" class="btn btn-ghost btn-sm">View All</a>
          </div>

          {recentOrders.length > 0 ? (
            <div>
              {recentOrders.slice(0, 5).map(order => (
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
                  <div>
                    <div style="font-weight: 500;">{order.order_number}</div>
                    <div class="text-muted" style="font-size: 13px;">
                      {order.table_number ? `Table ${order.table_number}` : escapeHtml(order.customer_name)} · {formatTimeAgo(order.created_at)}
                    </div>
                  </div>
                  <div class="text-right">
                    <div style="font-weight: 600;">{formatCurrency(order.total)}</div>
                    <span class={`status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="text-center text-muted" style="padding: 40px;">
              No orders yet
            </div>
          )}
        </div>

        {/* Popular Items */}
        <div class="card" style="padding: 24px;">
          <div class="flex justify-between items-center mb-3">
            <h3 style="font-size: 18px; font-weight: 600;">Popular Items</h3>
            <a href="/admin/menu" class="btn btn-ghost btn-sm">View Menu</a>
          </div>

          {topItems.length > 0 ? (
            <div>
              {topItems.slice(0, 5).map((item, index) => (
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
                  <div class="flex items-center gap-3">
                    <span style="width: 28px; height: 28px; background: var(--bg-alt); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;">
                      {index + 1}
                    </span>
                    <span style="font-weight: 500;">{escapeHtml(item.name)}</span>
                  </div>
                  <span class="text-muted">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div class="text-center text-muted" style="padding: 40px;">
              No items yet
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div class="card" style="padding: 24px; margin-top: 24px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Quick Actions</h3>
        <div class="flex gap-2 flex-wrap">
          <a href="/admin/menu/new" class="btn btn-secondary">+ Add Menu Item</a>
          <a href="/admin/categories/new" class="btn btn-secondary">+ Add Category</a>
          <a href="/admin/branches/new" class="btn btn-secondary">+ Add Branch</a>
          <a href="/admin/qrcodes" class="btn btn-secondary">Generate QR Codes</a>
          <a href="/admin/promotions/new" class="btn btn-secondary">+ Create Promotion</a>
        </div>
      </div>
    </AdminLayout>
  );
};
