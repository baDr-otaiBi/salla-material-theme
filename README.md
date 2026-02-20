# Material You - Salla Theme

ثيم متجر سلة بطابع **Material You (Material Design 3)** — تصميم عصري وأنيق مع دعم كامل للعربية والوضع الداكن.

---

## المميزات

### نظام الألوان الديناميكي
- **6 أنظمة ألوان** جاهزة: أزرق، بنفسجي، أخضر، برتقالي، أحمر، فيروزي
- دعم **اللون المخصص** مع توليد لوحة ألوان كاملة تلقائياً عبر OKLCH
- **وضع داكن وفاتح** مع تبديل تلقائي حسب إعدادات النظام

### Material Design 3 كامل
- **رموز التصميم (Design Tokens)** — ألوان، خطوط، أشكال، حركة
- **نظام الارتفاع (Elevation)** — 5 مستويات بظلال دقيقة
- **نظام الشكل (Shape)** — Corner radii من Extra Small إلى Full
- **نظام الحركة (Motion)** — Easing curves و Duration tokens

### مكونات UI كاملة
| المكون | الأنماط |
|--------|---------|
| أزرار | Filled, Tonal, Outlined, Text, Elevated, FAB |
| بطاقات | Elevated, Filled, Outlined |
| حقول نص | Filled, Outlined |
| Chips | Assist, Filter, Suggestion, Input |
| Navigation | Top Bar, Drawer, Bottom Nav |
| Tabs | Primary |
| Dialog | Modal |
| Snackbar | مع إجراء |

### صفحات كاملة
- الصفحة الرئيسية (3 أنماط للبنر)
- قائمة المنتجات مع فلاتر
- صفحة المنتج مع معرض الصور
- سلة التسوق
- تسجيل الدخول

### دعم عربي متكامل
- اتجاه RTL بالكامل
- 5 خطوط عربية: Noto Kufi, Cairo, Tajawal, Almarai, IBM Plex Arabic
- تخطيط مرن يعمل مع اليمين-لليسار

---

## هيكل الملفات

```
salla-material-theme/
├── theme.json                       # تعريف الثيم
├── config/
│   └── settings.json                # إعدادات لوحة التحكم
├── assets/
│   ├── css/
│   │   ├── tokens.css               # رموز التصميم (M3 Design Tokens)
│   │   ├── base.css                 # الأنماط الأساسية
│   │   ├── components.css           # مكونات UI
│   │   ├── layout.css               # Header, Footer, Drawer
│   │   ├── pages.css                # أنماط الصفحات
│   │   └── animations.css           # حركات Material You
│   └── js/
│       ├── material-color-utils.js  # توليد لوحة الألوان (OKLCH)
│       ├── theme.js                 # إدارة الثيم الرئيسية
│       ├── cart.js                  # تفاعلات السلة
│       └── product.js               # تفاعلات صفحة المنتج
├── layout/
│   ├── base.twig                    # القالب الأساسي
│   ├── header.twig                  # الهيدر
│   ├── drawer.twig                  # Drawer المحمول
│   └── footer.twig                  # الفوتر
└── views/
    ├── pages/
    │   ├── home.twig                # الصفحة الرئيسية
    │   ├── products.twig            # قائمة المنتجات
    │   ├── product.twig             # صفحة المنتج
    │   ├── cart.twig                # السلة
    │   └── login.twig               # تسجيل الدخول
    └── components/
        ├── product-card.twig        # بطاقة المنتج
        └── reviews.twig             # التقييمات
```

---

## إعدادات اللوحة

### الألوان
| الإعداد | الخيارات |
|---------|---------|
| نظام الألوان | أزرق، بنفسجي، أخضر، برتقالي، أحمر، فيروزي، مخصص |
| الوضع الافتراضي | فاتح، داكن، حسب النظام |
| زر التبديل | إظهار/إخفاء |

### الخطوط
| الخط | المعرف |
|------|-------|
| Noto Kufi Arabic | `noto-kufi` (افتراضي) |
| Cairo | `cairo` |
| Tajawal | `tajawal` |
| Almarai | `almarai` |
| IBM Plex Arabic | `ibm-plex` |

### الهيدر
- **Surface** — خلفية فاتحة شفافة (افتراضي)
- **Primary** — خلفية بلون الثيم
- **Transparent** — شفاف مع تدرج عند التمرير

### الصفحة الرئيسية (3 أنماط للبنر)
- **Full** — بنر بالعرض الكامل مع تدرج
- **Split** — نص على اليمين وصورة على اليسار
- **Cards** — بطاقات الفئات كبنر رئيسي

### بطاقة المنتج
- **Elevated** — مرتفعة بظل (افتراضي)
- **Filled** — معبأة بخلفية ملونة
- **Outlined** — بإطار رفيع

---

## نظام الألوان (M3 Tokens)

```css
--md-sys-color-primary
--md-sys-color-on-primary
--md-sys-color-primary-container
--md-sys-color-on-primary-container
--md-sys-color-surface
--md-sys-color-surface-container
--md-sys-color-error
--md-sys-color-outline
```

---

## JavaScript API

```javascript
// تبديل الوضع
ThemeManager.toggleTheme()
ThemeManager.applyTheme('dark' | 'light' | 'system')

// تغيير نظام الألوان
ThemeManager.applyColorScheme('blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal' | 'custom')

// اللون المخصص
MaterialColorUtils.applyCustomColor('#006493')

// إظهار Snackbar
Snackbar.show('تمت الإضافة إلى السلة', {
  label: 'تراجع',
  callback: () => {}
})

// تحديث عداد السلة
CartManager.updateBadge(count)
```

---

## المتطلبات

- منصة سلة (Salla)
- متصفح حديث يدعم CSS Custom Properties و CSS Grid

---

## الترخيص

MIT License
