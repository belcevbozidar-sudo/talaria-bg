// =====================================================
// ElectroMoto BG — Main JavaScript
// =====================================================

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem('emCart') || '[]');

function saveCart() {
  localStorage.setItem('emCart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cartBadge').forEach(el => el.textContent = total);
}

// ---- ADD TO CART ----
function addToCart(card) {
  const name = card.dataset.name;
  const price = parseInt(card.dataset.price);
  const img = card.dataset.img || card.querySelector('.product-img')?.src || '';
  const brand = card.dataset.brand?.toUpperCase() || 'SURRON';

  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, img, brand, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${name}`, 'добавен в количката!');

  // Animate button
  const btn = card.querySelector('.add-to-cart-btn');
  if (btn) {
    btn.textContent = '✅ Добавено!';
    btn.style.background = 'linear-gradient(135deg, #00CC6A, #00FF88)';
    setTimeout(() => {
      btn.innerHTML = '🛒 Купи';
      btn.style.background = '';
    }, 1500);
  }
}

// ---- RENDER CART ----
function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Количката е празна</p>
        <p style="font-size:13px;">Разгледай нашите продукти!</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.style.display='none'">
      <div class="cart-item-info">
        <div class="cart-item-brand">⚡ ${item.brand}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
          </div>
          <span class="cart-item-price">${(item.price * item.qty).toLocaleString('bg-BG')} лв.</span>
          <span class="cart-item-remove" onclick="removeFromCart(${idx})">🗑️</span>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = `${total.toLocaleString('bg-BG')} лв.`;
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
}

// ---- CART OPEN/CLOSE ----
function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- MODAL ----
function openModal(card) {
  const modal = document.getElementById('modalOverlay');
  if (!modal) return;

  const name = card.dataset.name || '';
  const brand = card.dataset.brand?.toUpperCase() || '';
  const price = parseInt(card.dataset.price || 0);
  const img = card.dataset.img || card.querySelector('.product-img')?.src || '';
  const desc = card.dataset.desc || '';
  const motor = card.dataset.motor || '';
  const speed = card.dataset.speed || '';
  const range = card.dataset.range || '';
  const battery = card.dataset.battery || '';

  document.getElementById('modalImg').src = img;
  document.getElementById('modalImg').alt = name;
  document.getElementById('modalBrand').textContent = `⚡ ${brand}`;
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('modalPrice').textContent = `${price.toLocaleString('bg-BG')} лв.`;

  document.getElementById('modalSpecs').innerHTML = `
    <div class="modal-spec"><div class="modal-spec-label">Двигател</div><div class="modal-spec-value">${motor}</div></div>
    <div class="modal-spec"><div class="modal-spec-label">Топ скорост</div><div class="modal-spec-value">${speed}</div></div>
    <div class="modal-spec"><div class="modal-spec-label">Обхват</div><div class="modal-spec-value">${range}</div></div>
    <div class="modal-spec"><div class="modal-spec-label">Батерия</div><div class="modal-spec-value">${battery}</div></div>
  `;

  const cartBtn = document.getElementById('modalCartBtn');
  if (cartBtn) {
    cartBtn.onclick = () => {
      addToCart(card);
      closeModal();
    };
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event && event.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
  }
});

// ---- TOAST ----
let toastTimer;
function showToast(title, msg, icon = '✅') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg;
  toast.querySelector('.toast-icon').textContent = icon;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- FILTER PRODUCTS ----
function filterProducts(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');

  document.querySelectorAll('#productsGrid .product-card').forEach(card => {
    const brand = card.dataset.brand || '';
    const level = card.dataset.level || '';
    let show = false;

    if (filter === 'all') show = true;
    else if (filter === 'surron') show = brand === 'surron';
    else if (filter === 'talaria') show = brand === 'talaria';
    else if (filter === 'beginner') show = level === 'beginner';
    else if (filter === 'pro') show = level === 'pro';

    card.style.display = show ? '' : 'none';
    if (show) {
      card.style.animation = 'fadeInUp 0.4s ease both';
    }
  });
}

// ---- WISHLIST ----
let wishlist = JSON.parse(localStorage.getItem('emWishlist') || '[]');

function toggleWishlist(btn) {
  const card = btn.closest('.product-card');
  const name = card.dataset.name;

  if (wishlist.includes(name)) {
    wishlist = wishlist.filter(n => n !== name);
    btn.textContent = '🤍';
    showToast(name, 'видян от списъка с желания', '💔');
  } else {
    wishlist.push(name);
    btn.textContent = '❤️';
    showToast(name, 'добавен в желания!', '❤️');
  }
  localStorage.setItem('emWishlist', JSON.stringify(wishlist));
}

// ---- NEWSLETTER ----
function subscribeNewsletter() {
  const input = document.getElementById('newsletterEmail');
  if (!input) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    showToast('Грешка', 'Въведи валиден имейл!', '⚠️');
    return;
  }
  showToast('Успех!', `${email} е абониран за новини!`, '📧');
  input.value = '';
}

// ---- MOBILE MENU ----
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  menu?.classList.toggle('open');
  toggle?.classList.toggle('active');
}

// ---- SEARCH ----
function toggleSearch() {
  showToast('Търсене', 'Напиши в търсачката...', '🔍');
}

// ---- CHECKOUT ----
function checkout() {
  if (cart.length === 0) return;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  showToast('Поръчка', `Общо: ${total.toLocaleString('bg-BG')} лв. Ще се свържем с вас!`, '🎉');
  cart = [];
  saveCart();
  renderCart();
  closeCart();
}

// ---- HEADER SCROLL ----
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ---- SCROLL REVEAL ----
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ---- COUNTER ANIMATION ----
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = el.textContent;
    const num = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/\d/g, '');
    if (!num) return;
    let current = 0;
    const step = Math.ceil(num / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      el.textContent = current + suffix;
      if (current >= num) clearInterval(timer);
    }, 20);
  });
}

// ---- WISHLIST RESTORE ----
function restoreWishlist() {
  document.querySelectorAll('.product-wishlist').forEach(btn => {
    const card = btn.closest('.product-card');
    if (card && wishlist.includes(card.dataset.name)) {
      btn.textContent = '❤️';
    }
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
  initReveal();
  restoreWishlist();

  // Animate hero counters on load
  setTimeout(animateCounters, 800);

  // Stagger product cards
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.08}s`;
    card.classList.add('reveal');
    setTimeout(() => initReveal(), 100);
  });

  // Redirect product cards for Surron and Talaria directly to their detail pages
  document.querySelectorAll('.product-card').forEach(card => {
    const brand = card.dataset.brand;
    if (brand === 'surron' || brand === 'talaria') {
      const name = card.dataset.name || '';
      // Convert e.g., "Surron Light Bee X" to "surron-light-bee-x"
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Determine path prefix dynamically
      const path = window.location.pathname;
      let link = '';
      if (path.includes('/products/')) {
        link = `${slug}.html`;
      } else if (path.includes('/pages/')) {
        link = `products/${slug}.html`;
      } else {
        link = `pages/products/${slug}.html`;
      }

      // Set pointer cursor on the card
      card.style.cursor = 'pointer';

      // Card click event handler
      card.addEventListener('click', (e) => {
        // Do not redirect if clicking interactive buttons
        if (e.target.closest('.add-to-cart-btn') || 
            e.target.closest('.product-wishlist') || 
            e.target.closest('.qty-btn') || 
            e.target.closest('.cart-item-remove')) {
          return;
        }
        window.location.href = link;
      });

      // Update "Бърз преглед" button to "Виж продукта" and make it redirect
      const qvBtn = card.querySelector('.quick-view-btn');
      if (qvBtn) {
        qvBtn.textContent = 'Виж продукта';
        qvBtn.removeAttribute('onclick');
        qvBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = link;
        });
      }

      // Update "Виж страницата →" overlay button link if it exists
      const viewPageBtn = card.querySelector('.view-product-overlay-btn');
      if (viewPageBtn) {
        viewPageBtn.href = link;
      }

      // Wrap product name in a link wrapper for SEO and user interaction
      const nameEl = card.querySelector('.product-name');
      if (nameEl && !nameEl.closest('a')) {
        const a = document.createElement('a');
        a.href = link;
        a.className = 'product-name-link';
        nameEl.parentNode.insertBefore(a, nameEl);
        a.appendChild(nameEl);
      }
    }
  });
});

