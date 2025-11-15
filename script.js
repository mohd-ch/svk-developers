/* ---------- FILTER LOGIC (safe: uses event passed from onclick) ---------- */
function filterProjects(ev, type) {
  // set active styling
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  ev.currentTarget?.classList?.add('active'); // safe fallback for older browsers

  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    if (type === 'all') {
      card.style.display = 'flex';
    } else {
      card.style.display = card.classList.contains(type) ? 'flex' : 'none';
    }
  });
}

/* ---------- COUNTER (animate on scroll into view) ---------- */
const counters = document.querySelectorAll('.stat-number');
let countersStarted = false;

function startCountersIfVisible() {
  if (countersStarted) return;
  const first = document.querySelector('.stat-wrapper');
  if (!first) return;
  const rect = first.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom >= 0) {
    counters.forEach(el => animateCounter(el));
    countersStarted = true;
  }
}

function animateCounter(el) {
  const target = +el.getAttribute('data-target') || 0;
  const duration = 1400;
  let start = 0;
  const stepTime = Math.max(10, Math.floor(duration / (target || 1)));
  const updater = () => {
    start += 1;
    if (start >= target) {
      el.textContent = target + (el.dataset.suffix || '');
    } else {
      el.textContent = start;
      setTimeout(updater, stepTime);
    }
  };
  updater();
}
window.addEventListener('scroll', startCountersIfVisible);
window.addEventListener('load', startCountersIfVisible);

/* ---------- GALLERY DATA ---------- */
/* Keep filenames as in your provided structure; arrays defined per id */
const galleries = {
  1: ["image/lancat/lancast2.jpeg","image/lancat/Lancast3.jpeg","image/lancat/Lancat1.jpeg","image/lancat/Lancst4.jpeg","image/lancast/Lancast5.jpeg"],
  2: ["image/Hotel castle rock inn/CR.jpeg","image/Hotel castle rock inn/CR1.jpeg","image/Hotel castle rock inn/CR2.jpeg"],
  3: ["image/Hotel Aqua Galaxy/AAG.jpeg","image/Hotel Aqua Galaxy/AG.jpeg","image/Hotel Aqua Galaxy/AG1.jpeg","image/Hotel Aqua Galaxy/AG2.jpeg","image/Hotel Aqua Galaxy/AG3.jpeg"],
  4: ["image/HVS/HVS.jpeg","image/HVS/HVS1.jpeg","image/HVS/HVS2.jpeg","image/HVS/HVS3.jpeg","image/HVS/HVS4.jpeg"],
  5: ["image/Victory Park/VP.jpeg","image/Victory Park/VP1.jpeg","image/Victory Park/VP3.jpeg","image/Victory Park/VP4.jpeg","image/Victory Park/VP5.jpeg"],
  6: ["image/Elegent/E3.jpeg","image/Elegent/E5.jpeg","image/Elegent/Elegent.jpeg","image/Elegent/Elegent2.jpeg"],
  7: ["image/Empire/Empire.jpeg","image/Empire/Empire1.jpeg","image/Empire/Empire2.jpeg","image/Empire/Empire3.jpeg"]
};

/* ---------- MODAL / GALLERY FUNCTIONS ---------- */
const modal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const modalThumbs = document.getElementById('modalThumbs');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentGallery = null;
let currentIndex = 0;

function openGallery(id) {
  const imgs = galleries[id];
  if (!imgs || imgs.length === 0) return;

  currentGallery = imgs;
  currentIndex = 0;

  renderModal();
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function renderModal() {
  if (!currentGallery || currentGallery.length === 0) return;
  // show main image
  modalImage.src = currentGallery[currentIndex];
  // build thumbnails
  modalThumbs.innerHTML = '';
  currentGallery.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `photo ${i+1}`;
    img.className = i === currentIndex ? 'active' : '';
    img.addEventListener('click', () => {
      currentIndex = i;
      renderModal();
    });
    modalThumbs.appendChild(img);
  });
}

// close modal
function closeGallery() {
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = ''; // re-enable scroll
  currentGallery = null;
  currentIndex = 0;
}

// overlay click to close
modalOverlay?.addEventListener('click', closeGallery);
modalClose?.addEventListener('click', closeGallery);

// prev/next buttons
prevBtn?.addEventListener('click', () => {
  if (!currentGallery || currentGallery.length === 0) return;
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  renderModal();
});
nextBtn?.addEventListener('click', () => {
  if (!currentGallery || currentGallery.length === 0) return;
  currentIndex = (currentIndex + 1) % currentGallery.length;
  renderModal();
});

// keyboard support (Escape to close, arrows)
document.addEventListener('keydown', (e) => {
  if (modal.getAttribute('aria-hidden') === 'false') {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') prevBtn?.click();
    if (e.key === 'ArrowRight') nextBtn?.click();
  }
});

// touch swipe support (basic)
let startX = 0;
let endX = 0;
const threshold = 60;

modalImage?.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
modalImage?.addEventListener('touchmove', (e) => { endX = e.touches[0].clientX; });
modalImage?.addEventListener('touchend', () => {
  const diff = startX - endX;
  if (diff > threshold) nextBtn?.click();
  else if (diff < -threshold) prevBtn?.click();
  startX = endX = 0;
});

/* ---------- PHONE COPY CTA ---------- */
const copyBtn = document.getElementById('copyPrimaryPhone');
const phoneLink = document.getElementById('primaryPhone');
const primaryNumber = '+918108465827';

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(primaryNumber).then(() => {
        copyBtn.textContent = 'Copied';
        setTimeout(()=> copyBtn.textContent = 'Copy', 1500);
      });
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = primaryNumber;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); copyBtn.textContent = 'Copied'; } catch(e) {}
      ta.remove();
      setTimeout(()=> copyBtn.textContent = 'Copy', 1500);
    }
  });
}

// also copy on desktop click of the phone link (keeps native click for mobiles)
if (phoneLink) {
  phoneLink.addEventListener('click', (e) => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(primaryNumber).then(() => {
          phoneLink.textContent = 'Copied ' + primaryNumber;
          setTimeout(()=> phoneLink.innerHTML = '📞 +91 81084 65827', 1500);
        });
      }
    }
  });
}

/* ---------- UTILITY: ensure filter buttons have event currentTarget when called inline ----------
   Some older browsers might not set ev.currentTarget when calling onclick inline.
   We added a fail-safe above in filterProjects (ev.currentTarget?.classList...) */
