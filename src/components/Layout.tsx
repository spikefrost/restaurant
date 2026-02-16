import type { FC } from 'hono/jsx';
import { styles } from '../styles/main';

interface LayoutProps {
  title: string;
  children: any;
}

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | Smart Restaurant</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

interface AdminLayoutProps {
  title: string;
  currentPath: string;
  children: any;
}

export const AdminLayout: FC<AdminLayoutProps> = ({ title, currentPath, children }) => {
  // Check if current path is within a section for auto-expand
  const isInLoyalty = currentPath.startsWith('/admin/loyalty');
  const isInPromotions = currentPath.startsWith('/admin/promotions') || currentPath.startsWith('/admin/vouchers');
  const isInEngagement = currentPath.startsWith('/admin/engagement');
  const isInCustomers = currentPath.startsWith('/admin/customers') || currentPath.startsWith('/admin/segments');

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | Admin - Smart Restaurant</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div class="admin-layout">
          <aside class="admin-sidebar">
            <div class="admin-sidebar-header">
              <a href="/admin" class="admin-logo">Smart Restaurant</a>
            </div>
            <nav>
              <ul class="admin-nav">
                {/* Main Navigation */}
                <li class="admin-nav-item">
                  <a href="/admin" class={`admin-nav-link ${currentPath === '/admin' ? 'active' : ''}`}>
                    <span>📊</span><span>Dashboard</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/orders" class={`admin-nav-link ${currentPath === '/admin/orders' ? 'active' : ''}`}>
                    <span>📋</span><span>Orders</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/reservations" class={`admin-nav-link ${currentPath === '/admin/reservations' ? 'active' : ''}`}>
                    <span>📅</span><span>Reservations</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/menu" class={`admin-nav-link ${currentPath === '/admin/menu' || currentPath.startsWith('/admin/menu/') ? 'active' : ''}`}>
                    <span>🍔</span><span>Menu</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/categories" class={`admin-nav-link ${currentPath === '/admin/categories' || currentPath.startsWith('/admin/categories/') ? 'active' : ''}`}>
                    <span>📁</span><span>Categories</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/branches" class={`admin-nav-link ${currentPath === '/admin/branches' || currentPath.startsWith('/admin/branches/') ? 'active' : ''}`}>
                    <span>🏪</span><span>Branches</span>
                  </a>
                </li>
                <li class="admin-nav-item">
                  <a href="/admin/qrcodes" class={`admin-nav-link ${currentPath === '/admin/qrcodes' ? 'active' : ''}`}>
                    <span>📱</span><span>QR Codes</span>
                  </a>
                </li>

                {/* Customers & Segments Section */}
                <li class="admin-nav-item">
                  <a href="#" class={`admin-nav-link has-submenu ${isInCustomers ? 'active expanded' : ''}`} onclick="event.preventDefault(); toggleSection('customers')">
                    <span>👥</span><span>Customers</span><span class="nav-arrow">▸</span>
                  </a>
                  <ul class={`admin-nav-submenu ${isInCustomers ? 'show' : ''}`} id="customers-submenu">
                    <li>
                      <a href="/admin/customers" class={`admin-nav-sublink ${currentPath === '/admin/customers' || (currentPath.startsWith('/admin/customers/') && !currentPath.includes('segments')) ? 'active' : ''}`}>
                        <span>👤</span><span>All Customers</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/segments" class={`admin-nav-sublink ${currentPath.startsWith('/admin/segments') ? 'active' : ''}`}>
                        <span>🎯</span><span>Segments</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <li class="admin-nav-divider"></li>

                {/* Loyalty Program Section */}
                <li class="admin-nav-item">
                  <a href="#" class={`admin-nav-link has-submenu ${isInLoyalty ? 'active expanded' : ''}`} onclick="event.preventDefault(); toggleSection('loyalty')">
                    <span>⭐</span><span>Loyalty</span><span class="nav-arrow">▸</span>
                  </a>
                  <ul class={`admin-nav-submenu ${isInLoyalty ? 'show' : ''}`} id="loyalty-submenu">
                    <li>
                      <a href="/admin/loyalty/tiers" class={`admin-nav-sublink ${currentPath === '/admin/loyalty/tiers' || currentPath.startsWith('/admin/loyalty/tiers/') ? 'active' : ''}`}>
                        <span>🏆</span><span>Tiers</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/loyalty/earning" class={`admin-nav-sublink ${currentPath === '/admin/loyalty/earning' || currentPath.startsWith('/admin/loyalty/earning/') ? 'active' : ''}`}>
                        <span>💰</span><span>Points Earning</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/loyalty/challenges" class={`admin-nav-sublink ${currentPath === '/admin/loyalty/challenges' || currentPath.startsWith('/admin/loyalty/challenges/') ? 'active' : ''}`}>
                        <span>🎯</span><span>Challenges</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/loyalty/rewards" class={`admin-nav-sublink ${currentPath === '/admin/loyalty/rewards' || currentPath.startsWith('/admin/loyalty/rewards/') ? 'active' : ''}`}>
                        <span>🎁</span><span>Rewards Catalog</span>
                      </a>
                    </li>
                  </ul>
                </li>

                {/* Promotions & Vouchers Section */}
                <li class="admin-nav-item">
                  <a href="#" class={`admin-nav-link has-submenu ${isInPromotions ? 'active expanded' : ''}`} onclick="event.preventDefault(); toggleSection('promotions')">
                    <span>🏷️</span><span>Promotions</span><span class="nav-arrow">▸</span>
                  </a>
                  <ul class={`admin-nav-submenu ${isInPromotions ? 'show' : ''}`} id="promotions-submenu">
                    <li>
                      <a href="/admin/promotions" class={`admin-nav-sublink ${currentPath === '/admin/promotions' || (currentPath.startsWith('/admin/promotions/') && !currentPath.includes('vouchers')) ? 'active' : ''}`}>
                        <span>📢</span><span>Campaigns</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/vouchers" class={`admin-nav-sublink ${currentPath.startsWith('/admin/vouchers') ? 'active' : ''}`}>
                        <span>🎟️</span><span>Voucher Codes</span>
                      </a>
                    </li>
                  </ul>
                </li>

                {/* Engagement Section */}
                <li class="admin-nav-item">
                  <a href="#" class={`admin-nav-link has-submenu ${isInEngagement ? 'active expanded' : ''}`} onclick="event.preventDefault(); toggleSection('engagement')">
                    <span>💬</span><span>Engagement</span><span class="nav-arrow">▸</span>
                  </a>
                  <ul class={`admin-nav-submenu ${isInEngagement ? 'show' : ''}`} id="engagement-submenu">
                    <li>
                      <a href="/admin/engagement/email" class={`admin-nav-sublink ${currentPath === '/admin/engagement/email' || currentPath.startsWith('/admin/engagement/email/') ? 'active' : ''}`}>
                        <span>📧</span><span>Email Templates</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/engagement/sms" class={`admin-nav-sublink ${currentPath === '/admin/engagement/sms' || currentPath.startsWith('/admin/engagement/sms/') ? 'active' : ''}`}>
                        <span>📱</span><span>SMS Templates</span>
                      </a>
                    </li>
                    <li>
                      <a href="/admin/engagement/logs" class={`admin-nav-sublink ${currentPath === '/admin/engagement/logs' ? 'active' : ''}`}>
                        <span>📜</span><span>Communication Log</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <li class="admin-nav-divider"></li>

                <li class="admin-nav-item">
                  <a href="/admin/cms" class={`admin-nav-link ${currentPath.startsWith('/admin/cms') ? 'active' : ''}`}>
                    <span>📝</span><span>CMS</span>
                  </a>
                </li>

                <li class="admin-nav-item">
                  <a href="/admin/reports" class={`admin-nav-link ${currentPath === '/admin/reports' ? 'active' : ''}`}>
                    <span>📈</span><span>Reports</span>
                  </a>
                </li>
              </ul>
            </nav>
            <div style="margin-top: auto; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <a href="/kitchen" class="admin-nav-link" target="_blank">
                <span>👨‍🍳</span>
                <span>Kitchen Display</span>
              </a>
              <a href="/" class="admin-nav-link" style="margin-top: 8px;">
                <span>🌐</span>
                <span>View Site</span>
              </a>
            </div>
          </aside>
          <main class="admin-main">
            {children}
          </main>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          function toggleSection(section) {
            const submenu = document.getElementById(section + '-submenu');
            const link = submenu.previousElementSibling;
            submenu.classList.toggle('show');
            link.classList.toggle('expanded');
          }
        `}} />
      </body>
    </html>
  );
};
