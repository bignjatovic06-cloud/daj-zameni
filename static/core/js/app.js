// ===== MOCK DATA =====
const listings = [
  { id: 1, title: 'iPhone 12 Pro, 128GB', category: 'Elektronika', condition: 'Kao novo', city: 'Kragujevac', emoji: '📱', wants: 'Laptop, tablet ili slušalice', desc: 'Odlično stanje, bez ogrebotina. Dolazi sa originalnim punjaem i kutijom. Baterija 91%.', user: 'Branko I.', userInitial: 'B', timeAgo: '2h' },
  { id: 2, title: 'Sony WH-1000XM4 slušalice', category: 'Elektronika', condition: 'Kao novo', city: 'Beograd', emoji: '🎧', wants: 'Bicikl, sportska oprema', desc: 'Korišćene 3 meseca, dolaze sa kutijom i svim kablovima. Noise cancelling radi odlično.', user: 'Marko N.', userInitial: 'M', timeAgo: '5h' },
  { id: 3, title: 'Ski oprema komplet', category: 'Sport', condition: 'Dobro', city: 'Novi Sad', emoji: '⛷️', wants: 'Surfboard, roleri ili skateboard', desc: 'Skije 160cm, cipele 43, štapovi i kacigu. Sezona korišćena.', user: 'Ana P.', userInitial: 'A', timeAgo: '1d' },
  { id: 4, title: 'Kolekcija knjiga, 40 naslova', category: 'Knjige', condition: 'Dobro', city: 'Niš', emoji: '📚', wants: 'Džepna kamera ili vinyls', desc: 'Mešavina srpske i strane književnosti, naučna fantastika i filozofija. Lista dostupna.', user: 'Jovana M.', userInitial: 'J', timeAgo: '2d' },
  { id: 5, title: 'Trotinet električni Xiaomi', category: 'Sport', condition: 'Dobro', city: 'Kragujevac', emoji: '🛴', wants: 'Bicikl ili skateboard', desc: 'Xiaomi Mi 3, 25km/h max, baterija drži 25km. Sitne ogrebotine, tehnički ispravno.', user: 'Stefan L.', userInitial: 'S', timeAgo: '3d' },
  { id: 6, title: 'MacBook Pro 2019, 16"', category: 'Elektronika', condition: 'Dobro', city: 'Beograd', emoji: '💻', wants: 'Gaming PC ili monitor', desc: 'Intel i7, 16GB RAM, 512GB SSD. Tastatura zamenjena, ekran bez mrlja.', user: 'Nikola R.', userInitial: 'N', timeAgo: '4d' },
  { id: 7, title: 'Sofa trosed, siva', category: 'Nameštaj', condition: 'Prihvatljivo', city: 'Kragujevac', emoji: '🛋️', wants: 'Krevet, ormar ili fotelja', desc: 'Ugaona sofa 2+3, siva tkanina, malo izbledelа na naslonima. Preuzimanje lično.', user: 'Mila D.', userInitial: 'M', timeAgo: '5d' },
  { id: 8, title: 'Nintendo Switch + 5 igara', category: 'Igre', condition: 'Kao novo', city: 'Novi Sad', emoji: '🎮', wants: 'PS5 ili Xbox kontroler', desc: 'Switch OLED, 5 igara: Zelda, Mario Kart, Animal Crossing, Metroid, Pokémon. Kutije.', user: 'Petar J.', userInitial: 'P', timeAgo: '6d' },
];

const messages = [
  { id: 1, name: 'Marko Nikolić', initial: 'M', preview: 'Odlično stanje, dolaze sa kutijom...', time: '14:26', unread: true },
  { id: 2, name: 'Ana Pavlović', initial: 'A', preview: 'Možemo li se dogovoriti za vikend?', time: 'juče', unread: true },
  { id: 3, name: 'Stefan Lukić', initial: 'S', preview: 'Hvala na odgovoru!', time: 'pon', unread: false },
];

// ===== STATE =====
let currentPage = 'home';
let prevPage = null;
let wishlistIds = new Set();

// ===== NAVIGATION =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) {
    prevPage = currentPage;
    currentPage = name;
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goBack() {
  showPage(prevPage || 'browse');
}

// ===== RENDER LISTINGS =====
function renderListings(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(l => `
    <article class="listing-card" onclick="showDetail(${l.id})" tabindex="0" role="button"
      onkeydown="if(event.key==='Enter')showDetail(${l.id})">
      <div class="listing-img">
        <span aria-hidden="true">${l.emoji}</span>
      </div>
      <div class="listing-body">
        <div class="listing-meta">
          <span class="chip">${l.category}</span>
          <span class="chip ${l.condition === 'Kao novo' || l.condition === 'Novo' ? 'chip-success' : ''}">${l.condition}</span>
        </div>
        <h3 class="listing-title">${l.title}</h3>
        <p class="listing-wants">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16"/></svg>
          ${l.wants}
        </p>
        <p class="text-xs text-muted" style="margin-top:8px">📍 ${l.city} · ${l.timeAgo}</p>
      </div>
    </article>
  `).join('');
}

function showDetail(id) {
  const l = listings.find(x => x.id === id);
  if (!l) return;

  document.getElementById('detail-title').textContent = l.title;
  document.getElementById('detail-location').innerHTML = `📍 ${l.city}`;
  document.getElementById('detail-desc').textContent = l.desc;
  document.getElementById('detail-wants').textContent = l.wants;
  document.getElementById('detail-img').innerHTML = `<span style="font-size:5rem">${l.emoji}</span>`;
  document.getElementById('detail-badges').innerHTML = `
    <span class="chip chip-primary">${l.category}</span>
    <span class="chip ${l.condition === 'Kao novo' || l.condition === 'Novo' ? 'chip-success' : ''}">${l.condition}</span>
  `;
  document.getElementById('detail-user').innerHTML = `
    <div class="avatar">${l.userInitial}</div>
    <div>
      <strong>${l.user}</strong>
      <p class="text-sm text-muted">Objavljeno ${l.timeAgo}</p>
    </div>
  `;

  const thumbs = ['', '🖼️', '📷'];
  document.getElementById('detail-thumbs').innerHTML = thumbs.map((t, i) => `
    <div class="detail-thumb ${i === 0 ? 'active' : ''}">${i === 0 ? l.emoji : t}</div>
  `).join('');

  const btn = document.getElementById('wishlist-btn');
  if (wishlistIds.has(id)) {
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Sačuvano';
  } else {
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Sačuvaj';
  }
  btn.dataset.listingId = id;

  showPage('detail');
}

// ===== WISHLIST =====
function toggleWishlist(btn) {
  const id = parseInt(btn.dataset.listingId);
  if (wishlistIds.has(id)) {
    wishlistIds.delete(id);
    showToast('Uklonjeno iz sačuvanih');
  } else {
    wishlistIds.add(id);
    showToast('Sačuvano! ❤️');
  }
  const saved = listings.filter(l => wishlistIds.has(l.id));
  if (document.getElementById('wishlist-listings')) {
    if (saved.length > 0) {
      renderListings('wishlist-listings', saved);
    } else {
      document.getElementById('wishlist-listings').innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <h3>Nema sačuvanih oglasa</h3>
          <p>Klikni na srce na oglasu da ga sačuvaš ovde.</p>
          <button class="btn btn-primary" onclick="showPage('browse')">Pregledaj oglase</button>
        </div>`;
    }
  }
}

// ===== INBOX =====
function renderInbox() {
  const container = document.getElementById('inbox-list');
  if (!container) return;
  container.innerHTML = messages.map(m => `
    <div class="inbox-item ${m.unread ? 'unread' : ''}" onclick="showPage('chat')">
      <div class="avatar">${m.initial}</div>
      <div class="inbox-content">
        <p class="inbox-name">${m.name}</p>
        <p class="inbox-preview">${m.preview}</p>
      </div>
      <span class="inbox-time">${m.time}</span>
    </div>
  `).join('');
}

// ===== CHAT =====
function sendMessage(event) {
  if (event && event.type === 'keydown' && event.key !== 'Enter') return;
  const input = document.getElementById('chat-input-field');
  const text = input.value.trim();
  if (!text) return;
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = 'msg msg-out';
  msg.innerHTML = `<p>${text}</p><span class="msg-time">${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2,'0')}</span>`;
  container.appendChild(msg);
  input.value = '';
  container.scrollTop = container.scrollHeight;
}

// ===== CREATE =====
function submitListing(e) {
  e.preventDefault();
  showToast('Oglas objavljen! 🎉');
  setTimeout(() => showPage('browse'), 1000);
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== THEME TOGGLE =====
(function () {
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      d = d === 'dark' ? 'light' : 'dark';
      r.setAttribute('data-theme', d);
      btn.innerHTML = d === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  });
})();

// ===== HAMBURGER =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }
  lucide.createIcons();

  // Init renders
  renderListings('home-listings', listings.slice(0, 4));
  renderListings('browse-listings', listings);
  renderListings('profile-listings', listings.slice(0, 3));
  renderInbox();
});

function closeMobileNav() {
  document.getElementById('mobileNav')?.classList.remove('open');
}