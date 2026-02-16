import type { FC } from 'hono/jsx';

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">
            <div class="footer-logo-mark">
              <span class="footer-logo-letter">S</span>
            </div>
            <div class="footer-logo-text">
              <span class="footer-logo-name">Smart</span>
              <span class="footer-logo-tagline">Restaurant</span>
            </div>
          </div>
          <p class="footer-desc">
            Experience the future of dining with our contactless ordering system.
            Browse menus, place orders, and earn rewards - all from your phone.
          </p>
        </div>

        <div>
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="/menu">Our Menu</a></li>
            <li><a href="/locations">Find a Location</a></li>
            <li><a href="/cart">Your Cart</a></li>
            <li><a href="/orders">Order History</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-title">Loyalty Program</h4>
          <ul class="footer-links">
            <li><a href="/orders">Check Your Points</a></li>
          </ul>
          <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="font-size: 13px; color: #ccc; margin-bottom: 8px; font-weight: 600;">How It Works:</div>
            <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">🎁 Earn 1 point for every $1 spent</div>
            <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">💰 100 points = $1 discount</div>
            <div style="font-size: 12px; color: #aaa; margin-bottom: 6px;">⭐ Tier Benefits: Bronze → Silver → Gold → Platinum</div>
            <div style="font-size: 12px; color: #aaa;">🎂 Birthday rewards for members!</div>
          </div>
        </div>

        <div>
          <h4 class="footer-title">Contact Us</h4>
          <ul class="footer-links">
            <li>📍 123 Restaurant Street</li>
            <li>📞 +1 (555) 123-4567</li>
            <li>✉️ hello@smartrestaurant.com</li>
          </ul>
          <div style="margin-top: 16px;">
            <h4 class="footer-title" style="font-size: 13px;">Hours</h4>
            <div style="font-size: 12px; color: #aaa;">Mon-Sun: 10:00 AM - 11:00 PM</div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <p>&copy; {currentYear} Smart Restaurant. All rights reserved.</p>
          <div style="display: flex; gap: 16px; font-size: 13px;">
            <span style="color: #888;">Scan • Order • Earn • Redeem</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
