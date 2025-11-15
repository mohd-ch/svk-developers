/* ---------- FILTER LOGIC (safe: uses event passed from onclick) ---------- */
function filterProjects(ev, type) {
  // set active styling
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  ev?.currentTarget?.classList?.add('active'); // safe fallback for older browsers

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

/**
 * Robust counter:
 * - accepts data-target like "35+", "250", "250M"
 * - extracts leading digits as numeric target
 * - uses trailing non-digits as suffix (or data-suffix attribute if provided)
 */
function animateCounter(el) {
  const raw = el.getAttribute('data-target') || '0';
  const numericMatch = raw.toString().match(/^(\d+)/);
  const target = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = el.dataset.suffix || (raw.toString().replace(/\d/g, '') || '');

  const duration = 1400;
  let start = 0;
  const stepTime = Math.max(10, Math.floor(duration / (target || 1)));
  const updater = () => {
    start += 1;
    if (start >= target) {
      el.textContent = target + (suffix || '');
    } else {
      el.textContent = start;
      setTimeout(updater, stepTime);
    }
  };
  updater();
}
window.addEventListener('scroll', startCountersIfVisible);
window.addEventListener('load', startCountersIfVisible);

/* ---------- GALLERY DATA ----------
   Use lowercase / hyphen filenames matching the repo normalization you ran.
   If you later change filenames, update these arrays accordingly.
*/
const galleries = {
  1: [
    "image/lancat/lancast2.jpeg",
    "image/lancat/lancast3.jpeg",
    "image/lancat/lancat1.jpeg",
    "image/lancat/lancst4.jpeg",
    "image/lancat/lancast5.jpeg"
  ],
  2: [
    "image/Hotel castle rock inn/cr.jpeg",
    "image/Hotel castle rock inn/cr1.jpeg",
    "image/Hotel castle rock inn/cr2.jpeg"
  ],
  3: [
    "image/Hotel Aqua Galaxy/aag.jpeg",
    "image/Hotel Aqua Galaxy/ag.jpeg",
    "image/Hotel Aqua Galaxy/ag1.jpeg",
    "image/Hotel Aqua Galaxy/ag2.jpeg",
    "image/Hotel Aqua Galaxy/ag3.jpeg"
  ],
  4: [
    "image/HVS/hvs.jpeg",
    "image/HVS/hvs1.jpeg",
    "image/HVS/hvs2.jpeg",
    "image/HVS/hvs3.jpeg",
    "image/HVS/hvs4.jpeg"
  ],
  5: [
    "image/Victory Park/vp.jpeg",
    "image/Victory Park/vp1.jpeg",
    "image/Victory Park/vp3.jpeg",
    "image/Victory Park/vp4.jpeg",
    "image/Victory Park/vp5.jpeg"
  ],
  6: [
    "image/Elegent/e3.jpeg",
    "image/Elegent/e5.jpeg",
    "image/Elegent/elegent.jpeg",
    "image/Elegent/elegent2.jpeg"
  ],
  7: [
    "image/Empire/empire.jpeg",
    "image/Empire/empire1.jpeg",
    "image/Empire/empire2.jpeg",
    "image/Empire/empire3.jpeg"
  ]
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
  if (modal) modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function renderModal() {
  if (!currentGallery || currentGallery.length === 0) return;
  if (modalImage) modalImage.src = currentGallery[currentIndex];

  if (modalThumbs) {
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
}

function closeGallery() {
  if (modal) modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // re-enable scroll
  currentGallery = null;
  currentIndex = 0;
}

// Attach modal listeners safely
modalOverlay?.addEventListener('click', closeGallery);
modalClose?.addEventListener('click', closeGallery);

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
  if (!modal) return;
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

/* ---------- PHONE COPY CTA + founder call behavior ---------- */
/*
  - primaryNumber: used for header copy button (copyPrimaryPhone)
  - founder call links (.founder-call) keep their tel: href, but on desktop we copy the number to clipboard and show a quick 'Copied' state
*/
const copyBtn = document.getElementById('copyPrimaryPhone');
const phoneLink = document.getElementById('primaryPhone');
// primary header number (keep this the contact you want in header)
const primaryNumber = '+918108465827'; // header primary contact (Ansar office as you gave earlier)

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(primaryNumber).then(() => {
        const old = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(()=> copyBtn.textContent = old, 1400);
      }).catch(()=> {
        // fallback simple UX in case clipboard API fails
        copyTextFallback(primaryNumber, copyBtn);
      });
    } else {
      copyTextFallback(primaryNumber, copyBtn);
    }
  });
}

function copyTextFallback(text, btn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); btn.textContent = 'Copied'; } catch(e) { /* ignore */ }
  ta.remove();
  setTimeout(()=> btn.textContent = 'Copy', 1400);
}

// Founder call links: on mobile follow tel: link (native dialing). On desktop, copy the number instead.
document.querySelectorAll('.founder-call').forEach(link => {
  // get the href tel number (if present)
  const href = link.getAttribute('href') || '';
  const telMatch = href.match(/tel:\+?([\d]+)/);
  const founderNumber = telMatch ? ('+' + telMatch[1]) : null;

  link.addEventListener('click', (e) => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isMobile) {
      // mobile: let it dial
      return;
    }

    // desktop: prevent navigation and copy number if present
    e.preventDefault();
    if (founderNumber) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(founderNumber).then(() => {
          const old = link.textContent;
          link.textContent = 'Copied ' + founderNumber;
          setTimeout(() => { link.innerHTML = 'Call'; }, 1400);
        }).catch(() => {
          copyTextFallback(founderNumber, link);
        });
      } else {
        copyTextFallback(founderNumber, link);
      }
    }
  });
});

/* ---------- LOGO CREST ANIMATION (small) ---------- */
const crest = document.querySelector('.logo-crest');
if (crest) {
  crest.style.transition = 'transform .7s cubic-bezier(.2,.9,.3,1), opacity .6s';
  crest.style.transform = 'translateY(-8px) scale(.92)';
  crest.style.opacity = '0';
  // animate in on load
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      crest.style.transform = 'translateY(0) scale(1)';
      crest.style.opacity = '1';
    }, 220);
  });
}

/* ---------- UTILITY: ensure filter buttons have event currentTarget when called inline ----------
   Some older browsers might not set ev.currentTarget when calling onclick inline.
   We added a fail-safe above in filterProjects (ev?.currentTarget?.classList...) */
