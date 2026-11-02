(() => {
  const loader = document.querySelector('.page-loader');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const backToTop = document.querySelector('.back-to-top');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const year = document.getElementById('year');

  // A short branded entrance, with a safe fallback if the load event is delayed.
  const hideLoader = () => window.setTimeout(() => loader?.classList.add('is-hidden'), 450);
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader, { once: true });
  window.setTimeout(hideLoader, 1800);

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu?.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu?.classList.toggle('open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  // Scroll progress, sticky header and back-to-top control.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      if (progress) progress.style.width = `${amount}%`;
      header?.classList.toggle('scrolled', window.scrollY > 35);
      backToTop?.classList.toggle('visible', window.scrollY > 650);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Reveal content as it enters the viewport. Fall back to visible for older browsers.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Keep the navigation highlight in sync with the visible page section.
  const sections = document.querySelectorAll('main section[id], main section.hero');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  if ('IntersectionObserver' in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id || 'top';
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Subtle cursor ambience on pointer devices only.
  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      glow.style.opacity = '.85';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
  }

  // FAQ accordions: keep the page tidy by allowing one answer open at a time.
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach(other => { if (other !== item) other.open = false; });
    });
  });

  // If an external image is unavailable, retain the designed frame and show a neutral fallback.
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
      img.parentElement?.classList.add('image-unavailable');
    }, { once: true });
  });
})();
