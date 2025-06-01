// Tiny wrapper: call gtag() only if it exists, so CI tests or
// privacy-blocked browsers don’t choke.
function track(eventName, params = {}) {
  const gtagFn =
    typeof window !== 'undefined' && typeof window.gtag === 'function'
      ? window.gtag
      : function () {}; // no-op
  gtagFn('event', eventName, params);
}

// Quick test: is the string a valid Roman numeral?
function looksRoman(str) {
  return /^[MDCLXVI]+$/i.test(str.trim());
}

/* ----- 1  Conversion logic ---------------------------------------- */

const ROMAN_PAIRS = [
  { value: 1000, numeral: 'M' },
  { value: 900, numeral: 'CM' },
  { value: 500, numeral: 'D' },
  { value: 400, numeral: 'CD' },
  { value: 100, numeral: 'C' },
  { value: 90, numeral: 'XC' },
  { value: 50, numeral: 'L' },
  { value: 40, numeral: 'XL' },
  { value: 10, numeral: 'X' },
  { value: 9, numeral: 'IX' },
  { value: 5, numeral: 'V' },
  { value: 4, numeral: 'IV' },
  { value: 1, numeral: 'I' }
];

function integerToRoman(num) {
  if (!Number.isInteger(num) || num <= 0 || num >= 4000) return '';
  let result = '';
  for (const { value, numeral } of ROMAN_PAIRS) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function romanToInteger(roman) {
  roman = roman.toUpperCase();
  let i = 0,
    total = 0;
  for (const { value, numeral } of ROMAN_PAIRS) {
    while (roman.slice(i, i + numeral.length) === numeral) {
      total += value;
      i += numeral.length;
    }
  }
  // Basic validity check: if reconverting gives the same numeral, accept.
  return integerToRoman(total) === roman ? total : 0;
}

/* ----- 2  DOM glue + event tracking ------------------------------- */

if (typeof document !== 'undefined') {
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const btn = document.getElementById('convertButton');

  btn.addEventListener('click', () => {
    const raw = inputEl.value.trim();
    track('convert_click', { input_raw: raw });

    let result = '';
    let direction = '';

    if (raw === '') {
      result = 'Please enter a value.';
      outputEl.textContent = result;
      track('convert_error', { reason: 'empty_input' });
      return;
    }

    if (/^[0-9]+$/.test(raw)) {
      // Arabic → Roman
      const num = parseInt(raw, 10);
      result = integerToRoman(num);
      direction = 'arabic_to_roman';
    } else if (looksRoman(raw)) {
      // Roman → Arabic
      const val = romanToInteger(raw);
      result = val || 'Invalid Roman numeral';
      direction = 'roman_to_arabic';
    } else {
      result = 'Invalid input';
    }

    outputEl.textContent = result;

    if (result && result !== 'Invalid input' && result !== 'Invalid Roman numeral') {
      track('convert_success', {
        direction: direction,
        input: raw,
        output: result
      });
    } else {
      track('convert_error', { reason: 'validation', input: raw });
    }
  });
}

/* ----- 3  Exports for unit tests ---------------------------------- */
if (typeof module !== 'undefined') {
  module.exports = { integerToRoman, romanToInteger, looksRoman };
}
