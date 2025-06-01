/* ====================================================================
   Roman-numeral converter – full browser & Node module
   --------------------------------------------------------------------
   • Converts integers ↔ Roman numerals (1 – 3999, canonical form).
   • Emits Google Analytics events when gtag() is available.
   • **All validation errors use the exact wording expected by the
     project’s Mocha/Chai test-suite** so tests pass cleanly.
   ==================================================================== */

/* --------------------------------------------------------------------
   0.  Analytics helper – safe no-op during tests or if GA is blocked
   -------------------------------------------------------------------- */
function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

/* --------------------------------------------------------------------
   1.  Lookup table (largest → smallest) for fast looping conversions
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

/* --------------------------------------------------------------------
   2.  Integer → Roman
   -------------------------------------------------------------------- */
function integerToRoman(n) {
  /* validation ------------------------------------------------------ */
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new TypeError('The number must be between 1 and 3999.');
  }

  /* main loop ------------------------------------------------------- */
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
    /* empty string -------------------------------------------------- */
    throw new TypeError('Input must be a valid Roman numeral.');
  }

  const roman = str.toUpperCase().trim();

  /* invalid characters (anything but the seven Roman letters) ------- */
  if (!/^[MDCLXVI]+$/.test(roman)) {
    throw new TypeError('The Roman numeral contains invalid characters.');
  }

  /* conversion loop ------------------------------------------------- */
  let i = 0;
  let total = 0;
  for (const { val, sym } of PAIRS) {
    while (roman.slice(i, i + sym.length) === sym) {
      total += val;
      i    += sym.length;
    }
  }

  /* canonical-form check ------------------------------------------- */
  if (integerToRoman(total) !== roman) {
    // e.g. “IIII” or “VX” passes the simple regex but is non-canonical
    throw new TypeError('The Roman numeral is not in canonical form.');
  }

  return total;
}

/* --------------------------------------------------------------------
   4.  Browser UI glue (only runs in browsers, skipped in Node tests)
   -------------------------------------------------------------------- */
if (typeof document !== 'undefined') {
  const $input  = document.getElementById('input');
  const $output = document.getElementById('output');
  const $btn    = document.getElementById('convertButton');

  $btn.addEventListener('click', () => {
    const raw = $input.value.trim();
    track('convert_click');

    try {
      const result =
        /^[0-9]+$/.test(raw)
          ? integerToRoman(parseInt(raw, 10))
          : romanToInteger(raw);

      track('convert_success', { direction: /^[0-9]+$/.test(raw) ? 'arabic_to_roman' : 'roman_to_arabic' });
      $output.textContent = result;
    } catch (err) {
      track('convert_error', { message: err.message });
      $output.textContent = err.message;
    }
  });
}

/* --------------------------------------------------------------------
   5.  Node exports (make functions testable under Mocha)
   -------------------------------------------------------------------- */
if (typeof module !== 'undefined') {
  module.exports = { integerToRoman, romanToInteger };
}
