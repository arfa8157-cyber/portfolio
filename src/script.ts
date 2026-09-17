/**
 * MOHAMED ARAFA - PORTFOLIO INTERACTIVITY SCRIPT
 * TypeScript implementation for mobile navigation, testimonials rating,
 * project carousel controls, active scroll spy, and reveal animations.
 */

// Define interfaces for state management
interface TestimonialState {
  currentRating: number;
  maxRating: number;
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbarScroll();
  initMobileNavigation();
  initTestimonialRating();
  initProjectCarousel();
  initActiveSectionObserver();
  initScrollReveal();
  initCardPointerEffects();
  initHeroParallax();
  initBackToTop();
});

function initTheme(): void {
  const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement | null;
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

  const applyTheme = (theme: 'light' | 'dark'): void => {
    document.documentElement.dataset.theme = theme;
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  };

  applyTheme(initialTheme === 'light' ? 'light' : 'dark');
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', nextTheme);
    applyTheme(nextTheme);
  });
}

/**
 * 1. Sticky Navbar Scroll State
 */
function initNavbarScroll(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  const hero = document.querySelector<HTMLElement>('.hero-section');
  if (!header || !hero) return;

  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('scrolled', !entry.isIntersecting);
  }, { threshold: 0, rootMargin: '-30px 0px 0px 0px' });
  observer.observe(hero);
}

/**
 * 2. Accessible Mobile Navigation
 */
function initMobileNavigation(): void {
  const toggleBtn = document.querySelector<HTMLButtonElement>('.mobile-nav-toggle');
  const mobileMenu = document.querySelector<HTMLElement>('.mobile-nav-menu');
  const backdrop = document.querySelector<HTMLElement>('.mobile-nav-backdrop');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-links .nav-link');

  if (!toggleBtn || !mobileMenu || !backdrop) return;

  const openMenu = (): void => {
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus the first link for keyboard accessibility
    const firstLink = navLinks[0];
    if (firstLink) {
      firstLink.focus();
    }
  };

  const closeMenu = (): void => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    backdrop.classList.remove('open');
    mobileMenu.inert = true;
    document.body.style.overflow = '';
    toggleBtn.focus();
  };

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      mobileMenu.inert = false;
      openMenu();
    }
  });

  mobileMenu.inert = true;

  // Close when clicking on backdrop
  backdrop.addEventListener('click', closeMenu);

  // Close when clicking any mobile nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * 3. Interactive Testimonial Rating System
 * Features:
 * - Dynamic 1 to 5 star switcher
 * - Accessible aria-live announcements for screen readers
 * - Direct star click selection
 */
function initTestimonialRating(): void {
  const state: TestimonialState = {
    currentRating: 5,
    maxRating: 5
  };

  const changeRatingBtn = document.getElementById('changeRatingBtn') as HTMLButtonElement | null;
  const ratingAnnouncement = document.getElementById('ratingLiveAnnounce') as HTMLElement | null;
  const starButtons = document.querySelectorAll<HTMLButtonElement>('.star-btn');
  const ratingText = document.getElementById('ratingValueText') as HTMLElement | null;

  if (!changeRatingBtn || !starButtons.length) return;

  const updateStarDisplay = (newRating: number): void => {
    state.currentRating = newRating;

    // Update star button icons
    starButtons.forEach((btn, index) => {
      const starIndex = index + 1;
      if (starIndex <= state.currentRating) {
        btn.innerHTML = '★';
        btn.classList.remove('empty');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.innerHTML = '☆';
        btn.classList.add('empty');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Update label text
    if (ratingText) {
      ratingText.textContent = `${state.currentRating} / ${state.maxRating} Stars`;
    }

    // Announce to screen readers via aria-live
    if (ratingAnnouncement) {
      ratingAnnouncement.textContent = `Testimonial rating changed to ${state.currentRating} out of ${state.maxRating} stars.`;
    }
  };

  // "Change Rating" button cycles rating: 5 -> 4 -> 3 -> 2 -> 1 -> 5
  changeRatingBtn.addEventListener('click', () => {
    let nextRating = state.currentRating - 1;
    if (nextRating < 1) {
      nextRating = state.maxRating;
    }
    updateStarDisplay(nextRating);
  });

  // Direct star click
  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const ratingVal = parseInt(btn.dataset.rating || '5', 10);
      if (!isNaN(ratingVal)) {
        updateStarDisplay(ratingVal);
      }
    });
  });
}

/**
 * 4. Project Showcase Horizontal Scroll Controls
 */
function initProjectCarousel(): void {
  const track = document.getElementById('projectsTrack') as HTMLElement | null;
  const prevBtn = document.getElementById('prevProjectBtn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('nextProjectBtn') as HTMLButtonElement | null;

  if (!track || !prevBtn || !nextBtn) return;

  const updateButtonStates = (): void => {
    const scrollLeft = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth - 5;

    prevBtn.disabled = scrollLeft <= 5;
    nextBtn.disabled = scrollLeft >= maxScroll;
  };

  const getScrollAmount = (): number => {
    const firstCard = track.querySelector<HTMLElement>('.project-card');
    if (firstCard) {
      // Card width + gap
      return firstCard.offsetWidth + 28;
    }
    return 360;
  };

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtonStates, { passive: true });
  window.addEventListener('resize', updateButtonStates, { passive: true });

  // Initial state check
  setTimeout(updateButtonStates, 100);
}

/**
 * 5. Active Section Indicator (IntersectionObserver)
 */
function initActiveSectionObserver(): void {
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const desktopLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-desktop .nav-link');
  const mobileLinks = document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-links .nav-link');

  if (!sections.length) return;

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        if (!currentId) return;

        const updateLinks = (links: NodeListOf<HTMLAnchorElement>): void => {
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        };

        updateLinks(desktopLinks);
        updateLinks(mobileLinks);
      }
    });
  }, observerOptions);

  sections.forEach((sec) => observer.observe(sec));
}

/**
 * 6. Subtle Scroll Reveal Animations
 */
function initScrollReveal(): void {
  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll<HTMLElement>('.reveal');
  const cardElements = document.querySelectorAll<HTMLElement>('.skill-card, .project-card, .service-card, .contact-card, .stat-card');

  cardElements.forEach((card, index) => {
    card.classList.add('reveal-card');
    card.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
  });
  const allRevealElements = document.querySelectorAll<HTMLElement>('.reveal, .reveal-card');

  if (prefersReducedMotion) {
    allRevealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    }
  );

  allRevealElements.forEach((el) => revealObserver.observe(el));
}

function initCardPointerEffects(): void {
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('.project-card, .service-card, .skill-card').forEach((card) => {
    let frame = 0;
    card.addEventListener('pointermove', (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
        frame = 0;
      });
    });
    card.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
      frame = 0;
    });
  });
}

function initHeroParallax(): void {
  const hero = document.querySelector<HTMLElement>('.hero-section');
  if (!hero || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  hero.addEventListener('pointermove', (event: PointerEvent) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;
      hero.style.setProperty('--parallax-x', `${x}px`);
      hero.style.setProperty('--parallax-y', `${y}px`);
      frame = 0;
    });
  });
  hero.addEventListener('pointerleave', () => {
    if (frame) cancelAnimationFrame(frame);
    hero.style.removeProperty('--parallax-x');
    hero.style.removeProperty('--parallax-y');
    frame = 0;
  });
}

/**
 * 7. Back-To-Top Button
 */
function initBackToTop(): void {
  const backToTopBtn = document.getElementById('backToTopBtn') as HTMLButtonElement | null;
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
