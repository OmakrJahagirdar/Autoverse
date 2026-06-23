// ────────────────────────────────────────────────
//  AutoVerse — Shared JavaScript
// ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Navbar scroll behaviour ──────────────────
  const navbar = document.querySelector('.navbar');
  const updateNavbar = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ── 2. Active nav link ───────────────────────────
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });

  // ── 3. Desktop dropdown (keyboard + click) ──────
  document.querySelectorAll('.nav-item').forEach(item => {
    const trigger = item.querySelector('.nav-link');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      const dropdown = item.querySelector('.nav-dropdown');
      if (!dropdown) return;
      
      // If the dropdown is already visible (e.g. hovered by mouse or opened), let navigation proceed.
      // Otherwise (on touch/keyboard first-press), prevent navigation and open the dropdown.
      const isVisible = window.getComputedStyle(dropdown).visibility === 'visible';
      if (!isVisible) {
        e.preventDefault();
        const isOpen = item.classList.contains('open');
        // close all other open dropdowns
        document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      }
    });
  });
  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    }
  });

  // ── 4. Hamburger / mobile nav ────────────────────
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  // ── 5. Mobile submenu toggles ────────────────────
  document.querySelectorAll('.nav-mobile-link[data-toggle]').forEach(link => {
    link.addEventListener('click', () => {
      const item = link.closest('.nav-mobile-item');
      item.classList.toggle('open');
    });
  });

  // ── 6. Expandable sections (accordion) ──────────
  document.querySelectorAll('.expand-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.expand-item');
      const wasOpen = item.classList.contains('open');
      // Close siblings in same group
      const group = item.closest('.expand-group');
      if (group) {
        group.querySelectorAll('.expand-item.open').forEach(el => {
          if (el !== item) el.classList.remove('open');
        });
      }
      item.classList.toggle('open', !wasOpen);
    });
  });
  // Open item based on URL hash, or first item by default
  const hash = location.hash;
  let openedFromHash = false;
  if (hash) {
    try {
      const targetItem = document.querySelector(hash + '.expand-item');
      if (targetItem) {
        targetItem.classList.add('open');
        openedFromHash = true;
        setTimeout(() => {
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!openedFromHash) {
    const firstItem = document.querySelector('.expand-item');
    if (firstItem) firstItem.classList.add('open');
  }

  // Handle hash change without reload
  window.addEventListener('hashchange', () => {
    const newHash = location.hash;
    if (newHash) {
      try {
        const targetItem = document.querySelector(newHash + '.expand-item');
        if (targetItem) {
          const group = targetItem.closest('.expand-group');
          if (group) {
            group.querySelectorAll('.expand-item.open').forEach(el => el.classList.remove('open'));
          }
          targetItem.classList.add('open');
          setTimeout(() => {
            targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 200);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // ── 7. Scroll animation observer ────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.anim-up, .anim-fade, .anim-left').forEach(el => observer.observe(el));

  // ── 8. Counter animation ────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => countObserver.observe(el));

  // ── 9. Contact form basic validation ────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Message Sent';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }, 1400);
    });
  }

  // ── 10. Smooth page transitions ─────────────────
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http')) return;
    
    // Check if the link is a hash anchor on the current page (e.g., about.html#history while on about.html)
    try {
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
        // Bypassing page fade-out so standard same-page hash scrolling/accordion opening takes over
        return;
      }
    } catch (err) {
      // Safe fallback if URL parser encounters an issue
    }

    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity .25s';
      setTimeout(() => { location.href = href; }, 260);
    });
  });
  // ── 11. Hero Background Showcase Slideshow ──────
  const slides = document.querySelectorAll('.showcase-slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    slides[currentSlide].classList.add('active');
    
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 5000);
  }

  // Fade in on load
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .4s';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  // ── 12. Back to Top Button ────────────────────────
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});