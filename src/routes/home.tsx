import type { FC } from 'hono/jsx';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MenuCardGrid } from '../components/MenuCard';
import type { MenuItem, Branch, Category } from '../types';
import { escapeHtml } from '../utils/helpers';

interface HomePageProps {
  popularItems: MenuItem[];
  branches: Branch[];
  categories: Category[];
}

export const HomePage: FC<HomePageProps> = ({ popularItems, branches, categories }) => {
  return (
    <Layout title="Home">
      <Header currentPath="/" />

      {/* Loyalty Club Banner */}
      <div class="club-banner">
        <div class="club-banner-content">
          <div class="club-banner-left">
            <span class="club-icon">🎁</span>
            <div class="club-text">
              <strong>JOIN THE SMART RESTAURANT CLUB TODAY</strong>
              <span>Get free rewards every time you dine</span>
            </div>
          </div>
          <div class="club-banner-right">
            <span class="club-rating">App Store rating: ⭐⭐⭐⭐⭐</span>
            <a href="/orders" class="btn club-btn">Join the Club</a>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      <section class="hero-carousel">
        <div class="carousel-container" id="heroCarousel">
          <div class="carousel-slide active" style="background-image: url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&h=900&fit=crop');">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <h1>SIGNATURE WAGYU BURGER</h1>
              <h2>NOW AVAILABLE</h2>
              <p>Premium Australian Wagyu beef, aged cheddar, caramelized onions</p>
              <a href="/menu" class="btn btn-carousel">Discover the range</a>
            </div>
          </div>

          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&fit=crop');">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <h1>HAPPY HOUR</h1>
              <h2>4-6 PM DAILY</h2>
              <p>20% off all drinks and appetizers</p>
              <a href="/menu" class="btn btn-carousel">View Menu</a>
            </div>
          </div>

          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&h=900&fit=crop');">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <h1>DOUBLE POINTS</h1>
              <h2>WEEKEND SPECIAL</h2>
              <p>Earn 2x rewards on all orders this weekend</p>
              <a href="/orders" class="btn btn-carousel">Check Points</a>
            </div>
          </div>

          <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1600&h=900&fit=crop');">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <h1>FREE SIDES</h1>
              <h2>WITH ORDERS OVER $75</h2>
              <p>Use code: FREESIDE at checkout</p>
              <a href="/menu" class="btn btn-carousel">Start Order</a>
            </div>
          </div>
        </div>

        <div class="carousel-dots" id="carouselDots"></div>

        <button class="carousel-nav carousel-prev" onclick="prevSlide()">‹</button>
        <button class="carousel-nav carousel-next" onclick="nextSlide()">›</button>
      </section>

      {/* Book/Find Section */}
      <section class="booking-section">
        <div class="booking-tabs">
          <button class="booking-tab active" onclick="showBookingTab('book')" id="tabBook">Book a table</button>
          <button class="booking-tab" onclick="showBookingTab('find')" id="tabFind">Find a restaurant</button>
        </div>

        <div class="booking-content" id="bookingContent">
          {/* Book a Table Form */}
          <div class="booking-form" id="bookForm">
            <div class="booking-field search-field">
              <div class="custom-select" id="locationSelect" style="width: 100%;">
                <button class="custom-select-trigger" onclick="window.toggleDropdown('locationSelect')" style="width: 100%;">
                  <span class="select-value">Select a restaurant</span>
                  <span class="select-arrow">▼</span>
                </button>
                <div class="custom-select-options">
                  {branches.map((branch, idx) => (
                    <div
                      class={`custom-select-option${idx === 0 ? ' selected' : ''}`}
                      data-value={branch.id.toString()}
                      data-name={escapeHtml(branch.name)}
                      onclick={`window.selectBranch('${branch.id}', '${escapeHtml(branch.name).replace(/'/g, "\\'")}');`}
                    >
                      {escapeHtml(branch.name)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div class="booking-field">
              <div class="custom-select" id="personsSelect">
                <button class="custom-select-trigger" onclick="window.toggleDropdown('personsSelect')">
                  <span class="select-value">2 People</span>
                  <span class="select-arrow">▼</span>
                </button>
                <div class="custom-select-options">
                  <div class="custom-select-option" data-value="1" onclick="window.selectOption('personsSelect', '1 Person', '1')">1 Person</div>
                  <div class="custom-select-option selected" data-value="2" onclick="window.selectOption('personsSelect', '2 People', '2')">2 People</div>
                  <div class="custom-select-option" data-value="3" onclick="window.selectOption('personsSelect', '3 People', '3')">3 People</div>
                  <div class="custom-select-option" data-value="4" onclick="window.selectOption('personsSelect', '4 People', '4')">4 People</div>
                  <div class="custom-select-option" data-value="5" onclick="window.selectOption('personsSelect', '5 People', '5')">5 People</div>
                  <div class="custom-select-option" data-value="6" onclick="window.selectOption('personsSelect', '6 People', '6')">6 People</div>
                  <div class="custom-select-option" data-value="7" onclick="window.selectOption('personsSelect', '7 People', '7')">7 People</div>
                  <div class="custom-select-option" data-value="8" onclick="window.selectOption('personsSelect', '8+ People', '8')">8+ People</div>
                </div>
              </div>
            </div>
            <div class="booking-field">
              <input type="date" class="booking-input" id="bookDate" />
            </div>
            <div class="booking-field">
              <div class="custom-select" id="timeSelect">
                <button class="custom-select-trigger" onclick="window.toggleDropdown('timeSelect')">
                  <span class="select-value">7:00 PM</span>
                  <span class="select-arrow">▼</span>
                </button>
                <div class="custom-select-options">
                  <div class="custom-select-option" data-value="12:00" onclick="window.selectOption('timeSelect', '12:00 PM', '12:00')">12:00 PM</div>
                  <div class="custom-select-option" data-value="12:30" onclick="window.selectOption('timeSelect', '12:30 PM', '12:30')">12:30 PM</div>
                  <div class="custom-select-option" data-value="13:00" onclick="window.selectOption('timeSelect', '1:00 PM', '13:00')">1:00 PM</div>
                  <div class="custom-select-option" data-value="13:30" onclick="window.selectOption('timeSelect', '1:30 PM', '13:30')">1:30 PM</div>
                  <div class="custom-select-option" data-value="14:00" onclick="window.selectOption('timeSelect', '2:00 PM', '14:00')">2:00 PM</div>
                  <div class="custom-select-option" data-value="18:00" onclick="window.selectOption('timeSelect', '6:00 PM', '18:00')">6:00 PM</div>
                  <div class="custom-select-option" data-value="18:30" onclick="window.selectOption('timeSelect', '6:30 PM', '18:30')">6:30 PM</div>
                  <div class="custom-select-option selected" data-value="19:00" onclick="window.selectOption('timeSelect', '7:00 PM', '19:00')">7:00 PM</div>
                  <div class="custom-select-option" data-value="19:30" onclick="window.selectOption('timeSelect', '7:30 PM', '19:30')">7:30 PM</div>
                  <div class="custom-select-option" data-value="20:00" onclick="window.selectOption('timeSelect', '8:00 PM', '20:00')">8:00 PM</div>
                  <div class="custom-select-option" data-value="20:30" onclick="window.selectOption('timeSelect', '8:30 PM', '20:30')">8:30 PM</div>
                  <div class="custom-select-option" data-value="21:00" onclick="window.selectOption('timeSelect', '9:00 PM', '21:00')">9:00 PM</div>
                </div>
              </div>
            </div>
            <button class="btn btn-primary booking-submit" onclick="window.openBookingModal()">Book now</button>
          </div>

          {/* Find a Restaurant Form */}
          <div class="find-form" id="findForm" style="display: none;">
            <div class="find-search">
              <input type="text" placeholder="Enter your location or postcode" class="find-input" id="findLocation" />
              <button class="location-btn" onclick="useMyLocation()">📍</button>
              <button class="btn btn-primary" onclick="handleFindRestaurant()">Search</button>
            </div>
          </div>
        </div>
      </section>

      {/* Order Online - Elegant CTA Section */}
      <section class="order-cta-section">
        <div class="order-cta-container">
          <div class="order-cta-content">
            <span class="order-cta-badge">ORDER ONLINE</span>
            <h2 class="order-cta-title">Enjoy Our Menu<br />From Anywhere</h2>
            <p class="order-cta-subtitle">Skip the queue. Order ahead for pickup or get it delivered to your door through our delivery partners.</p>
            <div class="order-cta-buttons">
              <a href="/menu" class="btn order-cta-btn-primary">
                <span class="btn-icon">🛒</span>
                Start Your Order
              </a>
              <a href="/menu" class="btn order-cta-btn-secondary">
                View Full Menu
              </a>
            </div>
            <div class="order-cta-features">
              <div class="order-feature">
                <span class="feature-check">✓</span>
                <span>Ready in 15-20 mins</span>
              </div>
              <div class="order-feature">
                <span class="feature-check">✓</span>
                <span>Earn loyalty points</span>
              </div>
              <div class="order-feature">
                <span class="feature-check">✓</span>
                <span>Delivery available</span>
              </div>
            </div>
          </div>
          <div class="order-cta-visual">
            <div class="order-cta-image-wrapper">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=700&fit=crop" alt="Delicious food" class="order-cta-image" />
              <div class="order-cta-badge-float">
                <span class="badge-discount">FREE</span>
                <span class="badge-text">Delivery on first order</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section class="section" style="background: var(--white);">
        <div class="container">
          <div class="grid grid-3">
            <div class="text-center" style="padding: 30px;">
              <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
              <h3 style="font-size: 20px; margin-bottom: 8px;">Scan & Order</h3>
              <p class="text-muted">Scan the QR code at your table and browse our menu instantly</p>
            </div>
            <div class="text-center" style="padding: 30px;">
              <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
              <h3 style="font-size: 20px; margin-bottom: 8px;">Fast Service</h3>
              <p class="text-muted">Your order goes straight to the kitchen - no waiting for staff</p>
            </div>
            <div class="text-center" style="padding: 30px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎁</div>
              <h3 style="font-size: 20px; margin-bottom: 8px;">Earn Rewards</h3>
              <p class="text-muted">Get points with every order and redeem for free food</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section class="section">
          <div class="container">
            <h2 class="section-title">Customer Favorites</h2>
            <p class="section-subtitle">Our most loved dishes - tried and tested by thousands</p>
            <div class="grid grid-3">
              {popularItems.slice(0, 6).map(item => (
                <MenuCardGrid item={item} />
              ))}
            </div>
            <div class="text-center mt-4">
              <a href="/menu" class="btn btn-primary">View Full Menu</a>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section class="section" style="background: var(--white);">
          <div class="container">
            <h2 class="section-title text-center">Browse by Category</h2>
            <p class="section-subtitle text-center">Find exactly what you're craving</p>
            <div class="grid grid-4">
              {categories.slice(0, 8).map(cat => (
                <a href={`/menu?category=${cat.id}`} class="card" style="text-align: center; padding: 30px;">
                  <div style="font-size: 40px; margin-bottom: 12px;">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <h3 class="card-title">{escapeHtml(cat.name)}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Locations */}
      {branches.length > 0 && (
        <section class="section">
          <div class="container">
            <h2 class="section-title">Visit Us</h2>
            <p class="section-subtitle">Find a location near you</p>
            <div class="grid grid-3">
              {branches.slice(0, 3).map(branch => (
                <div class="card">
                  <div class="card-body">
                    <h3 class="card-title">{escapeHtml(branch.name)}</h3>
                    <p class="card-text">
                      📍 {escapeHtml(branch.address)}<br />
                      📞 {escapeHtml(branch.phone)}<br />
                      🕐 {branch.opening_hours} - {branch.closing_hours}
                    </p>
                    <a href={`/menu?branch=${branch.id}`} class="btn btn-primary btn-sm mt-2">
                      Order Here
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {branches.length > 3 && (
              <div class="text-center mt-4">
                <a href="/locations" class="btn btn-secondary">View All Locations</a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section class="section" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; text-align: center;">
        <div class="container">
          <h2 style="font-size: 36px; margin-bottom: 16px;">Join Our Rewards Program</h2>
          <p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px;">
            Earn 1 point for every dollar spent. Redeem points for free food, exclusive offers, and more!
          </p>
          <a href="/orders" class="btn btn-lg" style="background: white; color: var(--primary);">
            Check Your Rewards
          </a>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      <div id="bookingModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
          <div class="modal-header">
            <h3>Complete Your Reservation</h3>
            <button class="modal-close" onclick="window.closeBookingModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div id="bookingSummary" style="background: var(--bg-alt); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              {/* Booking summary will be populated by JS */}
            </div>

            {/* Guest Info Section - shown for non-logged in users */}
            <div id="guestInfoSection">
              <h4 style="margin-bottom: 16px; font-size: 16px;">Contact Information</h4>
              <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" id="guestName" class="form-input" placeholder="Your full name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input type="tel" id="guestPhone" class="form-input" placeholder="Your phone number" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="guestEmail" class="form-input" placeholder="Your email (optional)" />
              </div>
            </div>

            {/* Notes Section */}
            <div class="form-group">
              <label class="form-label">Special Requests / Notes</label>
              <textarea id="bookingNotes" class="form-input" rows={3} placeholder="Any special requests, dietary requirements, or occasion details..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="window.closeBookingModal()">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitBooking()" id="submitBookingBtn">Confirm Reservation</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        function addToCart(itemId) {
          let cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const existing = cart.find(c => c.itemId === itemId);
          if (existing) {
            existing.quantity++;
          } else {
            cart.push({ itemId, quantity: 1, modifiers: [], notes: '' });
          }
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartBadge();
          alert('Added to cart!');
        }

        function updateCartBadge() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const count = cart.reduce((sum, item) => sum + item.quantity, 0);
          const badge = document.querySelector('.cart-badge');
          if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
          }
        }

        updateCartBadge();

        // Hero Carousel
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;
        const dotsContainer = document.getElementById('carouselDots');

        // Create dots
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('span');
          dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
          dot.onclick = () => goToSlide(i);
          dotsContainer.appendChild(dot);
        }

        function showSlide(index) {
          slides.forEach((s, i) => {
            s.classList.toggle('active', i === index);
          });
          document.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
          });
        }

        function nextSlide() {
          currentSlide = (currentSlide + 1) % totalSlides;
          showSlide(currentSlide);
        }

        function prevSlide() {
          currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
          showSlide(currentSlide);
        }

        function goToSlide(index) {
          currentSlide = index;
          showSlide(currentSlide);
        }

        // Auto-rotate every 5 seconds
        setInterval(nextSlide, 5000);

        // Expose functions globally
        window.nextSlide = nextSlide;
        window.prevSlide = prevSlide;

        // Booking tab functionality
        function showBookingTab(tab) {
          const bookForm = document.getElementById('bookForm');
          const findForm = document.getElementById('findForm');
          const tabBook = document.getElementById('tabBook');
          const tabFind = document.getElementById('tabFind');

          if (tab === 'book') {
            bookForm.style.display = 'flex';
            findForm.style.display = 'none';
            tabBook.classList.add('active');
            tabFind.classList.remove('active');
          } else {
            bookForm.style.display = 'none';
            findForm.style.display = 'flex';
            tabBook.classList.remove('active');
            tabFind.classList.add('active');
          }
        }

        function useMyLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                document.getElementById('findLocation').value = 'Current Location';
              },
              () => alert('Unable to get location')
            );
          }
        }

        function handleFindRestaurant() {
          const location = document.getElementById('findLocation').value;
          if (!location) {
            alert('Please enter a location');
            return;
          }
          window.location.href = '/locations?search=' + encodeURIComponent(location);
        }

        // Custom dropdown functionality
        function toggleDropdown(selectId) {
          const select = document.getElementById(selectId);
          const allSelects = document.querySelectorAll('.custom-select');

          // Close all other dropdowns
          allSelects.forEach(s => {
            if (s.id !== selectId) {
              s.classList.remove('open');
            }
          });

          // Toggle current dropdown
          select.classList.toggle('open');
        }

        // Track selected values
        let selectedBranchId = null;
        let selectedBranchName = '';
        let selectedPartySize = 2;
        let selectedTime = '19:00';

        function selectBranch(branchId, branchName) {
          selectedBranchId = branchId;
          selectedBranchName = branchName;

          const select = document.getElementById('locationSelect');
          const trigger = select.querySelector('.select-value');
          const options = select.querySelectorAll('.custom-select-option');

          trigger.textContent = branchName;

          options.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === branchId) {
              opt.classList.add('selected');
            }
          });

          select.classList.remove('open');
        }

        function selectOption(selectId, displayValue, dataValue) {
          const select = document.getElementById(selectId);
          const trigger = select.querySelector('.select-value');
          const options = select.querySelectorAll('.custom-select-option');

          trigger.textContent = displayValue;

          options.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === dataValue) {
              opt.classList.add('selected');
            }
          });

          // Track the actual values
          if (selectId === 'personsSelect') {
            selectedPartySize = parseInt(dataValue);
          } else if (selectId === 'timeSelect') {
            selectedTime = dataValue;
          }

          select.classList.remove('open');
        }

        // Open booking modal
        function openBookingModal() {
          if (!selectedBranchId) {
            alert('Please select a restaurant location');
            return;
          }

          const date = document.getElementById('bookDate').value;
          if (!date) {
            alert('Please select a date');
            return;
          }

          // Check if user is logged in
          const userSession = localStorage.getItem('userSession');
          const guestSection = document.getElementById('guestInfoSection');

          if (userSession) {
            const user = JSON.parse(userSession);
            guestSection.style.display = 'none';
            // Pre-fill if available
            document.getElementById('guestName').value = user.name || '';
            document.getElementById('guestPhone').value = user.phone || '';
            document.getElementById('guestEmail').value = user.email || '';
          } else {
            guestSection.style.display = 'block';
          }

          // Update booking summary
          const personsText = document.querySelector('#personsSelect .select-value').textContent;
          const timeText = document.querySelector('#timeSelect .select-value').textContent;
          const dateObj = new Date(date + 'T00:00:00');
          const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

          document.getElementById('bookingSummary').innerHTML = \`
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Restaurant:</span>
                <span style="font-weight: 600;">\${selectedBranchName}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Date:</span>
                <span style="font-weight: 600;">\${formattedDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Time:</span>
                <span style="font-weight: 600;">\${timeText}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Party Size:</span>
                <span style="font-weight: 600;">\${personsText}</span>
              </div>
            </div>
          \`;

          document.getElementById('bookingModal').style.display = 'flex';
        }

        function closeBookingModal() {
          document.getElementById('bookingModal').style.display = 'none';
        }

        async function submitBooking() {
          const date = document.getElementById('bookDate').value;
          const notes = document.getElementById('bookingNotes').value;

          const userSession = localStorage.getItem('userSession');
          let customerId = null;
          let guestName = null;
          let guestPhone = null;
          let guestEmail = null;

          if (userSession) {
            const user = JSON.parse(userSession);
            customerId = user.id;
          } else {
            guestName = document.getElementById('guestName').value.trim();
            guestPhone = document.getElementById('guestPhone').value.trim();
            guestEmail = document.getElementById('guestEmail').value.trim();

            if (!guestName || !guestPhone) {
              alert('Please provide your name and phone number');
              return;
            }
          }

          const submitBtn = document.getElementById('submitBookingBtn');
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          try {
            const response = await fetch('/api/reservations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                branch_id: parseInt(selectedBranchId),
                customer_id: customerId,
                guest_name: guestName,
                guest_phone: guestPhone,
                guest_email: guestEmail,
                reservation_date: date,
                reservation_time: selectedTime,
                party_size: selectedPartySize,
                notes: notes || null
              })
            });

            const result = await response.json();

            if (result.success) {
              closeBookingModal();
              alert('Your reservation has been submitted! We will confirm your booking shortly. Check your email or phone for updates.');

              // Reset form
              document.getElementById('bookingNotes').value = '';
              document.getElementById('guestName').value = '';
              document.getElementById('guestPhone').value = '';
              document.getElementById('guestEmail').value = '';
            } else {
              alert('Failed to submit reservation: ' + (result.error || 'Unknown error'));
            }
          } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to submit reservation. Please try again.');
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Reservation';
          }
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
          if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(s => {
              s.classList.remove('open');
            });
          }
        });

        // Close modal when clicking overlay
        document.getElementById('bookingModal').addEventListener('click', function(e) {
          if (e.target === this) {
            closeBookingModal();
          }
        });

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookDate').value = today;

        // Set min date to today
        document.getElementById('bookDate').min = today;

        window.showBookingTab = showBookingTab;
        window.useMyLocation = useMyLocation;
        window.handleFindRestaurant = handleFindRestaurant;
        window.toggleDropdown = toggleDropdown;
        window.selectOption = selectOption;
        window.selectBranch = selectBranch;
        window.openBookingModal = openBookingModal;
        window.closeBookingModal = closeBookingModal;
        window.submitBooking = submitBooking;
      `}} />
    </Layout>
  );
};

function getCategoryIcon(name: string): string {
  const icons: Record<string, string> = {
    'Burgers': '🍔',
    'Pizza': '🍕',
    'Pasta': '🍝',
    'Salads': '🥗',
    'Drinks': '🥤',
    'Desserts': '🍰',
    'Sides': '🍟',
    'Breakfast': '🍳',
    'Appetizers': '🥟',
    'Main Course': '🍽️',
    'Seafood': '🦐',
    'Chicken': '🍗',
    'Steaks': '🥩',
    'Soups': '🍲',
    'Coffee': '☕',
    'Smoothies': '🥤'
  };
  return icons[name] || '🍴';
}
