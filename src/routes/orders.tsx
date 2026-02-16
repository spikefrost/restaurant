import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { Order, Customer, ReservationWithDetails } from '../types';
import { escapeHtml, formatCurrency, formatDate, formatDateTime, getStatusColor } from '../utils/helpers';

interface OrderHistoryPageProps {
  orders?: Order[];
  reservations?: ReservationWithDetails[];
  customer?: Customer | null;
  phone?: string;
  error?: string;
}

function getReservationStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'success';
    case 'cancelled': return 'error';
    case 'completed': return 'info';
    case 'no_show': return 'error';
    default: return 'default';
  }
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const OrderHistoryPage: FC<OrderHistoryPageProps> = ({ orders, reservations, customer, phone, error }) => {
  return (
    <Layout title="Order History">
      <Header currentPath="/orders" />

      <div class="container" style="padding: 40px 20px; max-width: 800px;">
        <h1 class="section-title">Order History</h1>
        <p class="text-muted text-center" style="margin-bottom: 32px;">
          Enter your phone number to view your past orders and loyalty points.
        </p>

        {/* Phone Lookup Form */}
        <div class="card" style="padding: 24px; margin-bottom: 24px;">
          <form action="/orders" method="GET" class="flex gap-2">
            <div class="form-group" style="flex: 1; margin: 0;">
              <input
                type="tel"
                name="phone"
                class="form-input"
                placeholder="Enter your phone number"
                value={phone || ''}
                required
                style="font-size: 16px;"
              />
            </div>
            <button type="submit" class="btn btn-primary">Look Up</button>
          </form>
          {error && (
            <div style="margin-top: 12px; color: var(--error); font-size: 14px;">
              {error}
            </div>
          )}
        </div>

        {/* Customer Info Card */}
        {customer && (
          <div class="card" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white;">
            <div class="flex justify-between items-start">
              <div>
                <div style="font-size: 14px; opacity: 0.9;">Welcome back,</div>
                <div style="font-size: 24px; font-weight: 700;">{escapeHtml(customer.name)}</div>
                <div style="margin-top: 4px; opacity: 0.9;">{escapeHtml(customer.phone)}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; opacity: 0.9;">Loyalty Points</div>
                <div style="font-size: 32px; font-weight: 700;">{customer.points_balance}</div>
                <div style="font-size: 12px; opacity: 0.8; text-transform: uppercase;">{customer.tier} Member</div>
              </div>
            </div>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; gap: 24px;">
              <div>
                <div style="font-size: 20px; font-weight: 700;">{customer.total_orders}</div>
                <div style="font-size: 13px; opacity: 0.9;">Total Orders</div>
              </div>
              <div>
                <div style="font-size: 20px; font-weight: 700;">{formatCurrency(customer.total_spent)}</div>
                <div style="font-size: 13px; opacity: 0.9;">Total Spent</div>
              </div>
              <div>
                <div style="font-size: 20px; font-weight: 700;">{formatCurrency(customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0)}</div>
                <div style="font-size: 13px; opacity: 0.9;">Avg. Order</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders && orders.length > 0 ? (
          <div>
            <h3 style="margin-bottom: 16px;">Your Orders ({orders.length})</h3>
            {orders.map(order => (
              <a href={`/order/${order.order_number}`} class="card" style="padding: 20px; margin-bottom: 12px; display: block; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;">
                <div class="flex justify-between items-start">
                  <div>
                    <div style="font-weight: 700; font-size: 18px; margin-bottom: 4px;">
                      {order.order_number}
                    </div>
                    <div class="text-muted" style="font-size: 14px;">
                      {formatDateTime(order.created_at)}
                    </div>
                    <div style="margin-top: 8px;">
                      <span class={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span class="badge" style="margin-left: 8px; background: var(--bg-alt);">
                        {order.order_type === 'dine_in' ? '🍽️ Dine In' : '🥡 Takeaway'}
                      </span>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                      {formatCurrency(order.total)}
                    </div>
                    {order.points_earned > 0 && (
                      <div style="font-size: 13px; color: var(--success); margin-top: 4px;">
                        +{order.points_earned} pts earned
                      </div>
                    )}
                    <div style="margin-top: 8px; color: var(--primary); font-size: 14px;">
                      View Details →
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : orders && orders.length === 0 ? (
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3 class="empty-state-title">No Orders Yet</h3>
            <p class="empty-state-text">You haven't placed any orders yet. Start ordering to see your history here!</p>
            <a href="/menu" class="btn btn-primary">Browse Menu</a>
          </div>
        ) : !phone ? (
          <div class="empty-state">
            <div class="empty-state-icon">📱</div>
            <h3 class="empty-state-title">Enter Your Phone Number</h3>
            <p class="empty-state-text">Enter the phone number you used when placing orders to view your order history and loyalty points.</p>
          </div>
        ) : null}

        {/* Reservations Section */}
        {reservations && reservations.length > 0 && (
          <div style="margin-top: 32px;">
            <h3 style="margin-bottom: 16px;">Your Reservations ({reservations.length})</h3>
            {reservations.map(res => (
              <div class="card" style="padding: 20px; margin-bottom: 12px;">
                <div class="flex justify-between items-start">
                  <div>
                    <div style="font-weight: 700; font-size: 18px; margin-bottom: 4px;">
                      {escapeHtml(res.branch_name)}
                    </div>
                    <div class="text-muted" style="font-size: 14px;">
                      {formatDate(res.reservation_date)} at {formatTime(res.reservation_time)}
                    </div>
                    <div style="margin-top: 8px;">
                      <span class={`badge ${getReservationStatusColor(res.status)}`}>
                        {res.status === 'no_show' ? 'No Show' : res.status}
                      </span>
                      <span class="badge" style="margin-left: 8px; background: var(--bg-alt);">
                        👥 {res.party_size} {res.party_size === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    {res.notes && (
                      <div class="text-muted" style="font-size: 13px; margin-top: 8px;">
                        Note: {escapeHtml(res.notes)}
                      </div>
                    )}
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 14px; color: var(--text-muted);">
                      Booking #{res.id}
                    </div>
                    {res.status === 'confirmed' && (
                      <div style="font-size: 13px; color: var(--success); margin-top: 4px;">
                        See you there!
                      </div>
                    )}
                    {res.status === 'pending' && (
                      <div style="font-size: 13px; color: var(--warning); margin-top: 4px;">
                        Awaiting confirmation
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loyalty Info */}
        {!phone && (
          <div class="card" style="padding: 24px; margin-top: 32px;">
            <h3 style="margin-bottom: 16px;">Loyalty Program</h3>
            <div class="grid grid-2" style="gap: 16px;">
              <div style="padding: 16px; background: var(--bg-alt); border-radius: var(--radius);">
                <div style="font-size: 24px; margin-bottom: 8px;">🎁</div>
                <div style="font-weight: 600; margin-bottom: 4px;">Earn Points</div>
                <div class="text-muted" style="font-size: 14px;">Earn 1 point for every $ 1 spent on orders.</div>
              </div>
              <div style="padding: 16px; background: var(--bg-alt); border-radius: var(--radius);">
                <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                <div style="font-weight: 600; margin-bottom: 4px;">Redeem Rewards</div>
                <div class="text-muted" style="font-size: 14px;">Use 100 points for $ 1 off your next order.</div>
              </div>
              <div style="padding: 16px; background: var(--bg-alt); border-radius: var(--radius);">
                <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                <div style="font-weight: 600; margin-bottom: 4px;">Tier Benefits</div>
                <div class="text-muted" style="font-size: 14px;">Progress through Bronze, Silver, Gold & Platinum tiers.</div>
              </div>
              <div style="padding: 16px; background: var(--bg-alt); border-radius: var(--radius);">
                <div style="font-size: 24px; margin-bottom: 8px;">🎂</div>
                <div style="font-weight: 600; margin-bottom: 4px;">Birthday Rewards</div>
                <div class="text-muted" style="font-size: 14px;">Special offers on your birthday!</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>

      {customer && (
        <script dangerouslySetInnerHTML={{ __html: `
          // Save user session when customer is found
          const customerData = ${JSON.stringify({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            points_balance: customer.points_balance,
            tier: customer.tier
          })};
          localStorage.setItem('userSession', JSON.stringify(customerData));

          // Update header to show logged in state
          if (typeof updateUserMenu === 'function') {
            updateUserMenu();
          }
        `}} />
      )}
    </Layout>
  );
};
