// --- SETUP ---
gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- LENIS SCROLL ---
// Neutralizado por scroll-fallback.js; mantido para paridade com o design system.
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  smooth: true,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- TEXT SPLITTER UTILITY ---
function splitTextToWords(element) {
  const text = element.innerText;
  const words = text.split(' ');
  element.innerHTML = '';
  words.forEach(word => {
    const wordWrap = document.createElement('span');
    wordWrap.classList.add('word-wrap');
    wordWrap.innerHTML = `<span class="word-inner">${word}&nbsp;</span>`;
    element.appendChild(wordWrap);
  });
}

// Apply split to all elements with class .split-animate
document.querySelectorAll('.split-animate').forEach(el => {
  splitTextToWords(el);
});

// --- LOADER ---
// scroll-overrides.css oculta o preloader (compatibilidade offline). Quando ele esta
// oculto, o site inicia de imediato: o texto do hero nao pode esperar 3s de timeline.
const loaderEl = document.querySelector('.loader');
const loaderVisible = loaderEl && getComputedStyle(loaderEl).display !== 'none';

if (loaderVisible) {
  gsap.timeline({
    onComplete: () => {
      document.body.style.opacity = 1;
      initSite();
    }
  })
    .to('.loader-bar', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
    .to('.loader-text', { y: -50, opacity: 0, duration: 0.5 })
    .to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut' });
} else {
  document.body.style.opacity = 1;
  initSite();
}

function initSite() {
  // Hero Animations
  gsap.to('.hero-text span', {
    y: 0,
    stagger: 0.1,
    duration: reducedMotion ? 0.01 : 1.5,
    ease: 'power4.out'
  });
  gsap.to('.hero-fade', { opacity: 1, duration: reducedMotion ? 0.01 : 1, delay: reducedMotion ? 0 : 0.5 });

  // --- TEXT REVEAL ON SCROLL ---
  const splitElements = document.querySelectorAll('.split-animate');
  splitElements.forEach(el => {
    const words = el.querySelectorAll('.word-inner');
    if (reducedMotion) {
      gsap.set(words, { y: '0%' });
      return;
    }
    gsap.to(words, {
      y: "0%",
      duration: 1,
      ease: "power3.out",
      stagger: 0.02,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Parallax, card stack e footer sao movimento de area grande: gatilho vestibular.
  if (reducedMotion) return;

  // Hero Parallax
  gsap.to('.hero-img', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-img',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // --- CARD STACK ANIMATION ---
  const cards = gsap.utils.toArray('.card-item');

  cards.forEach((card, i) => {
    const nextCard = cards[i + 1];
    if (nextCard) {
      gsap.to(card.querySelector('.card-inner'), {
        scale: 0.9,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: nextCard,
          start: "top bottom",
          end: "top 10vh",
          scrub: true
        }
      });
    }
  });

  // Footer Parallax Effect
  gsap.from('.footer-sticky > div', {
    y: 100,
    opacity: 0.5,
    scale: 0.9,
    scrollTrigger: {
      trigger: '.footer-sticky',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true
    }
  });
}

// --- NAV: fundo solido fora do hero (legibilidade da logo e dos links) ---
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const sync = () => nav.classList.toggle('nav-solid', window.scrollY > window.innerHeight * 0.85);
  window.addEventListener('scroll', sync, { passive: true });
  sync();
})();

// --- CONTROLE DO VIDEO DO HERO (WCAG 2.2.2: movimento acima de 5s precisa de pausa) ---
(function () {
  const video = document.querySelector('.hero-img');
  const toggle = document.querySelector('.video-toggle');
  if (!video || !toggle) return;

  if (reducedMotion) {
    video.pause();
  } else {
    // autoplay pode ser recusado ate o video ter dados; tenta de novo quando puder.
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    video.addEventListener('canplay', tryPlay, { once: true });
  }

  function sync() {
    const paused = video.paused;
    toggle.querySelector('.video-toggle-label').textContent = paused ? 'Reproduzir' : 'Pausar';
    toggle.setAttribute('aria-pressed', String(paused));
  }

  toggle.addEventListener('click', () => {
    video.paused ? video.play() : video.pause();
    sync();
  });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
})();
