/**
 * Cart & Checkout JavaScript
 * Salla Material Theme
 */

'use strict';

/* ===================================================
   CART PAGE INTERACTIONS
   =================================================== */
const CartPage = (() => {

  function init() {
    initQuantityChanges();
    initRemoveItems();
    initCouponCode();
  }

  function initQuantityChanges() {
    document.querySelectorAll('.cart-item .quantity-selector').forEach(selector => {
      selector.addEventListener('quantitychange', (e) => {
        const item    = selector.closest('.cart-item');
        const priceEl = item?.querySelector('.cart-item__price');
        const unitPrice = parseFloat(selector.dataset.unitPrice || '0');

        if (priceEl && unitPrice) {
          const total = unitPrice * e.detail.value;
          priceEl.textContent = total.toLocaleString('ar-SA', {
            style: 'currency',
            currency: 'SAR',
          });
        }

        updateCartSummary();
      });
    });
  }

  function initRemoveItems() {
    document.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.cart-item');
        if (!item) return;

        item.style.transition = 'opacity 0.3s, transform 0.3s, max-height 0.4s';
        item.style.opacity  = '0';
        item.style.transform = 'translateX(30px)';
        item.style.maxHeight = item.offsetHeight + 'px';
        item.style.overflow  = 'hidden';

        requestAnimationFrame(() => {
          item.style.maxHeight = '0';
          item.style.marginBottom = '0';
          item.style.paddingTop = '0';
          item.style.paddingBottom = '0';
        });

        setTimeout(() => {
          item.remove();
          updateCartSummary();

          // Check if cart is empty
          const remaining = document.querySelectorAll('.cart-item');
          if (remaining.length === 0) {
            showEmptyCart();
          }
        }, 400);

        if (window.Snackbar) {
          Snackbar.show('تم حذف المنتج', {
            label: 'تراجع',
            callback: () => {
              // In real implementation, this would restore the item
              location.reload();
            }
          });
        }
      });
    });
  }

  function initCouponCode() {
    const couponForm = document.querySelector('[data-coupon-form]');
    if (!couponForm) return;

    couponForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = couponForm.querySelector('input[name="coupon"]');
      const btn   = couponForm.querySelector('button[type="submit"]');
      if (!input || !input.value.trim()) return;

      btn.disabled = true;
      btn.textContent = 'جاري التحقق...';

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      btn.disabled = false;
      btn.textContent = 'تطبيق';

      if (window.Snackbar) {
        Snackbar.show('تم تطبيق كود الخصم بنجاح');
      }
    });
  }

  function updateCartSummary() {
    const items = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    items.forEach(item => {
      const price = item.querySelector('.cart-item__price');
      if (price) {
        const num = parseFloat(price.textContent.replace(/[^0-9.]/g, ''));
        subtotal += isNaN(num) ? 0 : num;
      }
    });

    const subtotalEl = document.querySelector('[data-cart-subtotal]');
    const totalEl    = document.querySelector('[data-cart-total]');
    const shipping   = parseFloat(document.querySelector('[data-shipping-cost]')?.dataset.shippingCost || '0');

    if (subtotalEl) {
      subtotalEl.textContent = subtotal.toLocaleString('ar-SA', {
        style: 'currency', currency: 'SAR'
      });
    }
    if (totalEl) {
      totalEl.textContent = (subtotal + shipping).toLocaleString('ar-SA', {
        style: 'currency', currency: 'SAR'
      });
    }
  }

  function showEmptyCart() {
    const cartItems = document.querySelector('.cart-items');
    if (!cartItems) return;

    cartItems.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
          </svg>
        </div>
        <h2 class="empty-state__title">سلتك فارغة</h2>
        <p class="empty-state__desc">أضف منتجات إلى سلتك لتبدأ التسوق</p>
        <a href="/products" class="md-btn md-btn--filled">تسوق الآن</a>
      </div>
    `;
  }

  return { init };
})();

/* ===================================================
   MINI CART (DRAWER)
   =================================================== */
const MiniCart = (() => {
  let cartDrawer = null;
  let isOpen = false;

  function init() {
    cartDrawer = document.querySelector('.mini-cart-drawer');
    if (!cartDrawer) return;

    const cartBtns   = document.querySelectorAll('[data-open-cart]');
    const closeBtn   = cartDrawer.querySelector('[data-close-cart]');
    const overlay    = document.querySelector('.mini-cart-overlay');

    cartBtns.forEach(btn => btn.addEventListener('click', open));
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  function open() {
    isOpen = true;
    cartDrawer?.classList.add('open');
    document.querySelector('.mini-cart-overlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    cartDrawer?.classList.remove('open');
    document.querySelector('.mini-cart-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { init, open, close };
})();

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CartPage.init();
    MiniCart.init();
  });
} else {
  CartPage.init();
  MiniCart.init();
}
