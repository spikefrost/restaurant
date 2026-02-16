export const styles = `
:root {
  --primary: #E85D04;
  --primary-dark: #DC2F02;
  --primary-light: #F48C06;
  --secondary: #FFBA08;
  --accent: #FAA307;
  --dark: #370617;
  --dark-light: #6A040F;
  --text: #1a1a1a;
  --text-light: #666;
  --text-muted: #999;
  --bg: #FFFBF5;
  --bg-alt: #FFF5EB;
  --white: #ffffff;
  --border: #ffe4cc;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --shadow: 0 2px 8px rgba(232, 93, 4, 0.12);
  --shadow-lg: 0 8px 24px rgba(232, 93, 4, 0.15);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--primary-dark);
}

img {
  max-width: 100%;
  height: auto;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container-sm {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: var(--white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: var(--text);
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}

.nav-link:hover, .nav-link.active {
  color: var(--primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
  border-radius: 3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  position: relative;
  background: var(--bg-alt);
  border: none;
  padding: 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.cart-btn:hover {
  background: var(--border);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 12px rgba(232, 93, 4, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 93, 4, 0.4);
  color: white;
}

.btn-secondary {
  background: var(--white);
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-secondary:hover {
  background: var(--bg-alt);
}

.btn-ghost {
  background: transparent;
  color: var(--text);
}

.btn-ghost:hover {
  background: var(--bg-alt);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 17px;
}

.btn-icon {
  padding: 10px;
  min-width: 44px;
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-danger {
  background: var(--error);
  color: white;
}

/* Order Online - Elegant CTA Section */
.order-cta-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  padding: 80px 20px;
  position: relative;
  overflow: hidden;
}

.order-cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(232, 93, 4, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.order-cta-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.order-cta-content {
  color: white;
}

.order-cta-badge {
  display: inline-block;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 24px;
}

.order-cta-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.order-cta-subtitle {
  font-size: 18px;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 440px;
}

.order-cta-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.order-cta-btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(232, 93, 4, 0.4);
}

.order-cta-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(232, 93, 4, 0.5);
  color: white;
}

.order-cta-btn-primary .btn-icon {
  font-size: 18px;
}

.order-cta-btn-secondary {
  background: transparent;
  color: white;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: var(--radius);
  transition: all 0.3s;
}

.order-cta-btn-secondary:hover {
  border-color: white;
  background: rgba(255,255,255,0.1);
  color: white;
}

.order-cta-features {
  display: flex;
  gap: 24px;
}

.order-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.feature-check {
  color: var(--secondary);
  font-weight: bold;
}

.order-cta-visual {
  position: relative;
}

.order-cta-image-wrapper {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.order-cta-image {
  width: 100%;
  height: 450px;
  object-fit: cover;
  display: block;
}

.order-cta-badge-float {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.badge-discount {
  background: var(--primary);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
}

.badge-text {
  font-weight: 600;
  color: var(--dark);
  font-size: 14px;
}

@media (max-width: 968px) {
  .order-cta-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .order-cta-title {
    font-size: 36px;
  }

  .order-cta-subtitle {
    max-width: 100%;
  }

  .order-cta-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .order-cta-features {
    justify-content: center;
    flex-wrap: wrap;
  }

  .order-cta-visual {
    order: -1;
  }

  .order-cta-image {
    height: 300px;
  }
}

/* Club Banner */
.club-banner {
  background: linear-gradient(90deg, #b8860b 0%, #8b6914 100%);
  padding: 12px 20px;
}

.club-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.club-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.club-icon {
  font-size: 28px;
}

.club-text {
  display: flex;
  flex-direction: column;
  color: white;
}

.club-text strong {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.club-text span {
  font-size: 12px;
  opacity: 0.9;
}

.club-banner-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.club-rating {
  color: white;
  font-size: 12px;
}

.club-btn {
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
}

.club-btn:hover {
  background: white;
  color: #b8860b;
}

@media (max-width: 768px) {
  .club-banner-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .club-banner-left {
    flex-direction: column;
    gap: 8px;
  }

  .club-banner-right {
    flex-direction: column;
    gap: 10px;
  }
}

/* Hero Carousel */
.hero-carousel {
  position: relative;
  height: 450px;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.5s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.carousel-slide.active {
  display: flex;
  opacity: 1;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
}

.carousel-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 40px;
  max-width: 800px;
}

.carousel-content h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.carousel-content h2 {
  font-size: 36px;
  font-weight: 300;
  margin-bottom: 16px;
  opacity: 0.9;
}

.carousel-content p {
  font-size: 18px;
  opacity: 0.8;
  margin-bottom: 30px;
}

.btn-carousel {
  background: white;
  color: #1a1a2e;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  border: none;
}

.btn-carousel:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.carousel-dots {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-dot.active {
  background: white;
  transform: scale(1.2);
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 10;
}

.carousel-nav:hover {
  background: rgba(255,255,255,0.3);
}

.carousel-prev {
  left: 20px;
}

.carousel-next {
  right: 20px;
}

@media (max-width: 992px) {
  .carousel-image-left,
  .carousel-image-right {
    display: none;
  }

  .carousel-content {
    flex: 1;
  }

  .carousel-content h1 {
    font-size: 36px;
  }

  .carousel-content h2 {
    font-size: 24px;
  }
}

@media (max-width: 576px) {
  .hero-carousel {
    height: 350px;
  }

  .carousel-content h1 {
    font-size: 28px;
  }

  .carousel-content h2 {
    font-size: 20px;
  }

  .carousel-content p {
    font-size: 14px;
  }

  .carousel-nav {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .carousel-dots {
    bottom: 70px;
  }
}

/* Booking Section */
.booking-section {
  background: white;
  padding: 0;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
  position: relative;
  z-index: 20;
  margin-top: -60px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 8px 8px 0 0;
}

.booking-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.booking-tab {
  padding: 16px 32px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.booking-tab:hover {
  color: var(--primary);
}

.booking-tab.active {
  color: var(--dark);
  font-weight: 600;
}

.booking-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
}

.booking-content {
  padding: 20px;
}

.booking-form {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.booking-field {
  display: flex;
  align-items: center;
}

.booking-field.search-field {
  flex: 1;
  min-width: 180px;
}

.booking-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}

.booking-select {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;
}

/* Custom Select Dropdown */
.custom-select {
  position: relative;
  min-width: 120px;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.custom-select-trigger:hover {
  border-color: var(--primary);
}

.custom-select.open .custom-select-trigger {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.select-value {
  font-weight: 500;
  color: var(--text);
}

.select-arrow {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.custom-select.open .select-arrow {
  transform: rotate(180deg);
}

.custom-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.custom-select.open .custom-select-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.custom-select-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
}

.custom-select-option:hover {
  background: var(--bg-alt);
}

.custom-select-option.selected {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.custom-select-option:first-child {
  border-radius: 7px 7px 0 0;
}

.custom-select-option:last-child {
  border-radius: 0 0 7px 7px;
}

.location-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.location-btn:hover {
  background: #f5f5f5;
}

.booking-submit {
  padding: 12px 24px;
}

.find-form {
  display: flex;
  justify-content: center;
}

.find-search {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.find-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .booking-section {
    margin-top: -40px;
    margin-left: 16px;
    margin-right: 16px;
  }

  .booking-form {
    flex-direction: column;
  }

  .booking-field {
    width: 100%;
  }

  .booking-field.search-field {
    min-width: auto;
  }

  .booking-input,
  .booking-select {
    width: 100%;
  }

  .booking-submit {
    width: 100%;
  }

  .find-search {
    flex-direction: column;
  }
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff, var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.hero-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Cards */
.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.card-text {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 12px;
}

.card-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

/* Menu Item Card */
.menu-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: all 0.2s;
}

.menu-item:hover {
  box-shadow: var(--shadow-lg);
}

.menu-item-img {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.menu-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-item-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.menu-item-desc {
  color: var(--text-light);
  font-size: 14px;
  flex: 1;
}

.menu-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.menu-item-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.menu-item-badges {
  display: flex;
  gap: 6px;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  text-transform: uppercase;
}

.badge-popular {
  background: var(--secondary);
  color: var(--dark);
}

.badge-new {
  background: var(--success);
  color: white;
}

.badge-veg {
  background: #dcfce7;
  color: #166534;
}

.badge-vegan {
  background: #d1fae5;
  color: #065f46;
}

.badge-gf {
  background: #fef3c7;
  color: #92400e;
}

/* Grid */
.grid {
  display: grid;
  gap: 24px;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .hero h1 { font-size: 32px; }
  .nav { display: none; }
}

@media (max-width: 480px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* Categories */
.category-nav {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-nav::-webkit-scrollbar {
  display: none;
}

.category-btn {
  padding: 10px 20px;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: 25px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover, .category-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--white);
  transition: all 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(232, 93, 4, 0.1);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.form-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.form-error {
  color: var(--error);
  font-size: 13px;
  margin-top: 6px;
}

/* Cart */
.cart-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--white);
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.cart-item-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.cart-item-mods {
  font-size: 13px;
  color: var(--text-light);
}

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  background: var(--white);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.qty-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.cart-item-price {
  font-weight: 700;
  color: var(--primary);
}

.cart-summary {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow);
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.cart-summary-row:last-child {
  border-bottom: none;
}

.cart-summary-total {
  font-size: 20px;
  font-weight: 700;
}

/* Section */
.section {
  padding: 60px 0;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text);
}

.section-subtitle {
  color: var(--text-light);
  margin-bottom: 32px;
}

/* Footer */
.footer {
  background: var(--dark);
  color: white;
  padding: 60px 20px 20px;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-brand {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
  margin-bottom: 16px;
}

/* Footer Logo */
.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo-mark {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary) 0%, #c0392b 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.footer-logo-letter {
  color: white;
  font-size: 26px;
  font-weight: 800;
  font-family: 'Georgia', serif;
}

.footer-logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.footer-logo-name {
  font-size: 22px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
}

.footer-logo-tagline {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-light);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.footer-desc {
  opacity: 0.8;
  line-height: 1.8;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--secondary);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255,255,255,0.8);
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary-light);
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 40px;
  padding-top: 20px;
  text-align: center;
  opacity: 0.6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

/* Status */
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.status-preparing {
  background: #fce7f3;
  color: #9d174d;
}

.status-ready {
  background: #d1fae5;
  color: #065f46;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Admin Layout */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 260px;
  background: var(--dark);
  color: white;
  padding: 20px 0;
  flex-shrink: 0;
}

.admin-sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 20px;
}

.admin-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-light);
}

.admin-nav {
  list-style: none;
}

.admin-nav-item {
  margin-bottom: 4px;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255,255,255,0.7);
  transition: all 0.2s;
}

.admin-nav-link:hover, .admin-nav-link.active {
  background: rgba(255,255,255,0.1);
  color: white;
}

.admin-nav-link.active {
  border-left: 3px solid var(--primary);
}

/* Navigation with submenu */
.admin-nav-link.has-submenu {
  position: relative;
}

.admin-nav-link .nav-arrow {
  margin-left: auto;
  font-size: 10px;
  transition: transform 0.2s;
  opacity: 0.6;
}

.admin-nav-link.expanded .nav-arrow {
  transform: rotate(90deg);
}

/* Navigation Divider */
.admin-nav-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 12px 16px;
}

/* Collapsible Submenu */
.admin-nav-submenu {
  list-style: none;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0,0,0,0.15);
}

.admin-nav-submenu.show {
  max-height: 300px;
}

.admin-nav-sublink {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 10px 44px;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  transition: all 0.2s;
}

.admin-nav-sublink:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.admin-nav-sublink.active {
  background: rgba(232, 93, 4, 0.15);
  color: var(--primary-light);
  border-left: 3px solid var(--primary);
}

.admin-nav-sublink span:first-child {
  font-size: 14px;
}

.admin-main {
  flex: 1;
  padding: 30px;
  background: var(--bg);
  overflow-y: auto;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.admin-title {
  font-size: 28px;
  font-weight: 700;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

.stat-label {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
}

.stat-change {
  font-size: 13px;
  margin-top: 8px;
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--error);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    display: none;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Table */
.table-container {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.table th {
  background: var(--bg-alt);
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  color: var(--text-light);
}

.table tr:hover {
  background: var(--bg-alt);
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal,
.modal-content {
  background: var(--white);
  border-radius: var(--radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: var(--dark);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--white);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  background: var(--white);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: var(--white);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-state-text {
  color: var(--text-light);
  margin-bottom: 24px;
}

/* Alert */
.alert {
  padding: 16px 20px;
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.alert-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

/* Toggle Switch */
.toggle {
  position: relative;
  width: 50px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--border);
  border-radius: 28px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: var(--primary);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Order Status Progress */
.order-progress {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 40px 0;
}

.order-progress::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border);
}

.progress-step {
  position: relative;
  z-index: 1;
  text-align: center;
}

.progress-step-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--white);
  border: 3px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 18px;
}

.progress-step.active .progress-step-icon {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.progress-step.completed .progress-step-icon {
  border-color: var(--success);
  background: var(--success);
  color: white;
}

.progress-step-label {
  font-size: 13px;
  color: var(--text-light);
}

.progress-step.active .progress-step-label,
.progress-step.completed .progress-step-label {
  color: var(--text);
  font-weight: 500;
}

/* Utility */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-muted { color: var(--text-muted); }
.text-primary { color: var(--primary); }
.text-success { color: var(--success); }
.text-error { color: var(--error); }

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-1 { gap: 8px; }
.gap-2 { gap: 16px; }
.gap-3 { gap: 24px; }

.hidden { display: none; }
.flex-wrap { flex-wrap: wrap; }

/* Batch Import Styles */
.import-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 12px;
}

.import-tab {
  padding: 10px 20px;
  background: var(--bg-alt);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-tab:hover {
  background: var(--border);
}

.import-tab.active {
  background: var(--primary);
  color: white;
}

.import-tab-content {
  display: none;
}

.import-tab-content.active {
  display: block;
}

.import-section {
  background: var(--bg-alt);
  border-radius: var(--radius);
  padding: 20px;
}

.file-upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-area:hover,
.file-upload-area.drag-over {
  border-color: var(--primary);
  background: var(--bg);
}

.file-upload-content {
  pointer-events: none;
}

.file-upload-content button {
  pointer-events: auto;
}

.file-upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.file-info {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.photo-preview {
  margin-top: 16px;
  text-align: center;
}

.import-preview {
  margin-top: 24px;
}

.import-preview-count {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--success);
}

.import-preview-table {
  max-height: 300px;
  overflow-y: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.import-preview-table .table {
  margin: 0;
  font-size: 14px;
}

.import-preview-table .table th,
.import-preview-table .table td {
  padding: 10px 12px;
}

.row-error {
  background: #fff5f5 !important;
}

.import-processing {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s infinite;
}
`;
