/**
 * Material Color Utilities
 * Salla Material Theme
 *
 * أدوات نظام الألوان Material You
 * تحويل HEX إلى فضاء OKLCH لإنتاج لوحات ألوان دقيقة
 */

'use strict';

const MaterialColorUtils = (() => {

  /**
   * Convert HEX to sRGB [0-1]
   */
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const full  = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    return {
      r: parseInt(full.slice(0, 2), 16) / 255,
      g: parseInt(full.slice(2, 4), 16) / 255,
      b: parseInt(full.slice(4, 6), 16) / 255,
    };
  }

  /**
   * sRGB -> Linear RGB
   */
  function toLinear(v) {
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  /**
   * Linear RGB -> XYZ (D65)
   */
  function rgbToXyz(r, g, b) {
    const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
    return {
      x: lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
      y: lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750,
      z: lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041,
    };
  }

  /**
   * XYZ -> OKLAB
   */
  function xyzToOklab(x, y, z) {
    const l = Math.cbrt(0.8189330101*x + 0.3618667424*y - 0.1288597137*z);
    const m = Math.cbrt(0.0329845436*x + 0.9293118715*y + 0.0361456387*z);
    const s = Math.cbrt(0.0482003018*x + 0.2643662691*y + 0.6338517070*z);
    return {
      L:  0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
      a: 1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
      b: 0.0259040371*l + 0.7827717662*m - 0.8086757660*s,
    };
  }

  /**
   * OKLAB -> OKLCH
   */
  function oklabToOklch({ L, a, b }) {
    const C = Math.sqrt(a * a + b * b);
    const H = Math.atan2(b, a) * (180 / Math.PI);
    return { L, C, H: H < 0 ? H + 360 : H };
  }

  /**
   * OKLCH -> OKLAB
   */
  function oklchToOklab({ L, C, H }) {
    const hRad = H * (Math.PI / 180);
    return { L, a: C * Math.cos(hRad), b: C * Math.sin(hRad) };
  }

  /**
   * OKLAB -> XYZ
   */
  function oklabToXyz({ L, a, b }) {
    const l = L + 0.3963377774*a + 0.2158037573*b;
    const m = L - 0.1055613458*a - 0.0638541728*b;
    const s = L - 0.0894841775*a - 1.2914855480*b;
    return {
      x: 1.2270138511*Math.pow(l,3) - 0.5577999807*Math.pow(m,3) + 0.2812561490*Math.pow(s,3),
      y: -0.0405801784*Math.pow(l,3) + 1.1122568696*Math.pow(m,3) - 0.0716766787*Math.pow(s,3),
      z: -0.0763812845*Math.pow(l,3) - 0.4214819784*Math.pow(m,3) + 1.5861632204*Math.pow(s,3),
    };
  }

  /**
   * Linear RGB -> sRGB
   */
  function fromLinear(v) {
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1/2.4) - 0.055;
  }

  /**
   * XYZ -> sRGB
   */
  function xyzToRgb({ x, y, z }) {
    return {
      r: Math.max(0, Math.min(1, fromLinear( 3.2404542*x - 1.5371385*y - 0.4985314*z))),
      g: Math.max(0, Math.min(1, fromLinear(-0.9692660*x + 1.8760108*y + 0.0415560*z))),
      b: Math.max(0, Math.min(1, fromLinear( 0.0556434*x - 0.2040259*y + 1.0572252*z))),
    };
  }

  /**
   * Convert to HEX
   */
  function rgbToHex({ r, g, b }) {
    const toHex = v => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Full pipeline: HEX -> OKLCH
   */
  function hexToOklch(hex) {
    const { r, g, b } = hexToRgb(hex);
    const xyz  = rgbToXyz(r, g, b);
    const lab  = xyzToOklab(xyz);
    return oklabToOklch(lab);
  }

  /**
   * Full pipeline: OKLCH -> HEX
   */
  function oklchToHex(oklch) {
    const lab = oklchToOklab(oklch);
    const xyz = oklabToXyz(lab);
    const rgb = xyzToRgb(xyz);
    return rgbToHex(rgb);
  }

  /**
   * Material You tone scale (0-100) generation
   * Generates a full palette from a source color HEX
   */
  function generateTonalPalette(sourceHex) {
    const source = hexToOklch(sourceHex);
    const tones = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];
    const palette = {};

    tones.forEach(tone => {
      if (tone === 0) {
        palette[tone] = '#000000';
      } else if (tone === 100) {
        palette[tone] = '#ffffff';
      } else {
        // Map tone (0-100) to OKLCH L (0-1), keeping Chroma and Hue
        const L = tone / 100;
        // Chroma reduces near white and black
        const chromaScale = Math.sin(L * Math.PI);
        const C = source.C * chromaScale * 1.2;
        const result = oklchToHex({ L, C: Math.min(C, source.C), H: source.H });
        palette[tone] = result;
      }
    });

    return palette;
  }

  /**
   * Apply a custom primary color to CSS variables
   */
  function applyCustomColor(primaryHex) {
    const root = document.documentElement;
    const primaryPalette = generateTonalPalette(primaryHex);

    // Create secondary (rotate hue by 60°)
    const primaryOklch = hexToOklch(primaryHex);
    const secondaryHex = oklchToHex({ ...primaryOklch, H: (primaryOklch.H + 60) % 360, C: primaryOklch.C * 0.4 });
    const secondaryPalette = generateTonalPalette(secondaryHex);

    // Create tertiary (rotate hue by 120°)
    const tertiaryHex = oklchToHex({ ...primaryOklch, H: (primaryOklch.H + 120) % 360, C: primaryOklch.C * 0.5 });
    const tertiaryPalette = generateTonalPalette(tertiaryHex);

    const setVar = (name, value) => root.style.setProperty(name, value);

    // Set primary palette
    Object.entries(primaryPalette).forEach(([tone, hex]) => {
      setVar(`--md-ref-palette-primary${tone}`, hex);
    });

    // Set secondary palette
    Object.entries(secondaryPalette).forEach(([tone, hex]) => {
      setVar(`--md-ref-palette-secondary${tone}`, hex);
    });

    // Set tertiary palette
    Object.entries(tertiaryPalette).forEach(([tone, hex]) => {
      setVar(`--md-ref-palette-tertiary${tone}`, hex);
    });
  }

  return {
    hexToOklch,
    oklchToHex,
    generateTonalPalette,
    applyCustomColor,
    hexToRgb,
    rgbToHex,
  };
})();

window.MaterialColorUtils = MaterialColorUtils;
