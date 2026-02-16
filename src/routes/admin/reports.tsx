import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../components/Layout';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface ReportData {
  dailySales: { date: string; revenue: number; orders: number; avg: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  paymentMethods: { method: string; count: number; amount: number }[];
  orderTypes: { type: string; count: number; amount: number }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
  };
  period: string;
  startDate: string;
  endDate: string;
}

interface ReportsPageProps {
  data: ReportData;
}

export const AdminReportsPage: FC<ReportsPageProps> = ({ data }) => {
  return (
    <AdminLayout title="Reports" currentPath="/admin/reports">
      <div class="admin-header">
        <h1 class="admin-title">Reports & Analytics</h1>
        <div class="flex gap-2">
          <button onclick="exportCSV()" class="btn btn-secondary">📥 Export CSV</button>
          <button onclick="window.print()" class="btn btn-ghost">🖨️ Print</button>
        </div>
      </div>

      {/* Period Selector */}
      <div class="card" style="padding: 16px; margin-bottom: 24px;">
        <form id="period-form" class="flex gap-3 items-end flex-wrap">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Period</label>
            <select name="period" class="form-select" onchange="updatePeriod(this.value)">
              <option value="today" selected={data.period === 'today'}>Today</option>
              <option value="yesterday" selected={data.period === 'yesterday'}>Yesterday</option>
              <option value="week" selected={data.period === 'week'}>This Week</option>
              <option value="month" selected={data.period === 'month'}>This Month</option>
              <option value="custom" selected={data.period === 'custom'}>Custom Range</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;" id="custom-dates">
            <label class="form-label">From</label>
            <input type="date" name="start_date" class="form-input" value={data.startDate} />
          </div>
          <div class="form-group" style="margin: 0;" id="custom-dates-end">
            <label class="form-label">To</label>
            <input type="date" name="end_date" class="form-input" value={data.endDate} />
          </div>
          <button type="submit" class="btn btn-primary">Apply</button>
        </form>
      </div>

      {/* Summary Cards */}
      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value" style="color: var(--primary);">{formatCurrency(data.summary.totalRevenue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">{data.summary.totalOrders}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Order</div>
          <div class="stat-value">{formatCurrency(data.summary.avgOrderValue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Unique Customers</div>
          <div class="stat-value">{data.summary.totalCustomers}</div>
        </div>
      </div>

      <div class="grid grid-2" style="gap: 24px; margin-bottom: 24px;">
        {/* Daily Sales Table */}
        <div class="card" style="padding: 24px;">
          <h3 style="margin-bottom: 16px;">Daily Sales</h3>
          {data.dailySales.length > 0 ? (
            <div class="table-container">
              <table class="table" id="daily-sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style="text-align: right;">Orders</th>
                    <th style="text-align: right;">Revenue</th>
                    <th style="text-align: right;">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailySales.map(day => (
                    <tr>
                      <td>{formatDate(day.date)}</td>
                      <td style="text-align: right;">{day.orders}</td>
                      <td style="text-align: right; font-weight: 600;">{formatCurrency(day.revenue)}</td>
                      <td style="text-align: right;">{formatCurrency(day.avg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="text-muted" style="text-align: center; padding: 40px;">No sales data for this period</div>
          )}
        </div>

        {/* Top Selling Items */}
        <div class="card" style="padding: 24px;">
          <h3 style="margin-bottom: 16px;">Top Selling Items</h3>
          {data.topItems.length > 0 ? (
            <div class="table-container">
              <table class="table" id="top-items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th style="text-align: right;">Qty Sold</th>
                    <th style="text-align: right;">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topItems.map((item, i) => (
                    <tr>
                      <td style="width: 40px;">
                        <span style="width: 24px; height: 24px; background: var(--bg-alt); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">
                          {i + 1}
                        </span>
                      </td>
                      <td style="font-weight: 500;">{item.name}</td>
                      <td style="text-align: right;">{item.quantity}</td>
                      <td style="text-align: right; font-weight: 600;">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="text-muted" style="text-align: center; padding: 40px;">No items sold in this period</div>
          )}
        </div>
      </div>

      <div class="grid grid-2" style="gap: 24px;">
        {/* Payment Methods */}
        <div class="card" style="padding: 24px;">
          <h3 style="margin-bottom: 16px;">Payment Methods</h3>
          {data.paymentMethods.length > 0 ? (
            <div>
              {data.paymentMethods.map(pm => {
                const percent = data.summary.totalOrders > 0 ? (pm.count / data.summary.totalOrders * 100) : 0;
                return (
                  <div style="margin-bottom: 16px;">
                    <div class="flex justify-between mb-1">
                      <span style="font-weight: 500; text-transform: capitalize;">
                        {pm.method === 'card' ? '💳 Card' : '💵 Cash'}
                      </span>
                      <span>{pm.count} orders ({percent.toFixed(0)}%)</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-alt); border-radius: 4px; overflow: hidden;">
                      <div style={`width: ${percent}%; height: 100%; background: var(--primary); border-radius: 4px;`}></div>
                    </div>
                    <div class="text-muted" style="font-size: 13px; margin-top: 4px;">
                      {formatCurrency(pm.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="text-muted" style="text-align: center; padding: 40px;">No payment data</div>
          )}
        </div>

        {/* Order Types */}
        <div class="card" style="padding: 24px;">
          <h3 style="margin-bottom: 16px;">Order Types</h3>
          {data.orderTypes.length > 0 ? (
            <div>
              {data.orderTypes.map(ot => {
                const percent = data.summary.totalOrders > 0 ? (ot.count / data.summary.totalOrders * 100) : 0;
                return (
                  <div style="margin-bottom: 16px;">
                    <div class="flex justify-between mb-1">
                      <span style="font-weight: 500;">
                        {ot.type === 'dine_in' ? '🍽️ Dine In' : '🥡 Takeaway'}
                      </span>
                      <span>{ot.count} orders ({percent.toFixed(0)}%)</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-alt); border-radius: 4px; overflow: hidden;">
                      <div style={`width: ${percent}%; height: 100%; background: var(--secondary); border-radius: 4px;`}></div>
                    </div>
                    <div class="text-muted" style="font-size: 13px; margin-top: 4px;">
                      {formatCurrency(ot.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="text-muted" style="text-align: center; padding: 40px;">No order data</div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .admin-sidebar, .admin-header .btn, form, .btn { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .card { break-inside: avoid; }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        // Toggle custom date inputs
        function updatePeriod(value) {
          const customDates = document.getElementById('custom-dates');
          const customDatesEnd = document.getElementById('custom-dates-end');
          const show = value === 'custom';
          customDates.style.display = show ? 'block' : 'none';
          customDatesEnd.style.display = show ? 'block' : 'none';
        }

        // Initialize
        updatePeriod('${data.period}');

        // Form submission
        document.getElementById('period-form').addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(this);
          const params = new URLSearchParams();

          params.set('period', formData.get('period'));
          if (formData.get('period') === 'custom') {
            params.set('start', formData.get('start_date'));
            params.set('end', formData.get('end_date'));
          }

          window.location.href = '/admin/reports?' + params.toString();
        });

        // Export to CSV
        function exportCSV() {
          const dailySales = ${JSON.stringify(data.dailySales)};
          const topItems = ${JSON.stringify(data.topItems)};

          let csv = 'Daily Sales Report\\n';
          csv += 'Date,Orders,Revenue,Average\\n';
          dailySales.forEach(d => {
            csv += d.date + ',' + d.orders + ',' + d.revenue.toFixed(2) + ',' + d.avg.toFixed(2) + '\\n';
          });

          csv += '\\nTop Selling Items\\n';
          csv += 'Item,Quantity,Revenue\\n';
          topItems.forEach(item => {
            csv += '"' + item.name + '",' + item.quantity + ',' + item.revenue.toFixed(2) + '\\n';
          });

          csv += '\\nSummary\\n';
          csv += 'Total Revenue,' + ${data.summary.totalRevenue.toFixed(2)} + '\\n';
          csv += 'Total Orders,' + ${data.summary.totalOrders} + '\\n';
          csv += 'Average Order,' + ${data.summary.avgOrderValue.toFixed(2)} + '\\n';
          csv += 'Unique Customers,' + ${data.summary.totalCustomers} + '\\n';

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sales-report-${data.startDate}-to-${data.endDate}.csv';
          a.click();
        }
      `}} />
    </AdminLayout>
  );
};
