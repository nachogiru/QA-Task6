/**
 * Converts an integer (between 1 and 3999) to its Roman numeral equivalent.
 *
 * @param {number} num - The integer to convert.
 * @returns {string} The Roman numeral representation.
 * @throws {Error} Throws an error if the number is not within the allowed range.
 */
function integerToRoman(num) {
  // Validate that the number is within the allowed range (1-3999)
  if (num <= 0 || num >= 4000) {
    throw new Error('The number must be between 1 and 3999.');
  }
  
  // Array mapping integer values to their corresponding Roman numeral symbols.
  const romanNumerals = [
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

  let result = '';
  // Loop through each numeral mapping, appending the numeral symbol
  // as many times as possible while subtracting its value from num.
  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;  // Append the numeral to the result string.
      num -= value;       // Subtract the numeral's value from num.
    }
  }
  return result;
}

/**
 * Converts a Roman numeral string to its integer equivalent.
 *
 * @param {string} roman - The Roman numeral string to convert.
 * @returns {number} The integer value of the Roman numeral.
 * @throws {Error} Throws an error if the input is not a valid or canonical Roman numeral.
 */
function romanToInteger(roman) {
  // Validate that the input is a non-empty string.
  if (typeof roman !== 'string' || roman.trim() === '') {
    throw new Error('Input must be a valid Roman numeral.');
  }
  // Standardize the input by converting it to uppercase.
  roman = roman.toUpperCase();
  
  // Check that the string contains only valid Roman numeral characters.
  if (!/^[IVXLCDM]+$/.test(roman)) {
    throw new Error('The Roman numeral contains invalid characters.');
  }
  
  // Mapping of Roman numeral characters to their integer values.
  const romanMap = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  
  let total = 0;
  let previousValue = 0;
  
  // Iterate through the numeral from right to left.
  // This approach helps in handling subtractive notation (e.g., IV is 4).
  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanMap[roman[i]];
    if (currentValue < previousValue) {
      // If the current numeral is less than the previous numeral, subtract its value.
      total -= currentValue;
    } else {
      // Otherwise, add its value.
      total += currentValue;
    }
    previousValue = currentValue;  // Update previousValue for the next iteration.
  }
  
  // Validate that the Roman numeral is in canonical form.
  // This is done by converting the computed integer back to a Roman numeral
  // and comparing it with the original input.
  const reconversion = integerToRoman(total);
  if (reconversion !== roman) {
    throw new Error('The Roman numeral is not in canonical form.');
  }
  
  return total;
}

/**
 * Handles the conversion process when the user clicks the convert button.
 * It reads the user input, determines which conversion to perform,
 * and then displays either the result or an error message.
 */
function handleConversion() {
  // Retrieve the selected conversion mode (either 'intToRoman' or 'romanToInt').
  const mode = document.getElementById('conversionMode').value;
  // Get the user input from the input field.
  const input = document.getElementById('inputValue').value.trim();
  // Get references to the result and error display elements.
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Clear any previous result or error messages.
  resultDiv.textContent = '';
  errorDiv.textContent = '';

  try {
    if (mode === 'intToRoman') {
      // Attempt to parse the input as an integer.
      const num = parseInt(input, 10);
      if (isNaN(num)) {
        throw new Error('Please enter a valid integer number.');
      }
      // Convert the integer to a Roman numeral.
      const roman = integerToRoman(num);
      resultDiv.textContent = `Roman Numeral: ${roman}`;
    } else if (mode === 'romanToInt') {
      // Convert the Roman numeral to an integer.
      const num = romanToInteger(input);
      resultDiv.textContent = `Integer: ${num}`;
    }
  } catch (error) {
    // Display any error messages encountered during conversion.
    errorDiv.textContent = error.message;
  }
}

// Attach an event listener to the convert button to trigger the conversion when clicked.
document.getElementById('convertButton').addEventListener('click', handleConversion);

