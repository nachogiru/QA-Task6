/* ====================================================================
   Roman-numeral converter – browser + Node module
   --------------------------------------------------------------------
   • Converts integers ↔ Roman numerals (1 – 3999, canonical form).
   • Throws with messages required by the Mocha tests.
   • Sends GA4 events when gtag() exists; becomes no-op otherwise.
   ==================================================================== */

/* --------------------------------------------------------------------
   0. Analytics helper – safe during tests or if GA is blocked
   -------------------------------------------------------------------- */
function track(eventName, params = {}) {
  // Only call gtag() if it’s defined (in testing or privacy-blocked browsers, it will be undefined)
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/* --------------------------------------------------------------------
   1. Conversion tables & regex helpers
   -------------------------------------------------------------------- */
const PAIRS = [
  { val: 1000, sym: 'M'  },
  { val: 900,  sym: 'CM' },
  { val: 500,  sym: 'D'  },
  { val: 400,  sym: 'CD' },
  { val: 100,  sym: 'C'  },
  { val:  90,  sym: 'XC' },
  { val:  50,  sym: 'L'  },
  { val:  40,  sym: 'XL' },
  { val:  10,  sym: 'X'  },
  { val:   9,  sym: 'IX' },
  { val:   5,  sym: 'V'  },
  { val:   4,  sym: 'IV' },
  { val:   1,  sym: 'I'  }
];

const ROMAN_REGEX = /^[MDCLXVI]+$/i;

/* --------------------------------------------------------------------
   2. Integer → Roman
   -------------------------------------------------------------------- */
function integerToRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    // Exactly matches test suite’s expected wording
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
   3. Roman → Integer
   -------------------------------------------------------------------- */
function romanToInteger(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    // Exactly matches test suite’s expected wording
    throw new TypeError('Input must be a valid Roman numeral.');
  }

  const roman = str.toUpperCase().trim();

  if (!ROMAN_REGEX.test(roman)) {
    // Exactly matches test suite’s expected wording
    throw new TypeError('The Roman numeral contains invalid characters.');
  }

  let i = 0, total = 0;
  for (const { val, sym } of PAIRS) {
    while (roman.slice(i, i + sym.length) === sym) {
      total += val;
      i    += sym.length;
    }
  }

  // Check canonical form: converting back should match exactly
  if (integerToRoman(total) !== roman) {
    // Exactly matches test suite’s expected wording
    throw new TypeError('The Roman numeral is not in canonical form.');
  }

  return total;
}

/* --------------------------------------------------------------------
   4. Browser UI glue – wrap in DOMContentLoaded to ensure elements exist
   -------------------------------------------------------------------- */
if (typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Grab elements by their IDs from your HTML
    const $inputValue     = document.getElementById('inputValue');      // <input id="inputValue" />
    const $conversionMode = document.getElementById('conversionMode');  // <select id="conversionMode" />
    const $convertButton  = document.getElementById('convertButton');   // <button id="convertButton">
    const $resultDiv      = document.getElementById('result');          // <div id="result">
    const $errorDiv       = document.getElementById('error');           // <div id="error">

    // If any of these are missing, skip attaching the event listener
    if (!$inputValue || !$conversionMode || !$convertButton || !$resultDiv || !$errorDiv) {
      console.warn('Converter UI elements not found; skipping event binding.');
      return;
    }

    // Clear any old text on load
    $resultDiv.textContent = '';
    $errorDiv.textContent  = '';

    // Attach click handler
    $convertButton.addEventListener('click', () => {
      const raw   = $inputValue.value.trim();          // Get user input, trimmed
      const mode  = $conversionMode.value;             // "intToRoman" or "romanToInt"
      // Clear previous output / errors
      $resultDiv.textContent = '';
      $errorDiv.textContent  = '';
      // Track the click event (if GA is active)
      track('convert_click', { mode: mode });

      try {
        let output;
        if (mode === 'intToRoman') {
          // For integer → Roman, ensure only digits are entered
          if (!/^[0-9]+$/.test(raw)) {
            throw new TypeError('The number must be between 1 and 3999.');
          }
          output = integerToRoman(parseInt(raw, 10));
        } else {
          // For Roman → integer
          output = romanToInteger(raw);
        }
        // Display the conversion result
        $resultDiv.textContent = output;
        // Track a successful conversion
        track('convert_success', { direction: mode, input: raw, output: output });
      } catch (err) {
        // Show the exact error message to the user
        $errorDiv.textContent = err.message;
        // Track the failure event with the error message
        track('convert_error', { message: err.message, mode: mode, input: raw });
      }
    });
  });
}

/* --------------------------------------------------------------------
   5. Node exports – for Mocha/Chai tests to import directly
   -------------------------------------------------------------------- */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { integerToRoman, romanToInteger };
}
