/**
 * Material You Theme - Main JavaScript
 * Salla Material Theme
 *
 * ملف الثيم الرئيسي - يتحكم في:
 * - الوضع الداكن/الفاتح
 * - نظام الألوان الديناميكي
 * - تفاعلات الهيدر
 * - القوائم المنسدلة
 * - تأثيرات الموجة (Ripple)
 * - Drawer المحمول
 */

'use strict';

/* ===================================================
   THEME MANAGER
   =================================================== */
const ThemeManager = (() => {

  const STORAGE_KEY_THEME  = 'salla-md-theme';
  const STORAGE_KEY_SCHEME = 'salla-md-color-scheme';
  const root = document.documentElement;

  /**
   * Initialize theme from settings or localStorage
   */
  function init() {
    // Get default from theme settings (set by Salla)
    const defaultTheme  = root.dataset.themeDefault  || 'system';
    const defaultScheme = root.dataset.colorScheme    || 'blue';

    // Apply saved or default values
    const savedTheme  = localStorage.getItem(STORAGE_KEY_THEME)  || defaultTheme;
    const savedScheme = localStorage.getItem(STORAGE_KEY_SCHEME) || defaultScheme;

    applyTheme(savedTheme);
    applyColorScheme(savedScheme);

    // Custom color if set
    const customColor = root.dataset.primaryColor;
    if (savedScheme === 'custom' && customColor && window.MaterialColorUtils) {
      MaterialColorUtils.applyCustomColor(customColor);
    }
  }

  /**
   * Apply light/dark/system theme
   * @param {'light'|'dark'|'system'} mode
   */
  function applyTheme(mode) {
    const resolvedMode = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;

    root.dataset.theme = resolvedMode;
    if (mode !== 'system') {
      localStorage.setItem(STORAGE_KEY_THEME, mode);
    }

    // Update toggle button icon
    updateToggleIcon(resolvedMode);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: resolvedMode } }));
  }

  /**
   * Toggle between light and dark
   */
  function toggleTheme() {
    const current = root.dataset.theme;
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /**
   * Apply color scheme preset
   * @param {'blue'|'purple'|'green'|'orange'|'red'|'teal'|'custom'} scheme
   */
  function applyColorScheme(scheme) {
    root.dataset.colorScheme = scheme;
    localStorage.setItem(STORAGE_KEY_SCHEME, scheme);

    // Remove inline custom vars if switching away from custom
    if (scheme !== 'custom') {
      const vars = ['10','20','30','40','50','60','70','80','90','95'];
      vars.forEach(tone => {
        root.style.removeProperty(`--md-ref-palette-primary${tone}`);
        root.style.removeProperty(`--md-ref-palette-secondary${tone}`);
        root.style.removeProperty(`--md-ref-palette-tertiary${tone}`);
      });
    }
  }

  /**
   * Update theme toggle button icon
   */
  function updateToggleIcon(theme) {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    const icon = btn.querySelector('[data-theme-icon]') || btn;
    if (theme === 'dark') {
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .38-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.38.39-1.02 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41-.38-.39-1.02-.39-1.41 0z"/>
      </svg>`;
    } else {
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
      </svg>`;
    }
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY_THEME) || localStorage.getItem(STORAGE_KEY_THEME) === 'system') {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  return { init, applyTheme, toggleTheme, applyColorScheme };
})();

/* ===================================================
   HEADER MANAGER
   =================================================== */
const HeaderManager = (() => {
  let header, lastScrollY = 0, ticking = false;

  function init() {
    header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const scrollY = window.scrollY;
    if (scrollY > 8) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  return { init };
})();

/* ===================================================
   DRAWER MANAGER
   =================================================== */
const DrawerManager = (() => {
  let drawer, overlay, isOpen = false;

  function init() {
    drawer  = document.querySelector('.site-drawer');
    overlay = document.querySelector('.site-drawer__overlay');

    if (!drawer) return;

    // Toggle buttons
    document.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });

    // Close on overlay click
    overlay?.addEventListener('click', close);

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  function open() {
    isOpen = true;
    drawer.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Trap focus inside drawer
    setTimeout(() => {
      const firstFocusable = drawer.querySelector('button, a, input');
      firstFocusable?.focus();
    }, 300);
  }

  function close() {
    isOpen = false;
    drawer.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggle() {
    isOpen ? close() : open();
  }

  return { init, open, close, toggle };
})();

/* ===================================================
   RIPPLE EFFECT
   =================================================== */
const RippleEffect = (() => {

  function createRipple(element, event) {
    const rect   = element.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y      = (event.clientY || rect.top  + rect.height / 2) - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'md-ripple';
    ripple.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${x}px;
      top:    ${y}px;
    `;

    element.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function init() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.md-btn, .md-icon-btn, .md-fab, .md-list-item, .md-tab');
      if (target) {
        target.style.position = target.style.position || 'relative';
        target.style.overflow = 'hidden';
        createRipple(target, e);
      }
    });
  }

  return { init, createRipple };
})();

/* ===================================================
   SNACKBAR
   =================================================== */
const Snackbar = (() => {
  let currentSnackbar = null;
  let hideTimeout = null;

  function show(message, action = null, duration = 4000) {
    // Remove existing
    if (currentSnackbar) {
      currentSnackbar.remove();
      clearTimeout(hideTimeout);
    }

    const snackbar = document.createElement('div');
    snackbar.className = 'md-snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');

    snackbar.innerHTML = `
      <span class="md-snackbar__message">${message}</span>
      ${action ? `<button class="md-snackbar__action">${action.label}</button>` : ''}
    `;

    document.body.appendChild(snackbar);
    currentSnackbar = snackbar;

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => snackbar.classList.add('show'));
    });

    // Action callback
    if (action?.callback) {
      snackbar.querySelector('.md-snackbar__action')?.addEventListener('click', () => {
        action.callback();
        hide(snackbar);
      });
    }

    // Auto-hide
    hideTimeout = setTimeout(() => hide(snackbar), duration);
    return snackbar;
  }

  function hide(snackbar) {
    snackbar = snackbar || currentSnackbar;
    if (!snackbar) return;
    snackbar.classList.remove('show');
    snackbar.addEventListener('transitionend', () => snackbar.remove(), { once: true });
  }

  return { show, hide };
})();

/* ===================================================
   PRODUCT GALLERY
   =================================================== */
const ProductGallery = (() => {

  function init() {
    const gallery = document.querySelector('.product-gallery');
    if (!gallery) return;

    const mainImg = gallery.querySelector('.product-gallery__main img');
    const thumbs  = gallery.querySelectorAll('.product-gallery__thumb');

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        // Update main image
        const newSrc    = thumb.dataset.src    || thumb.querySelector('img')?.src;
        const newSrcset = thumb.dataset.srcset || '';

        if (mainImg && newSrc) {
          mainImg.style.opacity = '0';
          mainImg.style.transform = 'scale(0.97)';
          setTimeout(() => {
            mainImg.src = newSrc;
            if (newSrcset) mainImg.srcset = newSrcset;
            mainImg.style.opacity = '1';
            mainImg.style.transform = 'scale(1)';
          }, 200);
        }

        // Update active thumb
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Main image style for transition
    if (mainImg) {
      mainImg.style.transition = 'opacity 0.2s, transform 0.2s';
    }
  }

  return { init };
})();

/* ===================================================
   QUANTITY SELECTOR
   =================================================== */
const QuantitySelector = (() => {

  function init() {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
      const minusBtn = selector.querySelector('[data-qty-minus]');
      const plusBtn  = selector.querySelector('[data-qty-plus]');
      const display  = selector.querySelector('.quantity-selector__value');
      const input    = selector.querySelector('input[type="hidden"]');

      let value = parseInt(display?.textContent || '1');
      const min = parseInt(selector.dataset.min || '1');
      const max = parseInt(selector.dataset.max || '999');

      function update(newValue) {
        value = Math.min(max, Math.max(min, newValue));
        if (display) display.textContent = value;
        if (input) input.value = value;
        if (minusBtn) minusBtn.disabled = value <= min;
        if (plusBtn)  plusBtn.disabled  = value >= max;

        selector.dispatchEvent(new CustomEvent('quantitychange', { detail: { value } }));
      }

      minusBtn?.addEventListener('click', () => update(value - 1));
      plusBtn?.addEventListener('click',  () => update(value + 1));

      update(value);
    });
  }

  return { init };
})();

/* ===================================================
   TABS
   =================================================== */
const TabsManager = (() => {

  function init() {
    document.querySelectorAll('[data-tabs]').forEach(tabsContainer => {
      const tabs    = tabsContainer.querySelectorAll('[data-tab]');
      const panels  = document.querySelectorAll('[data-tab-panel]');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;

          // Update tabs
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Update panels
          panels.forEach(panel => {
            const isTarget = panel.dataset.tabPanel === target;
            panel.hidden = !isTarget;
            if (isTarget) {
              panel.style.animation = 'md-fade-in-up 0.3s var(--md-sys-motion-easing-emphasized-decelerate) both';
            }
          });
        });
      });
    });
  }

  return { init };
})();

/* ===================================================
   FILTER SIDEBAR (Mobile)
   =================================================== */
const FilterSidebar = (() => {

  function init() {
    const filterBtn = document.querySelector('[data-filter-toggle]');
    const sidebar   = document.querySelector('.sidebar');
    if (!filterBtn || !sidebar) return;

    filterBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      const isOpen = sidebar.classList.contains('mobile-open');
      filterBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  return { init };
})();

/* ===================================================
   CART MANAGER
   =================================================== */
const CartManager = (() => {

  function updateBadge(count) {
    const badges = document.querySelectorAll('[data-cart-count]');
    badges.forEach(badge => {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
      if (count > 0) {
        badge.style.animation = 'md-badge-pop 0.4s var(--md-sys-motion-easing-emphasized-decelerate)';
        badge.addEventListener('animationend', () => { badge.style.animation = ''; }, { once: true });
      }
    });
  }

  function animateAddToCart(btn) {
    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = `
      <svg class="md-progress-circular" style="width:20px;height:20px" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-dasharray="60,100"/>
      </svg>
    `;

    return new Promise(resolve => {
      setTimeout(() => {
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> تمت الإضافة`;
        btn.style.backgroundColor = 'var(--md-sys-color-tertiary)';
        btn.style.color = 'var(--md-sys-color-on-tertiary)';

        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.disabled = false;
          resolve();
        }, 1500);
      }, 800);
    });
  }

  return { updateBadge, animateAddToCart };
})();

/* ===================================================
   WISHLIST MANAGER
   =================================================== */
const WishlistManager = (() => {

  function toggle(btn, productId) {
    const isActive = btn.classList.toggle('active');
    const icon = btn.querySelector('svg');

    if (isActive) {
      icon.style.animation = 'md-heartbeat 0.6s var(--md-sys-motion-easing-emphasized)';
      icon.addEventListener('animationend', () => { icon.style.animation = ''; }, { once: true });
      Snackbar.show('تمت الإضافة إلى المفضلة', {
        label: 'عرض المفضلة',
        callback: () => { window.location.href = '/wishlist'; }
      });
    } else {
      Snackbar.show('تم الحذف من المفضلة');
    }
  }

  function init() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(btn, btn.dataset.productId);
      });
    });
  }

  return { init, toggle };
})();

/* ===================================================
   SCROLL ANIMATIONS (Intersection Observer)
   =================================================== */
const ScrollAnimations = (() => {

  function init() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || (index * 50);
          setTimeout(() => {
            el.classList.add('md-animate-fade-in-up');
            el.style.opacity = '1';
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -64px 0px'
    });

    document.querySelectorAll('[data-animate]').forEach((el, index) => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

  return { init };
})();

/* ===================================================
   VIEW TOGGLE (Grid/List)
   =================================================== */
const ViewToggle = (() => {

  function init() {
    const gridBtn = document.querySelector('[data-view="grid"]');
    const listBtn = document.querySelector('[data-view="list"]');
    const grid    = document.querySelector('.products-grid');

    if (!gridBtn || !listBtn || !grid) return;

    gridBtn.addEventListener('click', () => {
      grid.classList.remove('products-grid--list');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      localStorage.setItem('salla-view', 'grid');
    });

    listBtn.addEventListener('click', () => {
      grid.classList.add('products-grid--list');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      localStorage.setItem('salla-view', 'list');
    });

    // Restore saved view
    const savedView = localStorage.getItem('salla-view');
    if (savedView === 'list') {
      listBtn.click();
    }
  }

  return { init };
})();

/* ===================================================
   COLOR SCHEME PICKER
   =================================================== */
const ColorSchemePicker = (() => {

  function init() {
    document.querySelectorAll('[data-color-scheme-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scheme = btn.dataset.colorSchemeBtn;
        ThemeManager.applyColorScheme(scheme);

        // Update active state
        document.querySelectorAll('[data-color-scheme-btn]').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      });
    });
  }

  return { init };
})();

/* ===================================================
   INITIALIZE EVERYTHING
   =================================================== */
function initTheme() {
  ThemeManager.init();
  HeaderManager.init();
  DrawerManager.init();
  RippleEffect.init();
  ProductGallery.init();
  QuantitySelector.init();
  TabsManager.init();
  FilterSidebar.init();
  WishlistManager.init();
  ScrollAnimations.init();
  ViewToggle.init();
  ColorSchemePicker.init();

  // Theme toggle button
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => ThemeManager.toggleTheme());
  });

  // Add to cart buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await CartManager.animateAddToCart(btn);
      Snackbar.show('تمت إضافة المنتج إلى السلة', {
        label: 'عرض السلة',
        callback: () => { window.location.href = '/cart'; }
      });
    });
  });
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Export globals
window.ThemeManager  = ThemeManager;
window.Snackbar      = Snackbar;
window.CartManager   = CartManager;
window.WishlistManager = WishlistManager;
