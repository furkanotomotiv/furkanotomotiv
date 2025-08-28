// AOS başlatma
AOS.init({
    duration: 800,
    once: true
});

/* --- AOS init (varsa) --- */
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, once: true });
}

/* --- Hizmet verileri: localStorage ile yönetilecek --- */
const defaultServices = [
  {
    id: 's1',
    category: 'elektrik',
    title: 'Oto Elektrik Onarım',
    shortDesc: 'Araç elektrik sistemi teşhis, arıza tespiti ve onarım.',
    longDesc: 'Uzman teknisyenlerimiz ile aracınızın tüm elektrik aksamı — sigorta, kablolama, şarj devreleri ve daha fazlası detaylı kontrol edilir ve onarılır.',
    media: 'assets/images/service-elektrik.jpg'
  },
  {
    id: 's2',
    category: 'klima',
    title: 'Klima Bakım & Gaz Dolumu',
    shortDesc: 'Klima performans testi, gaz dolumu ve kaçağı onarımı.',
    longDesc: 'Klima sisteminin verimli çalışması için gaz kontrolü, kompresör testi ve sistem temizliği yapılır. Soğutma verimi artırılır.',
    media: 'assets/images/service-klima.jpg'
  },
  {
    id: 's3',
    category: 'multimedya',
    title: 'CarPlay & Multimedya Kurulum',
    shortDesc: 'CarPlay aktivasyonu, multimedya cihaz montajı ve ses sistemi kurulumu.',
    longDesc: 'Orijinal veya aftermarket multimedya üniteleri kurulumu, hoparlör yerleşimi ve ses ayarları uzman ekibimizce yapılır.',
    media: 'assets/images/service-multimedya.jpg'
  },
  {
    id: 's4',
    category: 'vagcom',
    title: 'VAGCom Gizli Özellik Aktivasyonu',
    shortDesc: 'VW / Audi / Skoda / Seat araçlarda gizli özelliklerin aktif edilmesi.',
    longDesc: 'Gizli konfigürasyonlar (ör: start-stop ayarları, aydınlatma, gösterge düzenleri) VAGCOM ile güvenli şekilde aktifleştirilir.',
    media: 'assets/images/service-vagcom.jpg'
  },
  {
    id: 's5',
    category: 'aku',
    title: 'Akü Satış & Test (Mutlu, Varta, Outopower)',
    shortDesc: 'Akü testi, değişimi ve garantili satış hizmeti.',
    longDesc: 'Marka aküler, araç tipine göre en uygun kapasitede verilir; montaj ve test servisimizle birlikte teslim edilir.',
    media: 'assets/images/service-aku.jpg'
  },
  {
    id: 's6',
    category: 'far',
    title: 'Far & Ampul Değişimi (LED / Xenon)',
    shortDesc: 'Far onarımı, ampul ve led/xenon dönüşümleri.',
    longDesc: 'Far hizalama, ampul değişimi ve ışık verimini arttıracak dönüşümler yetkili ekip tarafından yapılır.',
    media: 'assets/images/service-far.jpg'
  }
];

function getStoredServices() {
  try {
    const raw = localStorage.getItem('furkan_services');
    if (!raw) return defaultServices;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultServices;
  } catch (e) {
    return defaultServices;
  }
}

function renderServices(services) {
  const container = document.getElementById('services-grid');
  container.innerHTML = ''; // temizle
  services.forEach(s => {
    const card = document.createElement('article');
    card.className = 'service-card';
    card.setAttribute('data-id', s.id);
    card.innerHTML = `
      <div class="service-head">
        <img class="icon" src="${s.media}" alt="${s.title} görseli" />
        <div>
          <h3>${s.title}</h3>
          <div class="tag">${s.category.toUpperCase()}</div>
        </div>
      </div>
      <p>${s.shortDesc}</p>
      <div class="card-footer">
        <button class="btn btn-outline open-detail" data-id="${s.id}">Detay</button>
        <small class="meta">Daha fazla bilgi için tıklayın</small>
      </div>
    `;
    container.appendChild(card);
  });

  // AOS yenile (yeni elementler için)
  if (typeof AOS !== 'undefined') AOS.refresh();
}

/* --- Filtreleme & Arama --- */
function applyFilter(category) {
  const all = getStoredServices();
  const filtered = (category === 'all') ? all : all.filter(s => s.category === category);
  renderServices(filtered);
  // buton aktif sınıfını yönet
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === category));
}

function applySearch(query) {
  const all = getStoredServices();
  query = (query || '').trim().toLowerCase();
  if (!query) { renderServices(all); return; }
  const results = all.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.shortDesc.toLowerCase().includes(query) ||
    s.longDesc.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query)
  );
  renderServices(results);
}

/* --- Modal --- */
const modal = {
  el: document.getElementById('service-modal'),
  title: document.getElementById('modal-title'),
  desc: document.getElementById('modal-desc'),
  media: document.getElementById('modal-media'),
  open(id) {
    const svc = getStoredServices().find(s => s.id === id);
    if (!svc) return;
    this.title.textContent = svc.title;
    this.desc.textContent = svc.longDesc || svc.shortDesc;
    // media (resim/video)
    this.media.innerHTML = '';
    if (svc.media && svc.media.endsWith('.mp4')) {
      const v = document.createElement('video');
      v.src = svc.media;
      v.controls = true; v.autoplay = false; v.playsInline = true;
      this.media.appendChild(v);
    } else if (svc.media) {
      const img = document.createElement('img');
      img.src = svc.media;
      img.alt = svc.title;
      this.media.appendChild(img);
    }
    this.el.setAttribute('aria-hidden','false');
  },
  close() {
    this.el.setAttribute('aria-hidden','true');
    this.media.innerHTML = '';
  }
};

/* --- Event bindings --- */
document.addEventListener('DOMContentLoaded', () => {
  // initial render
  renderServices(getStoredServices());

  // filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // search
  const search = document.getElementById('service-search');
  if (search) {
    search.addEventListener('input', (e) => {
      const q = e.target.value;
      applySearch(q);
    });
  }

  // delegation for opening modal
  document.getElementById('services-grid').addEventListener('click', (e) => {
    const openBtn = e.target.closest('.open-detail');
    if (!openBtn) return;
    const id = openBtn.dataset.id;
    modal.open(id);
  });

  // modal close
  document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
    el.addEventListener('click', () => modal.close());
  });

  // escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.close();
  });
});

const defaultBrands = [
  {
    id: 'b1',
    name: 'Mutlu Akü',
    desc: 'Yetkili Mutlu Akü Satışı ve Servisi',
    logo: 'assets/images/mutlu-aku.png',
  },
  {
    id: 'b2',
    name: 'Varta',
    desc: 'Yetkili Varta Akü Bayiliği',
    logo: 'assets/images/varta.png',
  },
  {
    id: 'b3',
    name: 'Outopower',
    desc: 'Outopower Akü Yetkili Servisi',
    logo: 'assets/images/outopower.png',
  }
];

function getStoredBrands() {
  try {
    const raw = localStorage.getItem('furkan_brands');
    if (!raw) return defaultBrands;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultBrands;
  } catch (e) {
    return defaultBrands;
  }
}

function renderBrands() {
  const container = document.getElementById('brands-grid');
  container.innerHTML = '';
  const brands = getStoredBrands();
  brands.forEach(b => {
    const card = document.createElement('article');
    card.className = 'brand-card';
    card.setAttribute('data-id', b.id);
    card.innerHTML = `
      <img src="${b.logo}" alt="${b.name} logosu" />
      <h3>${b.name}</h3>
      <p>${b.desc}</p>
    `;
    container.appendChild(card);
  });

  if (typeof AOS !== 'undefined') AOS.refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  renderBrands();
});

// AOS animasyonları başlatma
AOS.init({ duration: 700, once: true });

// İletişim formu basit doğrulama ve uyarı
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const message = this.message.value.trim();

  if (!name || !email || !message) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }
  alert('Mesajınız için teşekkürler, en kısa sürede dönüş yapılacaktır.');
  this.reset();
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('nav ul');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  // Sayfa kaydırmayı kilitle / aç
  if (navLinks.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('active');

    // Hamburger animasyonu için opsiyonel: span’ları döndürme
    hamburger.classList.toggle('open');
  });
});



