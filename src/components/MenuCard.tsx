import type { FC } from 'hono/jsx';
import type { MenuItem } from '../types';
import { escapeHtml, formatCurrency } from '../utils/helpers';

interface MenuCardProps {
  item: MenuItem;
  showAddButton?: boolean;
}

export const MenuCard: FC<MenuCardProps> = ({ item, showAddButton = true }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  return (
    <div class="menu-item fade-in" onclick={`window.openItemModal(${item.id})`} style="cursor: pointer;">
      <img
        src={item.image_url || defaultImage}
        alt={escapeHtml(item.name)}
        class="menu-item-img"
        loading="lazy"
      />
      <div class="menu-item-info">
        <div class="menu-item-badges">
          {item.is_popular === 1 && <span class="badge badge-popular">Popular</span>}
          {item.is_new === 1 && <span class="badge badge-new">New</span>}
          {item.is_vegetarian === 1 && <span class="badge badge-veg">V</span>}
          {item.is_vegan === 1 && <span class="badge badge-vegan">VG</span>}
          {item.is_gluten_free === 1 && <span class="badge badge-gf">GF</span>}
        </div>
        <h3 class="menu-item-name">{escapeHtml(item.name)}</h3>
        <p class="menu-item-desc">{escapeHtml(item.description)}</p>
        <div class="menu-item-meta">
          <span class="menu-item-price">{formatCurrency(item.price)}</span>
          {showAddButton && (
            <button
              class="btn btn-primary btn-sm"
              onclick={`event.stopPropagation(); window.openItemModal(${item.id})`}
            >
              Add +
            </button>
          )}
        </div>
        {item.calories > 0 && (
          <span class="text-muted" style="font-size: 12px; margin-top: 4px;">
            {item.calories} cal
          </span>
        )}
      </div>
    </div>
  );
};

export const MenuCardGrid: FC<MenuCardProps> = ({ item }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  return (
    <div class="card fade-in" onclick={`window.openItemModal(${item.id})`} style="cursor: pointer;">
      <img
        src={item.image_url || defaultImage}
        alt={escapeHtml(item.name)}
        class="card-img"
        loading="lazy"
      />
      <div class="card-body">
        <div class="menu-item-badges mb-1">
          {item.is_popular === 1 && <span class="badge badge-popular">Popular</span>}
          {item.is_new === 1 && <span class="badge badge-new">New</span>}
        </div>
        <h3 class="card-title">{escapeHtml(item.name)}</h3>
        <p class="card-text">{escapeHtml(item.description)}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="card-price">{formatCurrency(item.price)}</span>
          <button
            class="btn btn-primary btn-sm"
            onclick={`event.stopPropagation(); window.openItemModal(${item.id})`}
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
};
