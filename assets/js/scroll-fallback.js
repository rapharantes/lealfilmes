// Disable Lenis and ensure native scroll
(function () {
  // Prevent Lenis from being created
  var originalLenis = window.Lenis;
  window.Lenis = function () {
    console.log('Lenis disabled for offline compatibility');
    return {
      destroy: function () {},
      raf: function () {},
      scrollTo: function () {}
    };
  };

  // Force overflow on load
  function forceScroll() {
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.opacity = '1';

    // Hide loaders
    var loaders = document.querySelectorAll('.loader, .preloader');
    loaders.forEach(function (l) {
      l.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceScroll);
  } else {
    forceScroll();
  }

  window.addEventListener('load', forceScroll);
  setTimeout(forceScroll, 100);
  setTimeout(forceScroll, 500);

  // Salvaguarda: se o GSAP nao carregar (CDN bloqueado/offline), o texto do hero
  // e os reveals ficariam invisiveis. Forca o estado final.
  setTimeout(function () {
    if (window.gsap) return;
    document.querySelectorAll('.hero-text span, .word-inner').forEach(function (el) {
      el.style.transform = 'none';
    });
    document.querySelectorAll('.hero-fade').forEach(function (el) {
      el.style.opacity = '1';
    });
    document.body.style.opacity = '1';
  }, 1200);
})();
