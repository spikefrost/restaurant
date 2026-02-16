import type { FC } from 'hono/jsx';

interface HeaderProps {
  currentPath?: string;
}

export const Header: FC<HeaderProps> = ({ currentPath = '/' }) => {
  return (
    <header class="header">
      <div class="header-inner">
        <a href="/" class="logo">
          <div class="logo-mark">
            <div class="logo-circle">
              <span class="logo-letter">S</span>
            </div>
            <div class="logo-accent"></div>
          </div>
          <div class="logo-text">
            <span class="logo-name">Smart</span>
            <span class="logo-tagline">Restaurant</span>
          </div>
        </a>

        <nav class="nav">
          <a href="/" class={`nav-link ${currentPath === '/' ? 'active' : ''}`}>Home</a>
          <a href="/menu" class={`nav-link ${currentPath === '/menu' ? 'active' : ''}`}>Menu</a>
          <a href="/locations" class={`nav-link ${currentPath === '/locations' ? 'active' : ''}`}>Locations</a>
          <a href="/orders" class={`nav-link ${currentPath === '/orders' ? 'active' : ''}`}>My Orders</a>
        </nav>

        <div class="header-actions">
          {/* User Menu - shown/hidden by JS */}
          <div id="user-menu" class="user-menu" style="display: none;">
            <button id="user-menu-btn" class="user-menu-btn" onclick="window.toggleUserDropdown()">
              <span id="user-initial" class="user-initial">U</span>
              <span id="user-name-display" class="user-name-display">User</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            <div id="user-dropdown" class="user-dropdown" style="display: none;">
              <a href="/orders" class="dropdown-item">📋 My Orders</a>
              <a href="/orders" class="dropdown-item">⭐ Loyalty Points</a>
              <div class="dropdown-divider"></div>
              <button onclick="window.signOut()" class="dropdown-item dropdown-item-danger">🚪 Sign Out</button>
            </div>
          </div>

          {/* Sign In Link - shown when not logged in */}
          <a href="/orders" id="sign-in-link" class="sign-in-link">Sign In</a>

          <a href="/cart" class="cart-btn" id="cart-btn">
            🛒
            <span class="cart-badge" id="cart-badge" style="display: none;">0</span>
          </a>
        </div>
      </div>

      <style>{`
        /* Fancy Logo Styles */
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-mark {
          position: relative;
          width: 44px;
          height: 44px;
        }

        .logo-circle {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary) 0%, #c0392b 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .logo:hover .logo-circle {
          transform: rotate(-5deg) scale(1.05);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }

        .logo-letter {
          color: white;
          font-size: 24px;
          font-weight: 800;
          font-family: 'Georgia', serif;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .logo-accent {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(243, 156, 18, 0.4);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, var(--text) 0%, #555 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-tagline {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        @media (max-width: 768px) {
          .logo-text {
            display: none;
          }

          .logo-mark {
            width: 40px;
            height: 40px;
          }

          .logo-circle {
            width: 40px;
            height: 40px;
          }

          .logo-letter {
            font-size: 20px;
          }
        }

        .user-menu {
          position: relative;
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 50px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-menu-btn:hover {
          background: var(--border);
        }

        .user-initial {
          width: 28px;
          height: 28px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .user-name-display {
          font-weight: 500;
          font-size: 14px;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 10px;
          color: var(--text-muted);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          min-width: 180px;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-item {
          display: block;
          padding: 12px 16px;
          color: var(--text);
          text-decoration: none;
          font-size: 14px;
          transition: background 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: var(--bg-alt);
        }

        .dropdown-item-danger {
          color: var(--error);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 0;
        }

        .sign-in-link {
          padding: 8px 16px;
          color: var(--primary);
          font-weight: 500;
          text-decoration: none;
          font-size: 14px;
        }

        .sign-in-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .user-name-display {
            display: none;
          }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function updateCartBadge() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const badge = document.getElementById('cart-badge');
          if (!badge) return;
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        }

        function updateUserMenu() {
          const userSession = localStorage.getItem('userSession');
          const userMenu = document.getElementById('user-menu');
          const signInLink = document.getElementById('sign-in-link');

          if (userSession) {
            try {
              const user = JSON.parse(userSession);
              document.getElementById('user-initial').textContent = user.name.charAt(0).toUpperCase();
              document.getElementById('user-name-display').textContent = user.name.split(' ')[0];
              userMenu.style.display = 'block';
              signInLink.style.display = 'none';
            } catch(e) {
              userMenu.style.display = 'none';
              signInLink.style.display = 'block';
            }
          } else {
            userMenu.style.display = 'none';
            signInLink.style.display = 'block';
          }
        }

        window.toggleUserDropdown = function() {
          const dropdown = document.getElementById('user-dropdown');
          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        };

        window.signOut = function() {
          localStorage.removeItem('userSession');
          localStorage.removeItem('cart');
          localStorage.removeItem('cartTotals');
          localStorage.removeItem('promoCode');
          window.location.href = '/';
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
          const userMenu = document.getElementById('user-menu');
          const dropdown = document.getElementById('user-dropdown');
          if (userMenu && dropdown && !userMenu.contains(e.target)) {
            dropdown.style.display = 'none';
          }
        });

        updateCartBadge();
        updateUserMenu();
      `}} />
    </header>
  );
};
