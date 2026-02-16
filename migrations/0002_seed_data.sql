-- Migration: 002_seed_data
-- Description: Seed initial data for Restaurant Tool
-- Created: 2026-02-16

-- Seed branches
INSERT INTO branches (name, address, phone, email, opening_hours, closing_hours, is_active, features, created_at) VALUES
('Downtown Branch', '123 Main Street, Downtown District', '+971 4 123 4567', 'downtown@restaurant.ae', '10:00', '23:00', 1, 'Dine-in,Takeaway,Outdoor Seating,Free WiFi', datetime('now')),
('Marina Branch', '456 Marina Walk, Dubai Marina', '+971 4 234 5678', 'marina@restaurant.ae', '11:00', '00:00', 1, 'Dine-in,Takeaway,Delivery,Kids Area', datetime('now'));

-- Seed categories
INSERT INTO categories (name, description, image_url, sort_order, is_active) VALUES
('Burgers', 'Premium handcrafted burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, 1),
('Chicken', 'Crispy and grilled chicken dishes', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 2, 1),
('Pasta', 'Authentic Italian pasta dishes', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 3, 1),
('Pizza', 'Wood-fired artisan pizzas', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 4, 1),
('Sides', 'Delicious sides and appetizers', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400', 5, 1),
('Drinks', 'Refreshing beverages', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400', 6, 1),
('Desserts', 'Sweet treats', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', 7, 1),
('Starters', 'Delicious appetizers to start your meal', 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop', 1, 1),
('Beer', 'Selection of craft and imported beers', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop', 8, 1),
('Wine', 'Fine wines from around the world', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', 9, 1),
('Cocktails', 'Signature cocktails and classic mixes', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop', 10, 1);

-- Seed menu items (Burgers)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(1, 'Classic Cheeseburger', 'Angus beef patty, American cheese, lettuce, tomato, pickles, special sauce', 12.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, 1, 0, 650, 0, 0, 0),
(1, 'Bacon BBQ Burger', 'Angus beef, crispy bacon, cheddar, onion rings, BBQ sauce', 14.99, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', 1, 1, 0, 850, 0, 0, 0),
(1, 'Mushroom Swiss Burger', 'Angus beef, sauteed mushrooms, Swiss cheese, garlic aioli', 13.99, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', 1, 0, 0, 720, 0, 0, 0),
(1, 'Wagyu Deluxe', 'Premium Wagyu beef, truffle aioli, aged cheddar, caramelized onions', 24.99, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', 1, 1, 1, 900, 0, 0, 0),
(1, 'Veggie Burger', 'Plant-based patty, avocado, tomato, lettuce, vegan mayo', 11.99, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', 1, 0, 0, 480, 1, 1, 0);

-- Seed menu items (Chicken)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(2, 'Crispy Fried Chicken', '4 pieces of golden crispy fried chicken, served with coleslaw', 13.99, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', 1, 1, 0, 720, 0, 0, 0),
(2, 'Grilled Chicken Breast', 'Herb-marinated grilled chicken breast with roasted vegetables', 14.99, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', 1, 0, 0, 420, 0, 0, 1),
(2, 'Chicken Tenders', 'Crispy chicken tenders with honey mustard dipping sauce', 10.99, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', 1, 1, 0, 580, 0, 0, 0),
(2, 'Buffalo Wings', '10 spicy buffalo wings with blue cheese dip and celery', 12.99, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', 1, 1, 0, 680, 0, 0, 1),
(2, 'Chicken Parmesan', 'Breaded chicken cutlet, marinara sauce, melted mozzarella', 16.99, 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400', 1, 0, 1, 750, 0, 0, 0);

-- Seed menu items (Pasta)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(3, 'Spaghetti Carbonara', 'Classic carbonara with pancetta, egg, and Parmesan', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', 1, 1, 0, 680, 0, 0, 0),
(3, 'Fettuccine Alfredo', 'Creamy Alfredo sauce with fettuccine pasta', 12.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400', 1, 1, 0, 720, 1, 0, 0),
(3, 'Penne Arrabbiata', 'Spicy tomato sauce with garlic and red chili', 11.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 1, 0, 0, 520, 1, 1, 0),
(3, 'Lasagna Bolognese', 'Layers of pasta, meat sauce, and melted cheese', 15.99, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400', 1, 1, 0, 820, 0, 0, 0),
(3, 'Seafood Linguine', 'Mixed seafood in white wine garlic sauce', 18.99, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', 1, 0, 1, 650, 0, 0, 0);

-- Seed menu items (Pizza)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(4, 'Margherita', 'Fresh mozzarella, basil, tomato sauce', 10.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 1, 1, 0, 580, 1, 0, 0),
(4, 'Pepperoni', 'Classic pepperoni with mozzarella cheese', 12.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 1, 1, 0, 680, 0, 0, 0),
(4, 'BBQ Chicken', 'BBQ sauce, grilled chicken, red onions, cilantro', 13.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 1, 0, 0, 720, 0, 0, 0),
(4, 'Vegetarian Supreme', 'Bell peppers, mushrooms, olives, onions, tomatoes', 12.99, 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=400', 1, 0, 0, 620, 1, 0, 0),
(4, 'Meat Lovers', 'Pepperoni, sausage, bacon, ham', 15.99, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400', 1, 1, 0, 820, 0, 0, 0);

-- Seed menu items (Sides)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(5, 'French Fries', 'Golden crispy fries with sea salt', 4.99, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 1, 1, 0, 320, 1, 1, 1),
(5, 'Onion Rings', 'Crispy battered onion rings', 5.99, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', 1, 1, 0, 380, 1, 0, 0),
(5, 'Mozzarella Sticks', '6 pieces with marinara sauce', 7.99, 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400', 1, 0, 0, 420, 1, 0, 0),
(5, 'Caesar Salad', 'Romaine lettuce, croutons, Parmesan, Caesar dressing', 8.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 1, 0, 0, 280, 1, 0, 0),
(5, 'Garlic Bread', 'Toasted bread with garlic butter and herbs', 4.99, 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400', 1, 1, 0, 220, 1, 0, 0);

-- Seed menu items (Drinks)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(6, 'Coca-Cola', 'Classic Coca-Cola', 2.99, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 1, 1, 0, 140, 1, 1, 1),
(6, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 1, 1, 0, 110, 1, 1, 1),
(6, 'Lemonade', 'Homemade fresh lemonade', 3.99, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400', 1, 0, 0, 120, 1, 1, 1),
(6, 'Iced Tea', 'Refreshing iced tea', 2.99, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', 1, 0, 0, 90, 1, 1, 1),
(6, 'Milkshake', 'Choose from vanilla, chocolate, or strawberry', 5.99, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 1, 1, 0, 420, 1, 0, 1);

-- Seed menu items (Desserts)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(7, 'Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 6.99, 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400', 1, 1, 0, 520, 1, 0, 0),
(7, 'Cheesecake', 'New York style cheesecake with berry compote', 7.99, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', 1, 1, 0, 480, 1, 0, 0),
(7, 'Tiramisu', 'Classic Italian tiramisu', 7.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 1, 0, 0, 420, 1, 0, 0),
(7, 'Apple Pie', 'Warm apple pie with cinnamon', 6.99, 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400', 1, 0, 1, 380, 1, 0, 0),
(7, 'Ice Cream Sundae', 'Three scoops with chocolate sauce and nuts', 5.99, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 1, 1, 0, 450, 1, 0, 1);

-- Seed menu items (Starters)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(8, 'Bruschetta', 'Toasted bread topped with tomatoes, basil, and garlic', 7.99, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', 1, 1, 0, 220, 1, 1, 0),
(8, 'Calamari Rings', 'Crispy fried calamari with marinara sauce', 10.99, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', 1, 1, 0, 380, 0, 0, 0),
(8, 'Hummus Platter', 'Classic hummus with pita bread and vegetables', 8.99, 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop', 1, 0, 0, 280, 1, 1, 0),
(8, 'Nachos Supreme', 'Loaded nachos with cheese, jalapenos, and sour cream', 9.99, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', 1, 1, 0, 480, 1, 0, 1),
(8, 'Spinach & Artichoke Dip', 'Creamy dip served with tortilla chips', 8.99, 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop', 1, 0, 0, 320, 1, 0, 1);

-- Seed menu items (Beer)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(9, 'Heineken', 'Premium lager beer, 330ml', 5.99, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop', 1, 1, 0, 140, 1, 1, 0),
(9, 'Corona Extra', 'Mexican pale lager, 330ml', 6.99, 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400&h=300&fit=crop', 1, 1, 0, 150, 1, 1, 0),
(9, 'Guinness Draught', 'Irish dry stout, 440ml', 7.99, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop', 1, 0, 0, 210, 1, 1, 0),
(9, 'Stella Artois', 'Belgian pilsner, 330ml', 6.99, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop', 1, 1, 0, 145, 1, 1, 0),
(9, 'Local Craft IPA', 'Hoppy craft beer from local brewery, 400ml', 8.99, 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=400&h=300&fit=crop', 1, 0, 1, 180, 1, 1, 0);

-- Seed menu items (Wine)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(10, 'Cabernet Sauvignon', 'Full-bodied red wine, glass', 8.99, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', 1, 1, 0, 125, 1, 1, 1),
(10, 'Chardonnay', 'Crisp white wine, glass', 7.99, 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=300&fit=crop', 1, 1, 0, 120, 1, 1, 1),
(10, 'Pinot Noir', 'Medium-bodied red wine, glass', 9.99, 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=300&fit=crop', 1, 0, 0, 125, 1, 1, 1),
(10, 'Sauvignon Blanc', 'Light and refreshing white wine, glass', 7.99, 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop', 1, 1, 0, 120, 1, 1, 1),
(10, 'Rosé', 'Elegant pink wine, glass', 8.99, 'https://images.unsplash.com/photo-1534655882117-f9eff36a1574?w=400&h=300&fit=crop', 1, 0, 1, 125, 1, 1, 1);

-- Seed menu items (Cocktails)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new, calories, is_vegetarian, is_vegan, is_gluten_free) VALUES
(11, 'Mojito', 'Rum, mint, lime, sugar, soda water', 9.99, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop', 1, 1, 0, 168, 1, 1, 1),
(11, 'Margarita', 'Tequila, triple sec, lime juice', 10.99, 'https://images.unsplash.com/photo-1582837611539-e3020079eab6?w=400&h=300&fit=crop', 1, 1, 0, 190, 1, 1, 1),
(11, 'Old Fashioned', 'Bourbon, sugar, bitters, orange peel', 11.99, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop', 1, 0, 0, 154, 1, 1, 1),
(11, 'Cosmopolitan', 'Vodka, cranberry juice, lime, triple sec', 10.99, 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop', 1, 1, 0, 146, 1, 1, 1),
(11, 'Espresso Martini', 'Vodka, coffee liqueur, fresh espresso', 12.99, 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=400&h=300&fit=crop', 1, 0, 1, 220, 1, 0, 1);

-- Seed loyalty tiers
INSERT INTO loyalty_tiers (name, min_points, points_multiplier, benefits, color, icon, sort_order, is_active) VALUES
('Bronze', 0, 1.0, 'Welcome bonus, Birthday rewards', '#CD7F32', '🥉', 1, 1),
('Silver', 500, 1.5, 'All Bronze benefits, 1.5x points multiplier, Exclusive offers', '#C0C0C0', '🥈', 2, 1),
('Gold', 1500, 2.0, 'All Silver benefits, 2x points multiplier, Priority reservations, Free delivery', '#FFD700', '🥇', 3, 1),
('Platinum', 3000, 3.0, 'All Gold benefits, 3x points multiplier, VIP events access, Personal concierge', '#E5E5E5', '💎', 4, 1);

-- Seed CMS settings
INSERT INTO cms_settings (key, value) VALUES
('site_name', 'Smart Restaurant'),
('site_description', 'Your favorite dining experience'),
('theme_primary_color', '#E85D04'),
('theme_secondary_color', '#0B9444'),
('currency_symbol', 'AED'),
('currency_code', 'AED'),
('tax_percentage', '5'),
('delivery_fee', '10'),
('min_order_amount', '50'),
('operating_hours_weekday', '10:00 - 23:00'),
('operating_hours_weekend', '11:00 - 00:00'),
('contact_email', 'info@smartrestaurant.ae'),
('contact_phone', '+971 4 123 4567'),
('social_facebook', 'https://facebook.com/smartrestaurant'),
('social_instagram', 'https://instagram.com/smartrestaurant'),
('social_twitter', 'https://twitter.com/smartrestaurant'),
('whatsapp_number', '971501234567'),
('google_maps_url', 'https://maps.google.com/?q=SmartRestaurant'),
('app_store_url', 'https://apps.apple.com/app/smart-restaurant'),
('play_store_url', 'https://play.google.com/store/apps/details?id=com.smartrestaurant');

-- Seed default admin user
-- Password is 'admin123' (you should change this after setup)
INSERT INTO admin_users (username, password_hash, role) VALUES
('admin', '$2a$10$YourHashedPasswordHere', 'admin');

-- Seed initial points earning rule
INSERT INTO points_earning_rules (name, description, trigger_type, points_type, points_value, tier_multiplier_enabled, is_active) VALUES
('Standard Purchase Points', 'Earn 1 point for every AED spent', 'order_completed', 'fixed_per_currency', 1, 1, 1);

-- Seed default email templates
INSERT INTO email_templates (name, subject, body_html, variables, category, is_active) VALUES
('Welcome Email', 'Welcome to Smart Restaurant!',
'<h2>Welcome {{customer_name}}!</h2><p>Thank you for joining our loyalty program. You are now a {{tier_name}} member.</p>',
'["customer_name", "tier_name"]', 'customer', 1),
('Order Confirmation', 'Order Confirmed #{{order_number}}',
'<h2>Thank you for your order!</h2><p>Your order #{{order_number}} has been confirmed and is being prepared.</p><p>Total: {{currency}} {{total}}</p>',
'["order_number", "currency", "total", "items"]', 'order', 1),
('Points Earned', 'You earned {{points}} points!',
'<h2>Great news!</h2><p>You just earned {{points}} points for your recent order. Your new balance is {{balance}} points.</p>',
'["points", "balance", "order_number"]', 'loyalty', 1);

-- Seed default SMS templates
INSERT INTO sms_templates (name, body, variables, category, character_count, is_active) VALUES
('Order Ready', 'Your order #{{order_number}} is ready for pickup!', '["order_number"]', 'order', 47, 1),
('Points Earned', 'You earned {{points}} points! Balance: {{balance}}', '["points", "balance"]', 'loyalty', 48, 1),
('Promo Code', 'Use code {{code}} for {{discount}}% off your next order!', '["code", "discount"]', 'marketing', 56, 1);