import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { MenuItem, Branch } from '../types';
import { escapeHtml, formatCurrency } from '../utils/helpers';

interface CartPageProps {
  menuItems: MenuItem[];
  branches: Branch[];
}

export const CartPage: FC<CartPageProps> = ({ menuItems, branches }) => {
  // Cart data will be loaded client-side from localStorage
  const menuItemsJson = JSON.stringify(menuItems);
  const branchesJson = JSON.stringify(branches);

  return (
    <Layout title="Your Cart">
      <Header currentPath="/cart" />

      <div class="container" style="padding: 40px 20px;">
        <h1 class="section-title">Your Cart</h1>

        <div id="cart-container" style="display: grid; grid-template-columns: 1fr 400px; gap: 30px;">
          {/* Cart Items */}
          <div id="cart-items">
            <div class="empty-state" id="empty-cart">
              <div class="empty-state-icon">🛒</div>
              <h3 class="empty-state-title">Your cart is empty</h3>
              <p class="empty-state-text">Add some delicious items from our menu!</p>
              <a href="/menu" class="btn btn-primary">Browse Menu</a>
            </div>
          </div>

          {/* Cart Summary */}
          <div id="cart-summary" style="display: none;">
            <div class="cart-summary" style="position: sticky; top: 100px;">
              <h3 style="font-size: 20px; margin-bottom: 20px;">Order Summary</h3>

              <div id="order-info" style="margin-bottom: 20px; padding: 16px; background: var(--bg-alt); border-radius: var(--radius);">
                <div id="branch-info"></div>
                <div id="table-info"></div>
              </div>

              <div class="cart-summary-row">
                <span>Subtotal</span>
                <span id="subtotal">$ 0.00</span>
              </div>
              <div class="cart-summary-row">
                <span>Tax (5%)</span>
                <span id="tax">$ 0.00</span>
              </div>
              <div class="cart-summary-row" id="discount-row" style="display: none;">
                <span>Discount</span>
                <span id="discount" class="text-success">-$ 0.00</span>
              </div>
              <div class="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span id="total">$ 0.00</span>
              </div>

              {/* Promo Code */}
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="promo-code"
                    placeholder="Promo code"
                    class="form-input"
                    style="flex: 1;"
                  />
                  <button onclick="window.applyPromo()" class="btn btn-secondary">Apply</button>
                </div>
                <div id="promo-message" class="mt-1" style="font-size: 13px;"></div>
              </div>

              <a href="/checkout" id="checkout-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 24px;">
                Proceed to Checkout
              </a>

              <a href="/menu" class="btn btn-ghost" style="width: 100%; margin-top: 12px;">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <script dangerouslySetInnerHTML={{ __html: `
        const menuItems = ${menuItemsJson};
        const branches = ${branchesJson};
        let promoDiscount = 0;
        let promoType = null;

        function getCart() {
          try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
          } catch(e) {
            console.error('Error reading cart:', e);
            return [];
          }
        }

        function saveCart(cart) {
          localStorage.setItem('cart', JSON.stringify(cart));
        }

        function getItemById(id) {
          return menuItems.find(item => item.id === id);
        }

        function getBranchById(id) {
          return branches.find(b => b.id === id);
        }

        function renderCart() {
          const cart = getCart();
          const cartItemsEl = document.getElementById('cart-items');
          const summaryEl = document.getElementById('cart-summary');

          console.log('Rendering cart, items:', cart.length, cart);

          if (cart.length === 0) {
            cartItemsEl.innerHTML = '<div class="empty-state" id="empty-cart"><div class="empty-state-icon">🛒</div><h3 class="empty-state-title">Your cart is empty</h3><p class="empty-state-text">Add some delicious items from our menu!</p><a href="/menu" class="btn btn-primary">Browse Menu</a></div>';
            summaryEl.style.display = 'none';
            document.getElementById('cart-container').style.gridTemplateColumns = '1fr';
            return;
          }

          summaryEl.style.display = 'block';
          document.getElementById('cart-container').style.gridTemplateColumns = '1fr 400px';

          // Show branch/table info
          const firstItem = cart[0];
          const branchInfo = document.getElementById('branch-info');
          const tableInfo = document.getElementById('table-info');

          if (firstItem.branchId) {
            const branch = getBranchById(firstItem.branchId);
            branchInfo.innerHTML = branch ? '📍 ' + branch.name : '';
          }
          if (firstItem.tableNumber) {
            tableInfo.innerHTML = '🪑 Table ' + firstItem.tableNumber;
          }

          let html = '';
          let subtotal = 0;

          cart.forEach((cartItem, index) => {
            const item = getItemById(cartItem.itemId);
            if (!item) {
              console.warn('Item not found for cart item:', cartItem);
              return;
            }

            // Calculate item total including modifiers
            let itemPrice = item.price;
            if (cartItem.modifiers && cartItem.modifiers.length > 0) {
              cartItem.modifiers.forEach(mod => {
                itemPrice += mod.price || 0;
              });
            }
            const itemTotal = itemPrice * cartItem.quantity;
            subtotal += itemTotal;

            html += '<div class="cart-item"><img src="' + (item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200') + '" alt="' + item.name + '" class="cart-item-img" /><div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div>';

            // Show modifiers
            if (cartItem.modifiers && cartItem.modifiers.length > 0) {
              html += '<div class="cart-item-mods">' + cartItem.modifiers.map(m => m.name).join(', ') + '</div>';
            }

            if (cartItem.notes) {
              html += '<div class="cart-item-mods" style="font-style: italic;">Note: ' + cartItem.notes + '</div>';
            }

            html += '<div class="cart-item-qty"><button class="qty-btn" onclick="window.updateQty(' + index + ', -1)">-</button><span>' + cartItem.quantity + '</span><button class="qty-btn" onclick="window.updateQty(' + index + ', 1)">+</button></div></div><div style="text-align: right;"><div class="cart-item-price">$ ' + itemTotal.toFixed(2) + '</div><button onclick="window.removeItem(' + index + ')" class="btn btn-ghost btn-sm text-error" style="margin-top: 8px;">Remove</button></div></div>';
          });

          cartItemsEl.innerHTML = html;

          // Calculate totals
          const tax = subtotal * 0.05;
          let discount = 0;

          if (promoType === 'percentage') {
            discount = subtotal * (promoDiscount / 100);
          } else if (promoType === 'fixed') {
            discount = Math.min(promoDiscount, subtotal);
          }

          const total = subtotal + tax - discount;

          document.getElementById('subtotal').textContent = '$ ' + subtotal.toFixed(2);
          document.getElementById('tax').textContent = '$ ' + tax.toFixed(2);
          document.getElementById('total').textContent = '$ ' + total.toFixed(2);

          const discountRow = document.getElementById('discount-row');
          if (discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('discount').textContent = '-$ ' + discount.toFixed(2);
          } else {
            discountRow.style.display = 'none';
          }

          // Store totals for checkout
          localStorage.setItem('cartTotals', JSON.stringify({ subtotal, tax, discount, total }));

          updateCartBadge();
        }

        window.updateQty = function(index, delta) {
          const cart = getCart();
          cart[index].quantity += delta;
          if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
          }
          saveCart(cart);
          renderCart();
        };

        window.removeItem = function(index) {
          const cart = getCart();
          cart.splice(index, 1);
          saveCart(cart);
          renderCart();
        };

        function updateCartBadge() {
          const cart = getCart();
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          const badge = document.querySelector('.cart-badge');
          if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
          }
        }

        window.applyPromo = async function() {
          const code = document.getElementById('promo-code').value.trim();
          const msgEl = document.getElementById('promo-message');

          if (!code) {
            msgEl.innerHTML = '<span class="text-error">Please enter a promo code</span>';
            return;
          }

          try {
            const res = await fetch('/api/promotions/validate?code=' + encodeURIComponent(code));
            const data = await res.json();

            if (data.valid) {
              promoType = data.promotion.discount_type;
              promoDiscount = data.promotion.discount_value;
              msgEl.innerHTML = '<span class="text-success">Promo applied: ' + data.promotion.name + '</span>';
              localStorage.setItem('promoCode', code);
              renderCart();
            } else {
              msgEl.innerHTML = '<span class="text-error">' + data.error + '</span>';
            }
          } catch (err) {
            msgEl.innerHTML = '<span class="text-error">Failed to validate promo</span>';
          }
        };

        // Initial render
        renderCart();
      `}} />
    </Layout>
  );
};
