import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { MenuItem, Branch, Customer } from '../types';

interface CheckoutPageProps {
  menuItems: MenuItem[];
  branches: Branch[];
  selectedBranch?: Branch | null;
  tableNumber?: string | null;
  customer?: Customer | null;
}

export const CheckoutPage: FC<CheckoutPageProps> = ({ menuItems, branches, selectedBranch, tableNumber, customer }) => {
  const menuItemsJson = JSON.stringify(menuItems);
  const branchesJson = JSON.stringify(branches);
  const customerJson = customer ? JSON.stringify(customer) : 'null';

  return (
    <Layout title="Checkout">
      <Header currentPath="/checkout" />

      <div class="container" style="padding: 40px 20px; max-width: 1100px;">
        <h1 class="section-title">Checkout</h1>

        {/* Order Method Selection - Step 1 */}
        <div id="step-order-method" class="checkout-step">
          <h2 class="step-title">How would you like to get your order?</h2>

          <div class="order-method-grid">
            {/* Click & Collect */}
            <div class="order-method-card" onclick="window.selectOrderMethod('collect')">
              <div class="method-icon">🏃</div>
              <h3>Click & Collect</h3>
              <p>Order ahead and pick up at our restaurant. Skip the queue!</p>
              <ul class="method-benefits">
                <li>Ready in 15-20 mins</li>
                <li>No delivery fees</li>
                <li>Earn loyalty points</li>
              </ul>
              <button class="btn btn-primary" style="width: 100%;">Select</button>
            </div>

            {/* Delivery */}
            <div class="order-method-card" onclick="window.selectOrderMethod('delivery')">
              <div class="method-icon">🚴</div>
              <h3>Delivery</h3>
              <p>Get your food delivered to your door via our partner services.</p>
              <ul class="method-benefits">
                <li>Delivered to your door</li>
                <li>Real-time tracking</li>
                <li>Multiple payment options</li>
              </ul>
              <button class="btn btn-secondary" style="width: 100%;">Select</button>
            </div>
          </div>
        </div>

        {/* Delivery Partners Selection - Step 2 (shown if delivery selected) */}
        <div id="step-delivery-partners" class="checkout-step" style="display: none;">
          <button class="back-btn" onclick="window.goBackToMethod()">← Back to order method</button>
          <h2 class="step-title">Choose Your Delivery Partner</h2>
          <p class="step-subtitle">Select a delivery service to complete your order</p>

          <div class="delivery-partners-grid">
            {/* Uber Eats */}
            <a href="https://www.ubereats.com" target="_blank" rel="noopener" class="delivery-partner-card uber-eats">
              <div class="partner-logo-container">
                <span class="partner-logo-text uber-eats-text">Uber Eats</span>
              </div>
              <div class="partner-info">
                <span class="partner-name">Uber Eats</span>
                <span class="delivery-time">25-35 min</span>
              </div>
              <div class="partner-action">
                Order Now →
              </div>
            </a>

            {/* Deliveroo */}
            <a href="https://deliveroo.com" target="_blank" rel="noopener" class="delivery-partner-card deliveroo">
              <div class="partner-logo-container">
                <span class="partner-logo-text deliveroo-text">deliveroo</span>
              </div>
              <div class="partner-info">
                <span class="partner-name">Deliveroo</span>
                <span class="delivery-time">20-30 min</span>
              </div>
              <div class="partner-action">
                Order Now →
              </div>
            </a>

            {/* Just Eat */}
            <a href="https://www.just-eat.com" target="_blank" rel="noopener" class="delivery-partner-card just-eat">
              <div class="partner-logo-container">
                <span class="partner-logo-text just-eat-text">Just Eat</span>
              </div>
              <div class="partner-info">
                <span class="partner-name">Just Eat</span>
                <span class="delivery-time">30-40 min</span>
              </div>
              <div class="partner-action">
                Order Now →
              </div>
            </a>
          </div>

          <div class="delivery-info-box">
            <h4>How delivery works</h4>
            <ol>
              <li>Click on your preferred delivery partner above</li>
              <li>You'll be redirected to their app/website</li>
              <li>Your order will be automatically generated on the partner portal</li>
              <li>Complete payment through the delivery partner</li>
              <li>Track your order in real-time!</li>
            </ol>
          </div>
        </div>

        {/* Click & Collect Form - Step 2 (shown if collect selected) */}
        <div id="step-collect-form" class="checkout-step" style="display: none;">
          <button class="back-btn" onclick="window.goBackToMethod()">← Back to order method</button>

          <div class="grid" style="grid-template-columns: 1fr 380px; gap: 24px;">
            {/* Left Column - Form */}
            <div>
              <form id="checkout-form" onsubmit="return window.submitOrder(event)">
                {/* Pickup Location */}
                <div class="card" style="padding: 24px; margin-bottom: 20px;">
                  <h3 style="margin-bottom: 16px;">Pickup Location</h3>
                  <div class="form-group">
                    <label class="form-label">Select Restaurant</label>
                    <select name="branch_id" id="branch-select" class="form-select" required>
                      <option value="">Choose a pickup location</option>
                      {branches.map(b => (
                        <option value={b.id} selected={selectedBranch?.id === b.id}>{b.name} - {b.address}</option>
                      ))}
                    </select>
                  </div>
                  <div id="branch-details" class="branch-details" style="display: none;">
                    <div class="branch-detail-row">
                      <span class="detail-icon">📍</span>
                      <span id="branch-address"></span>
                    </div>
                    <div class="branch-detail-row">
                      <span class="detail-icon">🕐</span>
                      <span id="branch-hours"></span>
                    </div>
                    <div class="branch-detail-row">
                      <span class="detail-icon">📞</span>
                      <span id="branch-phone"></span>
                    </div>
                  </div>
                </div>

                {/* Pickup Time */}
                <div class="card" style="padding: 24px; margin-bottom: 20px;">
                  <h3 style="margin-bottom: 16px;">Pickup Time</h3>
                  <div class="pickup-time-options">
                    <label class="pickup-time-option selected">
                      <input type="radio" name="pickup_time" value="asap" checked style="display: none;" />
                      <span class="time-icon">⚡</span>
                      <span class="time-label">ASAP</span>
                      <span class="time-estimate">15-20 mins</span>
                    </label>
                    <label class="pickup-time-option">
                      <input type="radio" name="pickup_time" value="scheduled" style="display: none;" />
                      <span class="time-icon">📅</span>
                      <span class="time-label">Schedule</span>
                      <span class="time-estimate">Pick a time</span>
                    </label>
                  </div>
                  <div id="scheduled-time" style="display: none; margin-top: 16px;">
                    <div class="grid grid-2" style="gap: 12px;">
                      <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" name="scheduled_date" id="scheduled-date" class="form-input" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Time</label>
                        <select name="scheduled_time" id="scheduled-time-select" class="form-select">
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="18:30">6:30 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="19:30">7:30 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="20:30">8:30 PM</option>
                          <option value="21:00">9:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div class="card" style="padding: 24px; margin-bottom: 20px;">
                  <h3 style="margin-bottom: 16px;">Your Details</h3>
                  <div class="grid grid-2">
                    <div class="form-group">
                      <label class="form-label">Name *</label>
                      <input type="text" name="customer_name" class="form-input" placeholder="Your name" required value={customer?.name || ''} />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Phone *</label>
                      <input type="tel" name="customer_phone" id="customer-phone" class="form-input" placeholder="+1 (555) 000-0000" required value={customer?.phone || ''} />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="customer_email" class="form-input" placeholder="your@email.com" value={customer?.email || ''} />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Special Instructions</label>
                    <textarea name="special_instructions" class="form-textarea" placeholder="Any special requests or allergies..."></textarea>
                  </div>
                </div>

                {/* Payment Method */}
                <div class="card" style="padding: 24px; margin-bottom: 20px;">
                  <h3 style="margin-bottom: 16px;">Payment Method</h3>
                  <div class="flex gap-2 flex-col">
                    <label class="payment-option selected" style="padding: 16px; border: 2px solid var(--primary); border-radius: var(--radius); cursor: pointer; display: flex; align-items: center; gap: 12px; background: var(--bg-alt);">
                      <input type="radio" name="payment_method" value="card" checked />
                      <span style="font-size: 24px;">💳</span>
                      <div>
                        <div style="font-weight: 600;">Credit/Debit Card</div>
                        <div class="text-muted" style="font-size: 13px;">Pay securely with your card</div>
                      </div>
                    </label>
                    <label class="payment-option" style="padding: 16px; border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer; display: flex; align-items: center; gap: 12px;">
                      <input type="radio" name="payment_method" value="cash" />
                      <span style="font-size: 24px;">💵</span>
                      <div>
                        <div style="font-weight: 600;">Pay at Pickup</div>
                        <div class="text-muted" style="font-size: 13px;">Pay when you collect your order</div>
                      </div>
                    </label>
                  </div>

                  {/* Card Details (shown when card selected) */}
                  <div id="card-details" style="margin-top: 20px; padding: 20px; background: var(--bg-alt); border-radius: var(--radius);">
                    <div class="form-group">
                      <label class="form-label">Card Number</label>
                      <input type="text" id="card-number" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19" style="font-family: monospace; font-size: 16px;" />
                    </div>
                    <div class="grid grid-2" style="gap: 12px;">
                      <div class="form-group">
                        <label class="form-label">Expiry Date</label>
                        <input type="text" id="card-expiry" class="form-input" placeholder="MM/YY" maxlength="5" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">CVV</label>
                        <input type="text" id="card-cvv" class="form-input" placeholder="123" maxlength="4" />
                      </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <label class="form-label">Cardholder Name</label>
                      <input type="text" id="card-name" class="form-input" placeholder="Name on card" style="text-transform: uppercase;" />
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
                      <span style="font-size: 20px;">🔒</span>
                      <span class="text-muted" style="font-size: 12px;">Your payment info is secure. This is a demo - no actual charges will be made.</span>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 18px; padding: 16px;" id="submit-btn">
                  <span id="submit-btn-text">Place Order</span>
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div class="card" style="padding: 24px; position: sticky; top: 20px;">
                <h3 style="margin-bottom: 16px;">Order Summary</h3>
                <div id="order-items" style="max-height: 300px; overflow-y: auto;"></div>

                {/* Promo Code */}
                <div style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
                  <div class="flex gap-2">
                    <input type="text" id="promo-input" class="form-input" placeholder="Promo code" style="flex: 1;" />
                    <button type="button" onclick="window.applyPromo()" class="btn btn-secondary" id="promo-btn">Apply</button>
                  </div>
                  <div id="promo-message" style="font-size: 13px; margin-top: 8px;"></div>
                </div>

                {/* Points Redemption */}
                <div id="points-section" style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px; display: none;">
                  <div class="flex justify-between items-center mb-2">
                    <span style="font-weight: 600;">Redeem Points</span>
                    <span id="available-points" class="text-muted">0 pts available</span>
                  </div>
                  <div class="flex gap-2 items-center">
                    <input type="range" id="points-slider" min="0" max="0" value="0" style="flex: 1;" />
                    <span id="points-value" style="min-width: 60px; text-align: right; font-weight: 600;">0 pts</span>
                  </div>
                  <div class="flex justify-between mt-2">
                    <span class="text-muted" style="font-size: 13px;">Discount</span>
                    <span id="points-discount" style="color: var(--success); font-weight: 600;">-$0.00</span>
                  </div>
                  <div class="text-muted" style="font-size: 12px; margin-top: 4px;">100 points = $1.00 discount</div>
                </div>

                {/* Totals */}
                <div style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
                  <div class="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span id="checkout-subtotal">$0.00</span>
                  </div>
                  <div class="flex justify-between mb-2" id="promo-discount-row" style="display: none;">
                    <span>Promo Discount</span>
                    <span id="checkout-promo-discount" style="color: var(--success);">-$0.00</span>
                  </div>
                  <div class="flex justify-between mb-2" id="points-discount-row" style="display: none;">
                    <span>Points Discount</span>
                    <span id="checkout-points-discount" style="color: var(--success);">-$0.00</span>
                  </div>
                  <div class="flex justify-between mb-2">
                    <span>Tax (5%)</span>
                    <span id="checkout-tax">$0.00</span>
                  </div>
                  <div class="flex justify-between" style="font-size: 22px; font-weight: 700; margin-top: 12px; padding-top: 12px; border-top: 2px solid var(--border);">
                    <span>Total</span>
                    <span id="checkout-total" style="color: var(--primary);">$0.00</span>
                  </div>
                  <div class="flex justify-between mt-3" style="padding: 12px; background: var(--bg-alt); border-radius: var(--radius);">
                    <span style="font-weight: 500;">Points you'll earn</span>
                    <span id="points-earned" style="color: var(--primary); font-weight: 700;">+0 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Payment Processing Modal */}
      <div id="payment-modal" class="modal-overlay" style="display: none;">
        <div class="modal" style="text-align: center; padding: 40px;">
          <div id="payment-spinner" style="width: 60px; height: 60px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <h3 id="payment-status">Processing Payment...</h3>
          <p id="payment-message" class="text-muted">Please wait while we process your payment</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .checkout-step {
          max-width: 900px;
          margin: 0 auto;
        }

        .step-title {
          font-size: 28px;
          text-align: center;
          margin-bottom: 12px;
        }

        .step-subtitle {
          text-align: center;
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-btn:hover {
          text-decoration: underline;
        }

        .order-method-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .order-method-card {
          background: white;
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .order-method-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .method-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .order-method-card h3 {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .order-method-card p {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .method-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          text-align: left;
        }

        .method-benefits li {
          padding: 8px 0;
          padding-left: 28px;
          position: relative;
        }

        .method-benefits li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--success);
          font-weight: bold;
        }

        .delivery-partners-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .delivery-partner-card {
          display: flex;
          flex-direction: column;
          background: white;
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
        }

        .delivery-partner-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .delivery-partner-card.uber-eats:hover {
          border-color: #06C167;
        }

        .delivery-partner-card.deliveroo:hover {
          border-color: #00CCBC;
        }

        .delivery-partner-card.just-eat:hover {
          border-color: #FF8000;
        }

        .partner-logo-container {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .partner-logo-text {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .uber-eats-text {
          color: #06C167;
        }

        .deliveroo-text {
          color: #00CCBC;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          text-transform: lowercase;
        }

        .just-eat-text {
          color: #FF8000;
        }

        .partner-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .partner-name {
          font-size: 18px;
          font-weight: 600;
        }

        .delivery-time {
          color: var(--text-muted);
          font-size: 14px;
        }

        .partner-action {
          padding: 12px;
          background: var(--bg-alt);
          border-radius: var(--radius);
          font-weight: 600;
          color: var(--primary);
        }

        .uber-eats .partner-action {
          color: #06C167;
        }

        .deliveroo .partner-action {
          color: #00CCBC;
        }

        .just-eat .partner-action {
          color: #FF8000;
        }

        .delivery-info-box {
          background: var(--bg-alt);
          border-radius: 12px;
          padding: 24px;
        }

        .delivery-info-box h4 {
          margin-bottom: 16px;
        }

        .delivery-info-box ol {
          margin: 0;
          padding-left: 20px;
        }

        .delivery-info-box li {
          padding: 8px 0;
          color: var(--text-muted);
        }

        .branch-details {
          margin-top: 16px;
          padding: 16px;
          background: var(--bg-alt);
          border-radius: var(--radius);
        }

        .branch-detail-row {
          display: flex;
          gap: 12px;
          padding: 8px 0;
        }

        .detail-icon {
          font-size: 18px;
        }

        .pickup-time-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .pickup-time-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          border: 2px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .pickup-time-option:hover {
          border-color: var(--primary-light);
        }

        .pickup-time-option.selected {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .time-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .time-label {
          font-weight: 600;
          font-size: 16px;
        }

        .time-estimate {
          color: var(--text-muted);
          font-size: 13px;
        }

        .payment-option.selected {
          border-color: var(--primary) !important;
          background: var(--bg-alt) !important;
        }

        @media (max-width: 768px) {
          .order-method-grid {
            grid-template-columns: 1fr;
          }
          .delivery-partners-grid {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const menuItems = ${menuItemsJson};
        const branches = ${branchesJson};
        let currentCustomer = ${customerJson};
        let cartSubtotal = 0;
        let promoDiscount = 0;
        let pointsDiscount = 0;
        let pointsToRedeem = 0;
        let selectedMethod = null;

        window.selectOrderMethod = function(method) {
          selectedMethod = method;

          document.getElementById('step-order-method').style.display = 'none';

          if (method === 'delivery') {
            document.getElementById('step-delivery-partners').style.display = 'block';
          } else {
            document.getElementById('step-collect-form').style.display = 'block';
            renderOrderSummary();
          }
        };

        window.goBackToMethod = function() {
          document.getElementById('step-order-method').style.display = 'block';
          document.getElementById('step-delivery-partners').style.display = 'none';
          document.getElementById('step-collect-form').style.display = 'none';
          selectedMethod = null;
        };

        function getCart() {
          return JSON.parse(localStorage.getItem('cart') || '[]');
        }

        function getItemById(id) {
          return menuItems.find(item => item.id === id);
        }

        function formatCurrency(amount) {
          return '$' + amount.toFixed(2);
        }

        function renderOrderSummary() {
          const cart = getCart();
          const itemsEl = document.getElementById('order-items');

          if (cart.length === 0) {
            window.location.href = '/cart';
            return;
          }

          let html = '';
          cartSubtotal = 0;

          cart.forEach(cartItem => {
            const item = getItemById(cartItem.itemId);
            if (!item) return;

            let itemTotal = item.price;
            if (cartItem.modifiers) {
              cartItem.modifiers.forEach(mod => {
                itemTotal += mod.price || 0;
              });
            }
            itemTotal *= cartItem.quantity;
            cartSubtotal += itemTotal;

            html += '<div class="flex justify-between mb-2" style="padding: 8px 0; border-bottom: 1px solid var(--border);">';
            html += '<div><span style="font-weight: 600;">' + cartItem.quantity + 'x</span> ' + item.name;
            if (cartItem.modifiers && cartItem.modifiers.length > 0) {
              html += '<div class="text-muted" style="font-size: 12px;">' + cartItem.modifiers.map(m => m.name).join(', ') + '</div>';
            }
            html += '</div>';
            html += '<span style="font-weight: 600;">' + formatCurrency(itemTotal) + '</span></div>';
          });

          itemsEl.innerHTML = html;
          updateTotals();
        }

        function updateTotals() {
          const tax = (cartSubtotal - promoDiscount - pointsDiscount) * 0.05;
          const total = cartSubtotal - promoDiscount - pointsDiscount + tax;

          document.getElementById('checkout-subtotal').textContent = formatCurrency(cartSubtotal);
          document.getElementById('checkout-tax').textContent = formatCurrency(Math.max(0, tax));
          document.getElementById('checkout-total').textContent = formatCurrency(Math.max(0, total));
          document.getElementById('points-earned').textContent = '+' + Math.floor(Math.max(0, total)) + ' pts';

          const submitBtn = document.getElementById('submit-btn-text');
          if (submitBtn) {
            submitBtn.textContent = 'Pay ' + formatCurrency(Math.max(0, total));
          }

          localStorage.setItem('cartTotals', JSON.stringify({
            subtotal: cartSubtotal,
            promoDiscount,
            pointsDiscount,
            tax: Math.max(0, tax),
            total: Math.max(0, total)
          }));
        }

        // Branch selection
        const branchSelect = document.getElementById('branch-select');
        if (branchSelect) {
          branchSelect.addEventListener('change', function() {
            const branchId = parseInt(this.value);
            const branch = branches.find(b => b.id === branchId);
            const detailsEl = document.getElementById('branch-details');

            if (branch) {
              document.getElementById('branch-address').textContent = branch.address;
              document.getElementById('branch-hours').textContent = branch.opening_hours + ' - ' + branch.closing_hours;
              document.getElementById('branch-phone').textContent = branch.phone;
              detailsEl.style.display = 'block';
            } else {
              detailsEl.style.display = 'none';
            }
          });
        }

        // Pickup time selection
        document.querySelectorAll('input[name="pickup_time"]').forEach(radio => {
          radio.addEventListener('change', function() {
            document.querySelectorAll('.pickup-time-option').forEach(label => label.classList.remove('selected'));
            this.closest('label').classList.add('selected');
            document.getElementById('scheduled-time').style.display = this.value === 'scheduled' ? 'block' : 'none';
          });
        });

        // Set default scheduled date to today
        const today = new Date().toISOString().split('T')[0];
        const scheduledDate = document.getElementById('scheduled-date');
        if (scheduledDate) {
          scheduledDate.value = today;
          scheduledDate.min = today;
        }

        // Promo code
        window.applyPromo = async function() {
          const code = document.getElementById('promo-input').value.trim();
          const msgEl = document.getElementById('promo-message');
          const btn = document.getElementById('promo-btn');

          if (!code) {
            msgEl.innerHTML = '<span style="color: var(--error);">Please enter a promo code</span>';
            return;
          }

          btn.disabled = true;
          btn.textContent = '...';

          try {
            const res = await fetch('/api/promotions/validate/' + encodeURIComponent(code) + '?subtotal=' + cartSubtotal);
            const result = await res.json();

            if (result.valid) {
              promoDiscount = result.discount;
              localStorage.setItem('promoCode', code);
              document.getElementById('promo-discount-row').style.display = 'flex';
              document.getElementById('checkout-promo-discount').textContent = '-' + formatCurrency(promoDiscount);
              msgEl.innerHTML = '<span style="color: var(--success);">✓ ' + result.name + ' applied!</span>';
              updateTotals();
            } else {
              msgEl.innerHTML = '<span style="color: var(--error);">' + result.error + '</span>';
            }
          } catch (err) {
            msgEl.innerHTML = '<span style="color: var(--error);">Failed to validate code</span>';
          }

          btn.disabled = false;
          btn.textContent = 'Apply';
        };

        // Points redemption
        function setupPointsRedemption() {
          if (!currentCustomer || currentCustomer.points_balance <= 0) return;

          const section = document.getElementById('points-section');
          const slider = document.getElementById('points-slider');
          const valueEl = document.getElementById('points-value');
          const discountEl = document.getElementById('points-discount');
          const availableEl = document.getElementById('available-points');

          section.style.display = 'block';
          availableEl.textContent = currentCustomer.points_balance + ' pts available';

          const maxByBalance = currentCustomer.points_balance;
          const maxBySubtotal = Math.floor(cartSubtotal * 100);
          const maxRedeemable = Math.min(maxByBalance, maxBySubtotal);

          slider.max = maxRedeemable;
          slider.value = 0;

          slider.oninput = function() {
            pointsToRedeem = parseInt(this.value);
            pointsDiscount = pointsToRedeem / 100;
            valueEl.textContent = pointsToRedeem + ' pts';
            discountEl.textContent = '-' + formatCurrency(pointsDiscount);

            if (pointsDiscount > 0) {
              document.getElementById('points-discount-row').style.display = 'flex';
              document.getElementById('checkout-points-discount').textContent = '-' + formatCurrency(pointsDiscount);
            } else {
              document.getElementById('points-discount-row').style.display = 'none';
            }

            updateTotals();
          };
        }

        // Check for existing customer by phone
        async function checkCustomer() {
          const phoneInput = document.getElementById('customer-phone');
          if (!phoneInput) return;
          const phone = phoneInput.value.trim();
          if (phone.length < 8) return;

          try {
            const res = await fetch('/api/customers/lookup?phone=' + encodeURIComponent(phone));
            const result = await res.json();
            if (result.customer) {
              currentCustomer = result.customer;
              setupPointsRedemption();
            }
          } catch (err) {
            // Ignore errors
          }
        }

        const phoneInput = document.getElementById('customer-phone');
        if (phoneInput) {
          phoneInput.addEventListener('blur', checkCustomer);
        }

        // Payment method selection
        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
          radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-option').forEach(label => {
              label.classList.remove('selected');
              label.style.borderColor = 'var(--border)';
              label.style.background = 'var(--white)';
            });
            this.closest('label').classList.add('selected');
            this.closest('label').style.borderColor = 'var(--primary)';
            this.closest('label').style.background = 'var(--bg-alt)';
            document.getElementById('card-details').style.display = this.value === 'card' ? 'block' : 'none';
          });
        });

        // Card number formatting
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
          cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
            value = value.replace(/(\\d{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
          });
        }

        // Expiry formatting
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
          cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\\D/g, '');
            if (value.length >= 2) {
              value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
          });
        }

        // CVV - numbers only
        const cardCvv = document.getElementById('card-cvv');
        if (cardCvv) {
          cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\\D/g, '').substring(0, 4);
          });
        }

        // Submit order
        window.submitOrder = async function(e) {
          e.preventDefault();

          const form = document.getElementById('checkout-form');
          const formData = new FormData(form);
          const paymentMethod = formData.get('payment_method');

          // Validate card details if paying by card
          if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('card-number').value.replace(/\\s/g, '');
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCvv = document.getElementById('card-cvv').value;
            const cardName = document.getElementById('card-name').value;

            if (cardNumber.length < 16) {
              alert('Please enter a valid card number');
              return false;
            }
            if (!cardExpiry.match(/^\\d{2}\\/\\d{2}$/)) {
              alert('Please enter a valid expiry date (MM/YY)');
              return false;
            }
            if (cardCvv.length < 3) {
              alert('Please enter a valid CVV');
              return false;
            }
            if (cardName.length < 2) {
              alert('Please enter the cardholder name');
              return false;
            }
          }

          const submitBtn = document.getElementById('submit-btn');
          submitBtn.disabled = true;

          // Show payment modal for card payments
          if (paymentMethod === 'card') {
            document.getElementById('payment-modal').style.display = 'flex';
            document.getElementById('payment-status').textContent = 'Processing Payment...';
            document.getElementById('payment-message').textContent = 'Please wait while we process your card';

            await new Promise(resolve => setTimeout(resolve, 2000));

            document.getElementById('payment-status').textContent = 'Verifying Card...';
            await new Promise(resolve => setTimeout(resolve, 1000));

            document.getElementById('payment-status').textContent = 'Payment Approved!';
            document.getElementById('payment-message').textContent = 'Creating your order...';
            document.getElementById('payment-spinner').style.borderTopColor = 'var(--success)';
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            submitBtn.querySelector('#submit-btn-text').textContent = 'Processing...';
          }

          const cart = getCart();
          const totals = JSON.parse(localStorage.getItem('cartTotals') || '{}');
          const promoCode = localStorage.getItem('promoCode');

          const orderData = {
            order_type: 'takeaway',
            branch_id: parseInt(formData.get('branch_id')),
            table_number: '',
            customer_name: formData.get('customer_name'),
            customer_phone: formData.get('customer_phone'),
            customer_email: formData.get('customer_email'),
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'card' ? 'paid' : 'pending',
            special_instructions: formData.get('special_instructions'),
            promo_code: promoCode,
            points_redeemed: pointsToRedeem,
            items: cart.map(c => {
              const item = getItemById(c.itemId);
              return {
                id: c.itemId,
                name: item ? item.name : 'Unknown',
                price: item ? item.price : 0,
                quantity: c.quantity,
                modifiers: c.modifiers || [],
                notes: c.notes || ''
              };
            })
          };

          try {
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData)
            });

            const result = await res.json();

            if (result.success) {
              localStorage.removeItem('cart');
              localStorage.removeItem('cartTotals');
              localStorage.removeItem('promoCode');
              window.location.href = '/order/' + result.orderNumber;
            } else {
              document.getElementById('payment-modal').style.display = 'none';
              alert('Failed to place order: ' + (result.error || 'Unknown error'));
              submitBtn.disabled = false;
              submitBtn.querySelector('#submit-btn-text').textContent = 'Place Order';
            }
          } catch (err) {
            document.getElementById('payment-modal').style.display = 'none';
            alert('Failed to place order. Please try again.');
            submitBtn.disabled = false;
            submitBtn.querySelector('#submit-btn-text').textContent = 'Place Order';
          }

          return false;
        };

        // Initialize cart display
        const cart = getCart();
        if (cart.length === 0) {
          // No items in cart, redirect to menu
          window.location.href = '/menu';
        }

        // Load saved promo code
        const savedPromo = localStorage.getItem('promoCode');
        const promoInput = document.getElementById('promo-input');
        if (savedPromo && promoInput) {
          promoInput.value = savedPromo;
        }
      `}} />
    </Layout>
  );
};
