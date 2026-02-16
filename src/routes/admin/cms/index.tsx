import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../../components/Layout';
import { escapeHtml } from '../../../utils/helpers';

interface CmsSection {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SITE_SECTIONS: CmsSection[] = [
  { id: 'homepage', name: 'Homepage', icon: '🏠', description: 'Hero, featured items, promotions' },
  { id: 'menu', name: 'Menu Page', icon: '🍽️', description: 'Menu layout and category display' },
  { id: 'locations', name: 'Locations', icon: '📍', description: 'Branch information and maps' },
  { id: 'about', name: 'About Us', icon: 'ℹ️', description: 'Restaurant story and team' },
  { id: 'contact', name: 'Contact', icon: '📞', description: 'Contact form and details' },
  { id: 'rewards', name: 'Rewards Page', icon: '⭐', description: 'Loyalty program info' },
];

interface CmsPageProps {
  settings: Record<string, string>;
  sections: any[];
}

export const AdminCmsPage: FC<CmsPageProps> = ({ settings, sections }) => {
  return (
    <AdminLayout title="Website CMS" currentPath="/admin/cms">
      <div class="cms-layout">
        {/* Left Sidebar - Site Structure */}
        <div class="cms-sidebar">
          <div class="sidebar-header">
            <h3>Website Pages</h3>
          </div>
          <ul class="page-list">
            {SITE_SECTIONS.map(section => (
              <li>
                <a href={`/admin/cms/${section.id}`} class="page-link">
                  <span class="page-icon">{section.icon}</span>
                  <span class="page-name">{section.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <div class="sidebar-divider"></div>
          <ul class="page-list">
            <li>
              <a href="/admin/cms/header" class="page-link">
                <span class="page-icon">📌</span>
                <span class="page-name">Header & Navigation</span>
              </a>
            </li>
            <li>
              <a href="/admin/cms/footer" class="page-link">
                <span class="page-icon">📎</span>
                <span class="page-name">Footer</span>
              </a>
            </li>
            <li>
              <a href="/admin/cms/settings" class="page-link">
                <span class="page-icon">⚙️</span>
                <span class="page-name">Site Settings</span>
              </a>
            </li>
            <li>
              <a href="/admin/cms/seo" class="page-link">
                <span class="page-icon">🔍</span>
                <span class="page-name">SEO Settings</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content - Preview */}
        <div class="cms-main">
          <div class="preview-header">
            <h2>Select a page to edit</h2>
            <p class="text-muted">Choose a page from the sidebar to view and edit its content</p>
          </div>

          <div class="sections-overview">
            <h3 style="margin-bottom: 20px;">Quick Access</h3>
            <div class="sections-grid">
              {SITE_SECTIONS.map(section => (
                <a href={`/admin/cms/${section.id}`} class="section-card">
                  <div class="section-icon">{section.icon}</div>
                  <div class="section-info">
                    <div class="section-name">{section.name}</div>
                    <div class="section-desc">{section.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cms-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 0;
          height: calc(100vh - 80px);
          margin: -20px;
          background: var(--bg-alt);
        }
        .cms-sidebar {
          background: white;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-header h3 {
          margin: 0;
          font-size: 14px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }
        .page-list {
          list-style: none;
          padding: 8px;
          margin: 0;
        }
        .page-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text);
          transition: all 0.2s;
        }
        .page-link:hover {
          background: var(--bg-alt);
        }
        .page-link.active {
          background: var(--primary-light);
          color: var(--primary);
        }
        .page-icon {
          font-size: 18px;
        }
        .page-name {
          font-size: 14px;
          font-weight: 500;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 16px;
        }

        .cms-main {
          padding: 24px;
          overflow-y: auto;
        }
        .preview-header {
          text-align: center;
          padding: 40px 20px;
        }
        .preview-header h2 {
          margin: 0 0 8px;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .section-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        .section-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .section-icon {
          font-size: 28px;
        }
        .section-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .section-desc {
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>
    </AdminLayout>
  );
};

// Homepage Editor
interface HomepageEditorProps {
  settings: Record<string, string>;
  categories: any[];
  popularItems: any[];
}

export const AdminCmsHomepagePage: FC<HomepageEditorProps> = ({ settings, categories, popularItems }) => {
  return (
    <AdminLayout title="Edit Homepage" currentPath="/admin/cms/homepage">
      <div class="cms-editor-layout">
        {/* Left Sidebar - Site Structure */}
        <div class="cms-sidebar">
          <div class="sidebar-header">
            <h3>Website Pages</h3>
          </div>
          <ul class="page-list">
            {SITE_SECTIONS.map(section => (
              <li>
                <a href={`/admin/cms/${section.id}`} class={`page-link ${section.id === 'homepage' ? 'active' : ''}`}>
                  <span class="page-icon">{section.icon}</span>
                  <span class="page-name">{section.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <div class="sidebar-divider"></div>
          <ul class="page-list">
            <li><a href="/admin/cms/header" class="page-link"><span class="page-icon">📌</span><span class="page-name">Header & Navigation</span></a></li>
            <li><a href="/admin/cms/footer" class="page-link"><span class="page-icon">📎</span><span class="page-name">Footer</span></a></li>
            <li><a href="/admin/cms/settings" class="page-link"><span class="page-icon">⚙️</span><span class="page-name">Site Settings</span></a></li>
          </ul>
        </div>

        {/* Center - Live Preview */}
        <div class="cms-preview">
          <div class="preview-toolbar">
            <div class="preview-title">Homepage Preview</div>
            <div class="preview-actions">
              <a href="/" target="_blank" class="btn btn-ghost btn-sm">View Live</a>
              <button onclick="saveChanges()" class="btn btn-primary btn-sm">Save Changes</button>
            </div>
          </div>
          <div class="preview-frame">
            <iframe id="preview-iframe" src="/?preview=true" style="width: 100%; height: 100%; border: none;"></iframe>
          </div>
        </div>

        {/* Right Sidebar - Edit Panel */}
        <div class="cms-editor">
          <div class="editor-header">
            <h3>Edit Homepage</h3>
          </div>

          <div class="editor-content">
            {/* Hero Section */}
            <div class="editor-section">
              <div class="section-header" onclick="toggleEditorSection('hero')">
                <span>🎯 Hero Section</span>
                <span class="toggle-icon">▼</span>
              </div>
              <div id="section-hero" class="section-content">
                <div class="form-group">
                  <label class="form-label">Hero Title</label>
                  <input type="text" id="hero-title" class="form-input" value={settings.hero_title || 'Welcome to Our Restaurant'} />
                </div>
                <div class="form-group">
                  <label class="form-label">Hero Subtitle</label>
                  <textarea id="hero-subtitle" class="form-textarea" rows={2}>{settings.hero_subtitle || 'Delicious food delivered fresh to your table'}</textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Hero Background Image</label>
                  <input type="text" id="hero-image" class="form-input" value={settings.hero_image || ''} placeholder="https://..." />
                </div>
                <div class="form-group">
                  <label class="form-label">CTA Button Text</label>
                  <input type="text" id="hero-cta" class="form-input" value={settings.hero_cta || 'Order Now'} />
                </div>
              </div>
            </div>

            {/* Featured Categories */}
            <div class="editor-section">
              <div class="section-header" onclick="toggleEditorSection('categories')">
                <span>📂 Featured Categories</span>
                <span class="toggle-icon">▼</span>
              </div>
              <div id="section-categories" class="section-content">
                <p class="form-hint">Select which categories to feature on homepage</p>
                {categories.map(cat => (
                  <div class="form-check">
                    <label class="flex items-center gap-2">
                      <input type="checkbox" name="featured_categories" value={cat.id} checked={cat.is_featured === 1} />
                      <span>{escapeHtml(cat.name)}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Items Section */}
            <div class="editor-section">
              <div class="section-header" onclick="toggleEditorSection('popular')">
                <span>🌟 Popular Items</span>
                <span class="toggle-icon">▼</span>
              </div>
              <div id="section-popular" class="section-content">
                <div class="form-group">
                  <label class="form-label">Section Title</label>
                  <input type="text" id="popular-title" class="form-input" value={settings.popular_title || 'Popular Items'} />
                </div>
                <div class="form-group">
                  <label class="form-label">Number of Items to Show</label>
                  <select id="popular-count" class="form-select">
                    <option value="4" selected={settings.popular_count === '4'}>4 Items</option>
                    <option value="6" selected={!settings.popular_count || settings.popular_count === '6'}>6 Items</option>
                    <option value="8" selected={settings.popular_count === '8'}>8 Items</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Promotions Banner */}
            <div class="editor-section">
              <div class="section-header" onclick="toggleEditorSection('promo')">
                <span>🎁 Promotions Banner</span>
                <span class="toggle-icon">▼</span>
              </div>
              <div id="section-promo" class="section-content">
                <div class="form-group">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" id="promo-enabled" checked={settings.promo_enabled !== '0'} />
                    <span>Show promotions banner</span>
                  </label>
                </div>
                <div class="form-group">
                  <label class="form-label">Banner Text</label>
                  <input type="text" id="promo-text" class="form-input" value={settings.promo_text || ''} placeholder="e.g., Free delivery on orders over $50!" />
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div class="editor-section">
              <div class="section-header" onclick="toggleEditorSection('testimonials')">
                <span>💬 Testimonials</span>
                <span class="toggle-icon">▼</span>
              </div>
              <div id="section-testimonials" class="section-content">
                <div class="form-group">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" id="testimonials-enabled" checked={settings.testimonials_enabled !== '0'} />
                    <span>Show testimonials section</span>
                  </label>
                </div>
                <div class="form-group">
                  <label class="form-label">Section Title</label>
                  <input type="text" id="testimonials-title" class="form-input" value={settings.testimonials_title || 'What Our Customers Say'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cms-editor-layout {
          display: grid;
          grid-template-columns: 240px 1fr 320px;
          gap: 0;
          height: calc(100vh - 80px);
          margin: -20px;
          background: var(--bg-alt);
        }
        .cms-sidebar {
          background: white;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-header h3 {
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }
        .page-list {
          list-style: none;
          padding: 8px;
          margin: 0;
        }
        .page-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--text);
          font-size: 13px;
          transition: all 0.2s;
        }
        .page-link:hover {
          background: var(--bg-alt);
        }
        .page-link.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }
        .page-icon {
          font-size: 16px;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 16px;
        }

        .cms-preview {
          display: flex;
          flex-direction: column;
          background: #e5e5e5;
        }
        .preview-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid var(--border);
        }
        .preview-title {
          font-weight: 600;
        }
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        .preview-frame {
          flex: 1;
          padding: 20px;
          overflow: hidden;
        }
        .preview-frame iframe {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .cms-editor {
          background: white;
          border-left: 1px solid var(--border);
          overflow-y: auto;
        }
        .editor-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .editor-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .editor-content {
          padding: 0;
        }
        .editor-section {
          border-bottom: 1px solid var(--border);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
        }
        .section-header:hover {
          background: var(--bg-alt);
        }
        .toggle-icon {
          font-size: 10px;
          color: var(--text-muted);
        }
        .section-content {
          padding: 0 20px 20px;
        }
        .form-group {
          margin-bottom: 14px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-muted);
        }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
        }
        .form-check {
          padding: 6px 0;
        }
        .form-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        function toggleEditorSection(id) {
          const content = document.getElementById('section-' + id);
          content.style.display = content.style.display === 'none' ? 'block' : 'none';
        }

        async function saveChanges() {
          const data = {
            hero_title: document.getElementById('hero-title').value,
            hero_subtitle: document.getElementById('hero-subtitle').value,
            hero_image: document.getElementById('hero-image').value,
            hero_cta: document.getElementById('hero-cta').value,
            popular_title: document.getElementById('popular-title').value,
            popular_count: document.getElementById('popular-count').value,
            promo_enabled: document.getElementById('promo-enabled').checked ? '1' : '0',
            promo_text: document.getElementById('promo-text').value,
            testimonials_enabled: document.getElementById('testimonials-enabled').checked ? '1' : '0',
            testimonials_title: document.getElementById('testimonials-title').value,
          };

          try {
            const res = await fetch('/api/cms/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              alert('Changes saved!');
              document.getElementById('preview-iframe').src = '/?preview=true&t=' + Date.now();
            } else {
              alert('Failed to save changes');
            }
          } catch (err) {
            alert('Error saving changes');
          }
        }
      `}} />
    </AdminLayout>
  );
};

// Site Settings Page
interface CmsSettingsPageProps {
  settings: Record<string, string>;
}

export const AdminCmsSettingsPage: FC<CmsSettingsPageProps> = ({ settings }) => {
  return (
    <AdminLayout title="Site Settings" currentPath="/admin/cms/settings">
      <div class="cms-editor-layout">
        {/* Left Sidebar */}
        <div class="cms-sidebar">
          <div class="sidebar-header">
            <h3>Website Pages</h3>
          </div>
          <ul class="page-list">
            {SITE_SECTIONS.map(section => (
              <li>
                <a href={`/admin/cms/${section.id}`} class="page-link">
                  <span class="page-icon">{section.icon}</span>
                  <span class="page-name">{section.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <div class="sidebar-divider"></div>
          <ul class="page-list">
            <li><a href="/admin/cms/header" class="page-link"><span class="page-icon">📌</span><span class="page-name">Header & Navigation</span></a></li>
            <li><a href="/admin/cms/footer" class="page-link"><span class="page-icon">📎</span><span class="page-name">Footer</span></a></li>
            <li><a href="/admin/cms/settings" class="page-link active"><span class="page-icon">⚙️</span><span class="page-name">Site Settings</span></a></li>
          </ul>
        </div>

        {/* Settings Form */}
        <div class="cms-settings-main">
          <div class="settings-header">
            <h2>Site Settings</h2>
            <button onclick="saveSettings()" class="btn btn-primary">Save Changes</button>
          </div>

          <form id="settings-form">
            <div class="settings-grid">
              {/* General */}
              <div class="settings-card">
                <h3>🏪 General Information</h3>
                <div class="form-group">
                  <label class="form-label">Restaurant Name</label>
                  <input type="text" name="restaurant_name" class="form-input" value={settings.restaurant_name || ''} placeholder="Your Restaurant Name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Tagline</label>
                  <input type="text" name="tagline" class="form-input" value={settings.tagline || ''} placeholder="Delicious food, delivered fresh" />
                </div>
                <div class="form-group">
                  <label class="form-label">Logo URL</label>
                  <input type="text" name="logo_url" class="form-input" value={settings.logo_url || ''} placeholder="https://..." />
                </div>
              </div>

              {/* Contact */}
              <div class="settings-card">
                <h3>📞 Contact Information</h3>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input type="text" name="phone" class="form-input" value={settings.phone || ''} placeholder="+1 234 567 8900" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" name="email" class="form-input" value={settings.email || ''} placeholder="info@restaurant.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Address</label>
                  <textarea name="address" class="form-textarea" rows={2} placeholder="123 Main St, City">{settings.address || ''}</textarea>
                </div>
              </div>

              {/* Social */}
              <div class="settings-card">
                <h3>🌐 Social Media</h3>
                <div class="form-group">
                  <label class="form-label">Facebook</label>
                  <input type="text" name="facebook_url" class="form-input" value={settings.facebook_url || ''} />
                </div>
                <div class="form-group">
                  <label class="form-label">Instagram</label>
                  <input type="text" name="instagram_url" class="form-input" value={settings.instagram_url || ''} />
                </div>
                <div class="form-group">
                  <label class="form-label">Twitter</label>
                  <input type="text" name="twitter_url" class="form-input" value={settings.twitter_url || ''} />
                </div>
              </div>

              {/* Theme */}
              <div class="settings-card">
                <h3>🎨 Theme & Branding</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Primary Color</label>
                    <input type="color" name="primary_color" class="form-input" value={settings.primary_color || '#E85D04'} style="height: 44px;" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Secondary Color</label>
                    <input type="color" name="secondary_color" class="form-input" value={settings.secondary_color || '#333333'} style="height: 44px;" />
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div class="settings-card">
                <h3>🕐 Operating Hours</h3>
                <div class="form-group">
                  <label class="form-label">Hours Display</label>
                  <textarea name="operating_hours" class="form-textarea" rows={4} placeholder="Mon-Fri: 9am - 10pm">{settings.operating_hours || ''}</textarea>
                </div>
              </div>

              {/* SEO */}
              <div class="settings-card">
                <h3>🔍 SEO</h3>
                <div class="form-group">
                  <label class="form-label">Meta Title</label>
                  <input type="text" name="meta_title" class="form-input" value={settings.meta_title || ''} />
                </div>
                <div class="form-group">
                  <label class="form-label">Meta Description</label>
                  <textarea name="meta_description" class="form-textarea" rows={2}>{settings.meta_description || ''}</textarea>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .cms-editor-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 0;
          height: calc(100vh - 80px);
          margin: -20px;
          background: var(--bg-alt);
        }
        .cms-sidebar {
          background: white;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-header h3 {
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
        }
        .page-list {
          list-style: none;
          padding: 8px;
          margin: 0;
        }
        .page-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--text);
          font-size: 13px;
          transition: all 0.2s;
        }
        .page-link:hover {
          background: var(--bg-alt);
        }
        .page-link.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }
        .page-icon {
          font-size: 16px;
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 16px;
        }

        .cms-settings-main {
          padding: 24px;
          overflow-y: auto;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .settings-header h2 {
          margin: 0;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .settings-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 20px;
        }
        .settings-card h3 {
          margin: 0 0 16px;
          font-size: 15px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        async function saveSettings() {
          const form = document.getElementById('settings-form');
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });

          try {
            const res = await fetch('/api/cms/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (res.ok) {
              alert('Settings saved!');
            } else {
              alert('Failed to save settings');
            }
          } catch (err) {
            alert('Error saving settings');
          }
        }
      `}} />
    </AdminLayout>
  );
};
