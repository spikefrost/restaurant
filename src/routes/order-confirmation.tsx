import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { Order, OrderItem, Branch } from '../types';
import { escapeHtml, formatCurrency, formatDateTime, getStatusColor } from '../utils/helpers';

interface OrderConfirmationProps {
  order: Order;
  items: OrderItem[];
  branch: Branch | null;
}

export const OrderConfirmationPage: FC<OrderConfirmationProps> = ({ order, items, branch }) => {
  const statusSteps = [
    { key: 'pending', label: 'Received', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '🔔' },
    { key: 'completed', label: 'Served', icon: '🍽️' }
  ];

  const currentIndex = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';

  return (
    <Layout title={`Order ${order.order_number}`}>
      <Header />

      <div class="container" style="padding: 40px 20px; max-width: 800px;">
        {/* Success Banner */}
        <div class="text-center" style="margin-bottom: 40px;">
          <div style="font-size: 64px; margin-bottom: 16px;">
            {isCancelled ? '❌' : isCompleted ? '🎉' : '✅'}
          </div>
          <h1 style="font-size: 32px; margin-bottom: 8px;">
            {isCancelled ? 'Order Cancelled' : isCompleted ? 'Order Complete!' : 'Order Placed!'}
          </h1>
          <p class="text-muted">
            {isCancelled ? 'This order has been cancelled.' : isCompleted ? 'Thank you for dining with us!' : "Thank you for your order. We're preparing it now."}
          </p>
        </div>

        {/* Order Number Card */}
        <div class="card" style={`padding: 30px; text-align: center; margin-bottom: 24px; background: ${isCancelled ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))'}; color: white;`}>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Order Number</div>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 2px;">{order.order_number}</div>
          {order.table_number && (
            <div style="margin-top: 12px; font-size: 18px;">
              🪑 Table {escapeHtml(order.table_number)}
            </div>
          )}
        </div>

        {/* Notification Banner */}
        {!isCancelled && !isCompleted && (
          <div class="card" style="padding: 16px 24px; margin-bottom: 24px; background: var(--bg-alt); display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 32px;">📱</div>
            <div>
              <div style="font-weight: 600;">Stay Updated</div>
              <div class="text-muted" style="font-size: 14px;">This page auto-refreshes every 30 seconds. Keep it open to track your order!</div>
            </div>
          </div>
        )}

        {/* Order Progress */}
        {!isCancelled && (
          <div class="card" style="padding: 30px; margin-bottom: 24px;">
            <h3 style="margin-bottom: 24px;">Order Status</h3>
            <div class="order-progress">
              {statusSteps.map((step, index) => (
                <div class={`progress-step ${index < currentIndex ? 'completed' : index === currentIndex ? 'active' : ''}`}>
                  <div class="progress-step-icon">{step.icon}</div>
                  <div class="progress-step-label">{step.label}</div>
                </div>
              ))}
            </div>
            {!isCompleted && (
              <p class="text-center text-muted" style="margin-top: 20px;">
                Estimated time: <strong>15-20 minutes</strong>
              </p>
            )}
          </div>
        )}

        {/* Order Details */}
        <div class="card" style="padding: 24px; margin-bottom: 24px;">
          <h3 style="margin-bottom: 16px;">Order Details</h3>

          <div class="flex justify-between mb-2">
            <span class="text-muted">Order Type</span>
            <span style="text-transform: capitalize;">{order.order_type.replace('_', ' ')}</span>
          </div>

          {branch && (
            <div class="flex justify-between mb-2">
              <span class="text-muted">Location</span>
              <span>{escapeHtml(branch.name)}</span>
            </div>
          )}

          <div class="flex justify-between mb-2">
            <span class="text-muted">Date</span>
            <span>{formatDateTime(order.created_at)}</span>
          </div>

          <div class="flex justify-between mb-2">
            <span class="text-muted">Payment</span>
            <span style="text-transform: capitalize;">
              {order.payment_method === 'card' ? '💳 Card' : '💵 Cash'} -
              <span class={order.payment_status === 'paid' ? 'text-success' : 'text-warning'} style="margin-left: 4px;">
                {order.payment_status}
              </span>
            </span>
          </div>
        </div>

        {/* Items */}
        <div class="card" style="padding: 24px; margin-bottom: 24px;" id="receipt-content">
          <div class="flex justify-between items-center" style="margin-bottom: 16px;">
            <h3>Items Ordered</h3>
            <button onclick="printReceipt()" class="btn btn-ghost btn-sm">🖨️ Print Receipt</button>
          </div>

          {items.map(item => (
            <div class="flex justify-between" style="padding: 12px 0; border-bottom: 1px solid var(--border);">
              <div>
                <span style="font-weight: 500;">{item.quantity}x {escapeHtml(item.item_name)}</span>
                {item.modifiers && (
                  <div class="text-muted" style="font-size: 13px;">{escapeHtml(item.modifiers)}</div>
                )}
                {item.special_instructions && (
                  <div class="text-muted" style="font-size: 13px;">Note: {escapeHtml(item.special_instructions)}</div>
                )}
              </div>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}

          <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid var(--border);">
            <div class="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div class="flex justify-between mb-1">
              <span>Tax (5%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div class="flex justify-between mb-1 text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            {order.points_redeemed > 0 && (
              <div class="flex justify-between mb-1 text-success">
                <span>Points Redeemed ({order.points_redeemed} pts)</span>
                <span>-{formatCurrency(order.points_redeemed / 100)}</span>
              </div>
            )}
            <div class="flex justify-between" style="font-size: 20px; font-weight: 700; margin-top: 12px;">
              <span>Total</span>
              <span class="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.points_earned > 0 && (
            <div style="margin-top: 16px; padding: 12px 16px; background: var(--bg-alt); border-radius: var(--radius); display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">🎉</span>
              <span>You earned <strong style="color: var(--primary);">{order.points_earned} points</strong> with this order!</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div class="flex gap-2 justify-center flex-wrap">
          <a href="/menu" class="btn btn-primary">Order More</a>
          <a href="/orders" class="btn btn-secondary">View Order History</a>
          <a href="/" class="btn btn-ghost">Back to Home</a>
        </div>

        {/* Auto-refresh notice */}
        {!isCompleted && !isCancelled && (
          <p class="text-center text-muted" style="margin-top: 24px; font-size: 13px;">
            🔄 This page refreshes automatically every 30 seconds.
          </p>
        )}
      </div>

      <Footer />

      {/* Print Receipt Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-receipt, #print-receipt * { visibility: visible; }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10mm;
            font-size: 12px;
          }
        }
      `}</style>

      {/* Hidden Print Receipt Template */}
      <div id="print-receipt" style="display: none;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">🍽️ Restaurant</h2>
          {branch && <p style="margin: 5px 0;">{escapeHtml(branch.name)}</p>}
          {branch && <p style="margin: 5px 0; font-size: 11px;">{escapeHtml(branch.address)}</p>}
        </div>
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0;">
          <div style="text-align: center;">
            <strong style="font-size: 16px;">Order #{order.order_number}</strong>
            <div>{formatDateTime(order.created_at)}</div>
            {order.table_number && <div>Table: {order.table_number}</div>}
          </div>
        </div>
        <div style="margin: 15px 0;">
          {items.map(item => (
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>{item.quantity}x {item.item_name}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
          {order.discount > 0 && <div style="display: flex; justify-content: space-between;"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 5px;">
            <span>TOTAL</span><span>{formatCurrency(order.total)}</span>
          </div>
          <div style="margin-top: 5px;"><span>Payment: {order.payment_method === 'card' ? 'Card' : 'Cash'} ({order.payment_status})</span></div>
        </div>
        <div style="text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;">
          <p style="margin: 5px 0;">Thank you for your order!</p>
          {order.points_earned > 0 && <p style="margin: 5px 0;">Points earned: {order.points_earned}</p>}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        // Print receipt
        function printReceipt() {
          const printContent = document.getElementById('print-receipt').innerHTML;
          const printWindow = window.open('', '_blank', 'width=300,height=600');
          printWindow.document.write('<html><head><title>Receipt</title>');
          printWindow.document.write('<style>body { font-family: monospace; margin: 0; padding: 10px; } @page { size: 80mm auto; margin: 0; }</style>');
          printWindow.document.write('</head><body>');
          printWindow.document.write(printContent);
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
          };
        }

        ${!isCompleted && !isCancelled ? `
        // Auto-refresh every 30 seconds for status updates
        setTimeout(() => location.reload(), 30000);
        ` : ''}
      `}} />
    </Layout>
  );
};

export const OrderNotFoundPage: FC = () => {
  return (
    <Layout title="Order Not Found">
      <Header />
      <div class="container" style="padding: 80px 20px;">
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">Order Not Found</h3>
          <p class="empty-state-text">We couldn't find this order. Please check the order number and try again.</p>
          <a href="/" class="btn btn-primary">Back to Home</a>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};
