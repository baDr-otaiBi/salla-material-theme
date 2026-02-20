/**
 * Product Page JavaScript
 * Salla Material Theme
 */

'use strict';

/* ===================================================
   PRODUCT PAGE
   =================================================== */
const ProductPage = (() => {

  function init() {
    initOptions();
    initAddToCart();
    initBuyNow();
    initReviews();
  }

  /* --- Options (color, size) --- */
  function initOptions() {
    // Color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatch.closest('.color-swatches')?.querySelectorAll('.color-swatch')
          .forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');

        // Update product image if data-image provided
        const imgSrc = swatch.dataset.image;
        if (imgSrc) {
          const mainImg = document.querySelector('.product-gallery__main img');
          if (mainImg) {
            mainImg.style.opacity = '0';
            setTimeout(() => {
              mainImg.src = imgSrc;
              mainImg.style.opacity = '1';
            }, 200);
          }
        }

        // Update selected label
        const label = swatch.closest('.product-options')
          ?.querySelector('.product-options__label span');
        if (label) label.textContent = swatch.title || swatch.dataset.name || '';
      });
    });

    // Size options
    document.querySelectorAll('.size-option:not(.disabled)').forEach(option => {
      option.addEventListener('click', () => {
        option.closest('.size-options')?.querySelectorAll('.size-option')
          .forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        const label = option.closest('.product-options')
          ?.querySelector('.product-options__label span');
        if (label) label.textContent = option.textContent.trim();
      });
    });
  }

  /* --- Add to cart --- */
  function initAddToCart() {
    const addBtn = document.querySelector('[data-add-to-cart-main]');
    if (!addBtn) return;

    addBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // Validate options selected
      const requiredOption = document.querySelector('.size-option:not(.selected)');
      const hasSizes = document.querySelector('.size-options');
      if (hasSizes && !document.querySelector('.size-option.selected')) {
        shakeElement(document.querySelector('.size-options'));
        if (window.Snackbar) {
          Snackbar.show('يرجى اختيار المقاس أولاً');
        }
        return;
      }

      if (window.CartManager) {
        await CartManager.animateAddToCart(addBtn);
        if (window.Snackbar) {
          Snackbar.show('تمت إضافة المنتج إلى السلة', {
            label: 'عرض السلة',
            callback: () => { window.location.href = '/cart'; }
          });
        }
        // Update cart badge
        const currentCount = parseInt(document.querySelector('[data-cart-count]')?.textContent || '0');
        CartManager.updateBadge(currentCount + 1);
      }
    });
  }

  /* --- Buy now --- */
  function initBuyNow() {
    const buyBtn = document.querySelector('[data-buy-now]');
    if (!buyBtn) return;

    buyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // In real Salla implementation, this triggers the direct checkout
      window.location.href = '/checkout?direct=1';
    });
  }

  /* --- Reviews --- */
  function initReviews() {
    const ratingInputs = document.querySelectorAll('[data-rating-input] .md-rating__star');

    ratingInputs.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        highlightStars(ratingInputs, index + 1);
      });
      star.addEventListener('mouseleave', () => {
        const selected = parseInt(star.closest('[data-rating-input]').dataset.selected || '0');
        highlightStars(ratingInputs, selected);
      });
      star.addEventListener('click', () => {
        const container = star.closest('[data-rating-input]');
        container.dataset.selected = index + 1;
        const input = container.querySelector('input[type="hidden"]');
        if (input) input.value = index + 1;
        highlightStars(ratingInputs, index + 1);
      });
    });
  }

  function highlightStars(stars, count) {
    stars.forEach((star, index) => {
      star.style.color = index < count ? '#f5a623' : 'var(--md-sys-color-outline)';
    });
  }

  /* --- Utility: Shake element --- */
  function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'md-shake 0.5s var(--md-sys-motion-easing-standard)';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }

  return { init };
})();

/* ===================================================
   PRODUCT IMAGE ZOOM
   =================================================== */
const ImageZoom = (() => {
  let isZoomed = false;
  let mainWrap = null;

  function init() {
    mainWrap = document.querySelector('.product-gallery__main');
    if (!mainWrap) return;

    mainWrap.style.cursor = 'zoom-in';
    mainWrap.addEventListener('click', toggle);
  }

  function toggle() {
    isZoomed = !isZoomed;
    if (isZoomed) {
      mainWrap.style.cursor = 'zoom-out';
      mainWrap.style.transform = 'scale(1.5)';
      mainWrap.style.zIndex = '50';
      mainWrap.style.borderRadius = '0';
    } else {
      mainWrap.style.cursor = 'zoom-in';
      mainWrap.style.transform = '';
      mainWrap.style.zIndex = '';
      mainWrap.style.borderRadius = '';
    }
  }

  return { init };
})();

/* ===================================================
   STICKY ADD TO CART BAR
   =================================================== */
const StickyAddToCart = (() => {

  function init() {
    const stickyBar = document.querySelector('.sticky-add-to-cart');
    const addBtn    = document.querySelector('[data-add-to-cart-main]');
    if (!stickyBar || !addBtn) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        stickyBar.classList.toggle('visible', !entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(addBtn);
  }

  return { init };
})();

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProductPage.init();
    ImageZoom.init();
    StickyAddToCart.init();
  });
} else {
  ProductPage.init();
  ImageZoom.init();
  StickyAddToCart.init();
}
