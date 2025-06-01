/* 0. helpers ------------------------------------------------------- */

function tracker(event, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

function isRoman(str) {
  return /^[MDCLXVI]+$/i.test(str.trim());
}

/* 1. conversion tables -------------------------------------------- */

const MAP = [
  { v: 1000, r: 'M' },
  { v: 900,  r: 'CM' },
  { v: 500,  r: 'D' },
  { v: 400,  r: 'CD' },
  { v: 100,  r: 'C' },
  { v: 90,   r: 'XC' },
  { v: 50,   r: 'L' },
  { v: 40,   r: 'XL' },
  { v: 10,   r: 'X' },
  { v: 9,    r: 'IX' },
  { v: 5,    r: 'V' },
  { v: 4,    r: 'IV' },
  { v: 1,    r: 'I' }
];

/* 2. integer → Roman ---------------------------------------------- */
function integerToRoman(n) {
  if (!Number.isInteger(n) || n <= 0 || n >= 4000) {
    throw new TypeError('Integer must be 1 – 3999');
  }

  let out = '';
  for (const { v, r } of MAP) {
    while (n >= v) {
      out += r;
      n  -= v;
    }
  }
  return out;
}

/* 3. Roman → integer ---------------------------------------------- */
function romanToInteger(roman) {
  if (!isRoman(roman)) {
    throw new TypeError('Invalid Roman numeral');
  }

  roman = roman.toUpperCase();
  let i = 0, total = 0;

  for (const { v, r } of MAP) {
    while (roman.slice(i, i + r.length) === r) {
      total += v;
      i     += r.length;
    }
  }

  // final validity check (reject weird over-repetition, etc.)
  if (integerToRoman(total) !== roman) {
    throw new TypeError('Invalid Roman numeral');
  }
  return total;
}

/* 4. UI binding + GA events --------------------------------------- */
if (typeof document !== 'undefined') {
  const $in  = document.getElementById('input');
  const $out = document.getElementById('output');
  const $btn = document.getElementById('convertButton');

  $btn.addEventListener('click', () => {
    const raw = $in.value.trim();
    tracker('convert_click', { raw });

    try {
      const result =
        /^[0-9]+$/.test(raw)
          ? integerToRoman(parseInt(raw, 10))
          : romanToInteger(raw);

      $out.textContent = result;
      tracker('convert_success', {
        direction: /^[0-9]+$/.test(raw) ? 'arabic_to_roman' : 'roman_to_arabic'
      });
    } catch (err) {
      $out.textContent = err.message;
      tracker('convert_error', { message: err.message });
    }
  });
}

/* 5. exports for tests -------------------------------------------- */
if (typeof module !== 'undefined') {
  module.exports = { integerToRoman, romanToInteger, isRoman };
}
