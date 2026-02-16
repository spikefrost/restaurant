import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MenuCard } from '../components/MenuCard';
import type { MenuItem, Category, Branch } from '../types';
import { escapeHtml, formatCurrency } from '../utils/helpers';

interface MenuPageProps {
  items: MenuItem[];
  categories: Category[];
  branches: Branch[];
  selectedCategory?: number;
  selectedBranch?: number;
  tableNumber?: string;
  searchQuery?: string;
}

export const MenuPage: FC<MenuPageProps> = ({
  items,
  categories,
  branches,
  selectedCategory,
  selectedBranch,
  tableNumber,
  searchQuery
}) => {
  const filteredItems = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items;

  const groupedItems = categories.map(cat => ({
    category: cat,
    items: filteredItems.filter(i => i.category_id === cat.id)
  })).filter(g => g.items.length > 0);

  const selectedBranchData = branches.find(b => b.id === selectedBranch);
  const itemsJson = JSON.stringify(items);

  return (
    <Layout title="Menu">
      <Header currentPath="/menu" />

      {/* Branch/Table Info Banner */}
      {(selectedBranch || tableNumber) && (
        <div style="background: var(--primary-light); color: white; padding: 12px 20px; text-align: center;">
          {selectedBranchData && (
            <span style="margin-right: 20px;">
              📍 {escapeHtml(selectedBranchData.name)}
            </span>
          )}
          {tableNumber && (
            <span>🪑 Table {escapeHtml(tableNumber)}</span>
          )}
        </div>
      )}

      <div class="container" style="padding-top: 30px; padding-bottom: 60px;">
        {/* Search */}
        <div style="margin-bottom: 24px;">
          <form action="/menu" method="GET" class="flex gap-2">
            {selectedBranch && <input type="hidden" name="branch" value={selectedBranch} />}
            {tableNumber && <input type="hidden" name="table" value={tableNumber} />}
            <input
              type="search"
              name="q"
              placeholder="Search menu..."
              value={searchQuery || ''}
              class="form-input"
              style="flex: 1;"
            />
            <button type="submit" class="btn btn-primary">Search</button>
          </form>
        </div>

        {/* Category Navigation */}
        <div class="category-nav">
          <a
            href={buildMenuUrl({ branch: selectedBranch, table: tableNumber })}
            class={`category-btn ${!selectedCategory ? 'active' : ''}`}
          >
            All Items
          </a>
          {categories.map(cat => (
            <a
              href={buildMenuUrl({ category: cat.id, branch: selectedBranch, table: tableNumber })}
              class={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {escapeHtml(cat.name)}
            </a>
          ))}
        </div>

        {/* Menu Items */}
        {groupedItems.length > 0 ? (
          groupedItems.map(group => (
            <div style="margin-bottom: 40px;" id={`category-${group.category.id}`}>
              <h2 class="section-title">{escapeHtml(group.category.name)}</h2>
              {group.category.description && (
                <p class="section-subtitle">{escapeHtml(group.category.description)}</p>
              )}
              <div class="menu-grid">
                {group.items.map(item => (
                  <MenuCard item={item} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3 class="empty-state-title">No items found</h3>
            <p class="empty-state-text">
              {searchQuery
                ? `No results for "${escapeHtml(searchQuery)}". Try a different search.`
                : 'No menu items available in this category.'}
            </p>
            <a href="/menu" class="btn btn-primary">View All Menu</a>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <div id="floating-cart" class="floating-cart" style="display: none;">
        <a href="/cart" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-lg); padding: 16px 24px;">
          🛒 View Cart (<span id="cart-total">0</span> items) - <span id="cart-amount">$0.00</span>
        </a>
      </div>

      {/* Item Customization Modal */}
      <div id="item-modal" class="modal-overlay" style="display: none;">
        <div class="modal item-modal">
          <button class="modal-close" onclick="window.closeItemModal()">×</button>
          <div class="modal-content">
            <div class="item-modal-header">
              <img id="modal-item-image" src="" alt="" class="item-modal-image" />
              <div class="item-modal-info">
                <h2 id="modal-item-name"></h2>
                <p id="modal-item-desc" class="text-muted"></p>
                <div class="item-modal-price">
                  <span id="modal-item-price"></span>
                  <span id="modal-item-calories" class="text-muted" style="font-size: 14px;"></span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div class="item-modal-section">
              <h4>Quantity</h4>
              <div class="quantity-selector">
                <button class="qty-btn" onclick="window.changeQuantity(-1)">−</button>
                <span id="item-quantity">1</span>
                <button class="qty-btn" onclick="window.changeQuantity(1)">+</button>
              </div>
            </div>

            {/* Customization Options - Dynamic based on item category */}
            <div id="customization-options"></div>

            {/* Special Instructions */}
            <div class="item-modal-section">
              <h4>Special Instructions</h4>
              <textarea
                id="special-instructions"
                class="form-textarea"
                placeholder="Any allergies or special requests?"
                rows={3}
              ></textarea>
            </div>

            {/* Add to Cart Button */}
            <div class="item-modal-footer">
              <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="window.addCustomizedItem()">
                Add to Order - <span id="modal-total-price">$0.00</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .floating-cart {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }

        .item-modal {
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 0;
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          z-index: 10;
        }

        .item-modal-header {
          position: relative;
        }

        .item-modal-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }

        .item-modal-info {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .item-modal-info h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .item-modal-price {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
        }

        .item-modal-section {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .item-modal-section h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .quantity-selector .qty-btn {
          width: 44px;
          height: 44px;
          border: 2px solid var(--border);
          background: white;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quantity-selector .qty-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .quantity-selector span {
          font-size: 20px;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .modifier-group {
          margin-bottom: 16px;
        }

        .modifier-group-title {
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modifier-required {
          font-size: 12px;
          color: var(--primary);
          font-weight: 500;
        }

        .modifier-option {
          display: flex;
          align-items: center;
          padding: 12px;
          background: var(--bg-alt);
          border-radius: var(--radius);
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modifier-option:hover {
          background: var(--border);
        }

        .modifier-option.selected {
          background: var(--primary-light);
          border: 2px solid var(--primary);
        }

        .modifier-option input {
          margin-right: 12px;
          width: 20px;
          height: 20px;
        }

        .modifier-option-info {
          flex: 1;
        }

        .modifier-option-name {
          font-weight: 500;
        }

        .modifier-option-price {
          color: var(--text-muted);
          font-size: 14px;
        }

        .item-modal-footer {
          padding: 20px;
          background: white;
          position: sticky;
          bottom: 0;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        const menuItems = ${itemsJson};
        const branchId = ${selectedBranch || 'null'};
        const tableNumber = ${tableNumber ? `'${tableNumber}'` : 'null'};

        let currentItem = null;
        let currentQuantity = 1;
        let selectedModifiers = [];

        // Item modifiers configuration by category
        const modifierConfig = {
          // Burgers
          1: [
            {
              name: 'Patty',
              required: true,
              type: 'radio',
              options: [
                { name: 'Single Patty', price: 0 },
                { name: 'Double Patty', price: 4.00 },
                { name: 'Triple Patty', price: 8.00 }
              ]
            },
            {
              name: 'Extras',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'Extra Cheese', price: 1.50 },
                { name: 'Bacon', price: 2.50 },
                { name: 'Avocado', price: 2.00 },
                { name: 'Fried Egg', price: 1.50 },
                { name: 'Jalapeños', price: 1.00 },
                { name: 'Caramelized Onions', price: 1.00 }
              ]
            },
            {
              name: 'Remove',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'No Lettuce', price: 0 },
                { name: 'No Tomato', price: 0 },
                { name: 'No Onion', price: 0 },
                { name: 'No Pickles', price: 0 },
                { name: 'No Sauce', price: 0 }
              ]
            }
          ],
          // Chicken
          2: [
            {
              name: 'Spice Level',
              required: true,
              type: 'radio',
              options: [
                { name: 'Mild', price: 0 },
                { name: 'Medium', price: 0 },
                { name: 'Hot', price: 0 },
                { name: 'Extra Hot', price: 0 }
              ]
            },
            {
              name: 'Dipping Sauce',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'BBQ Sauce', price: 0.50 },
                { name: 'Ranch', price: 0.50 },
                { name: 'Honey Mustard', price: 0.50 },
                { name: 'Buffalo Sauce', price: 0.50 },
                { name: 'Garlic Aioli', price: 0.50 }
              ]
            }
          ],
          // Pasta
          3: [
            {
              name: 'Pasta Type',
              required: true,
              type: 'radio',
              options: [
                { name: 'Spaghetti', price: 0 },
                { name: 'Penne', price: 0 },
                { name: 'Fettuccine', price: 0 },
                { name: 'Linguine', price: 0 },
                { name: 'Gluten-Free Pasta', price: 2.50 }
              ]
            },
            {
              name: 'Add Protein',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'Grilled Chicken', price: 4.00 },
                { name: 'Shrimp', price: 6.00 },
                { name: 'Italian Sausage', price: 4.00 },
                { name: 'Meatballs', price: 4.00 }
              ]
            }
          ],
          // Pizza
          4: [
            {
              name: 'Size',
              required: true,
              type: 'radio',
              options: [
                { name: 'Small (10")', price: 0 },
                { name: 'Medium (12")', price: 3.00 },
                { name: 'Large (14")', price: 6.00 },
                { name: 'Extra Large (16")', price: 9.00 }
              ]
            },
            {
              name: 'Crust',
              required: true,
              type: 'radio',
              options: [
                { name: 'Classic', price: 0 },
                { name: 'Thin Crust', price: 0 },
                { name: 'Thick Crust', price: 1.50 },
                { name: 'Stuffed Crust', price: 3.00 },
                { name: 'Gluten-Free Crust', price: 3.50 }
              ]
            },
            {
              name: 'Extra Toppings',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'Extra Cheese', price: 2.00 },
                { name: 'Pepperoni', price: 2.00 },
                { name: 'Mushrooms', price: 1.50 },
                { name: 'Olives', price: 1.50 },
                { name: 'Bell Peppers', price: 1.50 },
                { name: 'Jalapeños', price: 1.50 },
                { name: 'Pineapple', price: 1.50 },
                { name: 'Anchovies', price: 2.00 }
              ]
            }
          ],
          // Sides
          5: [
            {
              name: 'Size',
              required: false,
              type: 'radio',
              options: [
                { name: 'Regular', price: 0 },
                { name: 'Large', price: 2.00 }
              ]
            }
          ],
          // Drinks
          6: [
            {
              name: 'Size',
              required: true,
              type: 'radio',
              options: [
                { name: 'Small', price: 0 },
                { name: 'Medium', price: 1.00 },
                { name: 'Large', price: 2.00 }
              ]
            },
            {
              name: 'Ice',
              required: false,
              type: 'radio',
              options: [
                { name: 'Regular Ice', price: 0 },
                { name: 'Light Ice', price: 0 },
                { name: 'No Ice', price: 0 }
              ]
            }
          ],
          // Desserts
          7: [
            {
              name: 'Add-ons',
              required: false,
              type: 'checkbox',
              options: [
                { name: 'Extra Whipped Cream', price: 1.00 },
                { name: 'Chocolate Sauce', price: 0.75 },
                { name: 'Caramel Sauce', price: 0.75 },
                { name: 'Extra Ice Cream Scoop', price: 2.00 }
              ]
            }
          ],
          // Alcoholic Beverages (Beer)
          8: [],
          // Wine
          9: [
            {
              name: 'Size',
              required: true,
              type: 'radio',
              options: [
                { name: 'Glass', price: 0 },
                { name: 'Half Bottle', price: 15.00 },
                { name: 'Full Bottle', price: 28.00 }
              ]
            }
          ],
          // Cocktails
          10: [
            {
              name: 'Strength',
              required: false,
              type: 'radio',
              options: [
                { name: 'Regular', price: 0 },
                { name: 'Strong (Double Shot)', price: 4.00 }
              ]
            }
          ]
        };

        function getItemById(id) {
          return menuItems.find(item => item.id === id);
        }

        window.openItemModal = function(itemId) {
          currentItem = getItemById(itemId);
          if (!currentItem) {
            console.error('Item not found:', itemId);
            return;
          }

          currentQuantity = 1;
          selectedModifiers = [];

          // Update modal content
          document.getElementById('modal-item-image').src = currentItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
          document.getElementById('modal-item-name').textContent = currentItem.name;
          document.getElementById('modal-item-desc').textContent = currentItem.description;
          document.getElementById('modal-item-price').textContent = '$' + currentItem.price.toFixed(2);
          document.getElementById('modal-item-calories').textContent = currentItem.calories ? currentItem.calories + ' cal' : '';
          document.getElementById('item-quantity').textContent = currentQuantity;
          document.getElementById('special-instructions').value = '';

          // Generate customization options
          generateModifierOptions(currentItem.category_id);

          // Update total
          updateModalTotal();

          // Show modal
          document.getElementById('item-modal').style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }

        window.closeItemModal = function() {
          document.getElementById('item-modal').style.display = 'none';
          document.body.style.overflow = 'auto';
          currentItem = null;
        };

        function generateModifierOptions(categoryId) {
          const container = document.getElementById('customization-options');
          const modifiers = modifierConfig[categoryId] || [];

          if (modifiers.length === 0) {
            container.innerHTML = '';
            return;
          }

          let html = '<div class="item-modal-section"><h4>Customize Your Order</h4>';

          modifiers.forEach((group, groupIndex) => {
            html += '<div class="modifier-group">';
            html += '<div class="modifier-group-title">' + group.name;
            if (group.required) {
              html += '<span class="modifier-required">Required</span>';
            }
            html += '</div>';

            group.options.forEach((option, optionIndex) => {
              const inputType = group.type === 'radio' ? 'radio' : 'checkbox';
              const inputName = 'modifier-' + groupIndex;
              const inputId = 'mod-' + groupIndex + '-' + optionIndex;
              const checked = group.type === 'radio' && optionIndex === 0 ? 'checked' : '';

              html += '<label class="modifier-option" for="' + inputId + '">';
              html += '<input type="' + inputType + '" name="' + inputName + '" id="' + inputId + '" ';
              html += 'value="' + optionIndex + '" data-group="' + groupIndex + '" ';
              html += 'data-price="' + option.price + '" data-name="' + option.name + '" ';
              html += 'onchange="window.updateModifierSelection()" ' + checked + '>';
              html += '<div class="modifier-option-info">';
              html += '<div class="modifier-option-name">' + option.name + '</div>';
              if (option.price > 0) {
                html += '<div class="modifier-option-price">+$' + option.price.toFixed(2) + '</div>';
              }
              html += '</div>';
              html += '</label>';
            });

            html += '</div>';
          });

          html += '</div>';
          container.innerHTML = html;

          // Initialize selected modifiers with default selections
          updateModifierSelection();
        }

        window.updateModifierSelection = function() {
          selectedModifiers = [];
          const inputs = document.querySelectorAll('#customization-options input:checked');
          inputs.forEach(input => {
            selectedModifiers.push({
              name: input.dataset.name,
              price: parseFloat(input.dataset.price)
            });
          });
          updateModalTotal();
        };

        window.changeQuantity = function(delta) {
          currentQuantity = Math.max(1, currentQuantity + delta);
          document.getElementById('item-quantity').textContent = currentQuantity;
          updateModalTotal();
        };

        function updateModalTotal() {
          if (!currentItem) return;

          let total = currentItem.price;
          selectedModifiers.forEach(mod => {
            total += mod.price;
          });
          total *= currentQuantity;

          document.getElementById('modal-total-price').textContent = '$' + total.toFixed(2);
        }

        window.addCustomizedItem = function() {
          if (!currentItem) {
            console.error('No current item');
            return;
          }

          const specialInstructions = document.getElementById('special-instructions').value;

          let cart = [];
          try {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
          } catch(e) {
            console.error('Error parsing cart:', e);
            cart = [];
          }

          // Create cart item with modifiers
          const cartItem = {
            itemId: currentItem.id,
            quantity: currentQuantity,
            modifiers: selectedModifiers.filter(m => m.price > 0 || !m.name.startsWith('No ')),
            notes: specialInstructions,
            branchId,
            tableNumber
          };

          cart.push(cartItem);

          try {
            localStorage.setItem('cart', JSON.stringify(cart));
          } catch(e) {
            console.error('Error saving cart:', e);
            alert('Unable to save cart. Please check your browser settings.');
            return;
          }

          window.closeItemModal();
          updateCartDisplay();

          // Show confirmation
          showToast(currentItem.name + ' added to cart!');
        };

        function showToast(message) {
          const toast = document.createElement('div');
          toast.className = 'toast';
          toast.textContent = message;
          toast.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: var(--dark); color: white; padding: 12px 24px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s;';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2000);
        }

        function updateCartDisplay() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);

          // Calculate total amount
          let totalAmount = 0;
          cart.forEach(cartItem => {
            const item = getItemById(cartItem.itemId);
            if (item) {
              let itemTotal = item.price;
              if (cartItem.modifiers) {
                cartItem.modifiers.forEach(mod => {
                  itemTotal += mod.price || 0;
                });
              }
              totalAmount += itemTotal * cartItem.quantity;
            }
          });

          const badge = document.querySelector('.cart-badge');
          if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
          }

          const floatingCart = document.getElementById('floating-cart');
          const cartTotal = document.getElementById('cart-total');
          const cartAmount = document.getElementById('cart-amount');
          if (floatingCart && cartTotal) {
            floatingCart.style.display = count > 0 ? 'block' : 'none';
            cartTotal.textContent = count;
            if (cartAmount) {
              cartAmount.textContent = '$' + totalAmount.toFixed(2);
            }
          }
        }

        // Close modal when clicking outside
        document.getElementById('item-modal').addEventListener('click', function(e) {
          if (e.target === this) {
            closeItemModal();
          }
        });

        // Initialize
        updateCartDisplay();
      `}} />
    </Layout>
  );
};

function buildMenuUrl(params: { category?: number; branch?: number; table?: string }): string {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category.toString());
  if (params.branch) searchParams.set('branch', params.branch.toString());
  if (params.table) searchParams.set('table', params.table);
  const query = searchParams.toString();
  return '/menu' + (query ? `?${query}` : '');
}
