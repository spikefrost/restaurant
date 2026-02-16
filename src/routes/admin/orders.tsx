import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import type { OrderWithDetails } from '../../types';
import { formatCurrency, formatDateTime, formatTimeAgo, getStatusColor, escapeHtml } from '../../utils/helpers';

interface OrdersPageProps {
  orders: OrderWithDetails[];
  filter?: string;
}

export const AdminOrdersPage: FC<OrdersPageProps> = ({ orders, filter }) => {
  const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <AdminLayout title="Orders" currentPath="/admin/orders">
      <div class="admin-header">
        <h1 class="admin-title">Orders</h1>
        <div class="flex gap-2">
          <a href="/admin/orders?filter=active" class={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}>
            Active Orders
          </a>
        </div>
      </div>

      {/* Status Filters */}
      <div class="category-nav" style="margin-bottom: 24px;">
        {statusFilters.map(status => (
          <a
            href={`/admin/orders${status !== 'all' ? `?filter=${status}` : ''}`}
            class={`category-btn ${filter === status || (!filter && status === 'all') ? 'active' : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </a>
        ))}
      </div>

      {orders.length > 0 ? (
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr>
                  <td>
                    <a href={`/admin/orders/${order.id}`} style="font-weight: 600;">
                      {order.order_number}
                    </a>
                  </td>
                  <td>
                    <div>{escapeHtml(order.customer_name)}</div>
                    {order.table_number && (
                      <div class="text-muted" style="font-size: 12px;">Table {order.table_number}</div>
                    )}
                  </td>
                  <td style="text-transform: capitalize;">{order.order_type.replace('_', ' ')}</td>
                  <td>{order.item_count} items</td>
                  <td style="font-weight: 600;">{formatCurrency(order.total)}</td>
                  <td>
                    <span class={`status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div>{formatTimeAgo(order.created_at)}</div>
                    <div class="text-muted" style="font-size: 11px;">{formatDateTime(order.created_at)}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a href={`/admin/orders/${order.id}`} class="btn btn-ghost btn-sm">View</a>
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <select
                          onchange={`updateOrderStatus(${order.id}, this.value)`}
                          class="form-select"
                          style="padding: 6px 10px; font-size: 12px; width: auto;"
                        >
                          <option value="">Update Status</option>
                          <option value="confirmed">Confirm</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">No Orders Found</h3>
          <p class="empty-state-text">
            {filter ? `No orders with status "${filter}"` : 'Orders will appear here when customers place them.'}
          </p>
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        async function updateOrderStatus(orderId, status) {
          if (!status) return;
          if (!confirm('Update order status to ' + status + '?')) return;

          try {
            const res = await fetch('/api/orders/' + orderId + '/status', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });

            if (res.ok) {
              location.reload();
            } else {
              alert('Failed to update status');
            }
          } catch (err) {
            alert('Failed to update status');
          }
        }
      `}} />
    </AdminLayout>
  );
};
