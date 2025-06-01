/* ====================================================================
   Roman-numeral converter – browser + Node module
   --------------------------------------------------------------------
   • Converts integers ↔ Roman numerals (1 – 3999, canonical form).
   • Throws with messages required by the Mocha tests.
   • Sends GA4 events when gtag() exists; becomes no-op otherwise.
   ==================================================================== */

/* --------------------------------------------------------------------
   0.  Analytics helper – safe during tests or if GA is blocked
   -------------------------------------------------------------------- */
function track(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/* --------------------------------------------------------------------
   1.  Conversion tables & regex helpers
   -------------------------------------------------------------------- */
const PAIRS = [
  { val: 1000, sym: 'M'  },
  { val: 900,  sym: 'CM' },
  { val: 500,  sym: 'D'  },
  { val: 400,  sym: 'CD' },
  { val: 100,  sym: 'C'  },
  { val: 90,   sym: 'XC' },
  { val: 50,   sym: 'L'  },
  { val: 40,   sym: 'XL' },
  { val: 10,   sym: 'X'  },
  { val: 9,    sym: 'IX' },
  { val: 5,    sym: 'V'  },
  { val: 4,    sym: 'IV' },
  { val: 1,    sym: 'I'  }
];

const ROMAN_REGEX = /^[MDCLXVI]+$/i;

/* --------------------------------------------------------------------
   2.  Integer → Roman
   -------------------------------------------------------------------- */
function integerToRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new TypeError('The number must be between 1 and 3999.');
  }

  let out = '';
  for (const { val, sym } of PAIRS) {
    while (n >= val) {
      out += sym;
      n   -= val;
    }
  }
  return out;
}

/* --------------------------------------------------------------------
   3.  Roman → Integer
   -------------------------------------------------------------------- */
function romanToInteger(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    throw new TypeError('Input must be a valid Roman numeral.');
  }

  const roman = str.toUpperCase().trim();

  if (!ROMAN_REGEX.test(roman)) {
    throw new TypeError('The Roman numeral contains invalid characters.');
  }

  let i = 0, total = 0;
  for (const { val, sym } of PAIRS) {
    while (roman.slice(i, i + sym.length) === sym) {
      total += val;
      i    += sym.length;
    }
  }

  // Reject non-canonical forms like “IIII” or “VX”
  if (integerToRoman(total) !== roman) {
    throw new TypeError('The Roman numeral is not in canonical form.');
  }

  return total;
}

/* --------------------------------------------------------------------
   4.  Browser UI glue (skips if elements aren’t on the page)
   -------------------------------------------------------------------- */
if (typeof document !== 'undefined') {
  const $input  = document.getElementById('inputValue');
  const $result = document.getElementById('result');
  const $error  = document.getElementById('error');
  const $mode   = document.getElementById('conversionMode');
  const $btn    = document.getElementById('convertButton');

  // Only attach handler when the full UI is present (tests don’t have it)
  if ($input && $result && $error && $mode && $btn) {
    $btn.addEventListener('click', () => {
      const raw   = $input.value.trim();
      const mode  = $mode.value;                 // 'intToRoman' | 'romanToInt'
      $result.textContent = '';
      $error.textContent  = '';
      track('convert_click');

      try {
        let output;
        if (mode === 'intToRoman') {
          // Expect digits only
          if (!/^[0-9]+$/.test(raw)) {
            throw new TypeError('The number must be between 1 and 3999.');
          }
          output = integerToRoman(parseInt(raw, 10));
        } else {
          output = romanToInteger(raw);
        }
        $result.textContent = output;
        track('convert_success', { direction: mode });
      } catch (err) {
        $error.textContent = err.message;
        track('convert_error', { message: err.message });
      }
    });
  }
}

/* --------------------------------------------------------------------
   5.  Node exports – lets Mocha import the pure functions
   -------------------------------------------------------------------- */
if (typeof module !== 'undefined') {
  module.exports = { integerToRoman, romanToInteger };
}
