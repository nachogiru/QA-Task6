// tests.js

// Use Chai's expect for assertions
const expect = chai.expect;

//integerToRoman
describe('integerToRoman', function () {
  const validCases = {
    1:   'I',
    3:   'III',
    4:   'IV',
    5:   'V',
    6:   'VI',
    9:   'IX',
    10:  'X',
    14:  'XIV',
    40:  'XL',
    44:  'XLIV',
    50:  'L',
    90:  'XC',
    99:  'XCIX',
    400: 'CD',
    444: 'CDXLIV',
    500: 'D',
    900: 'CM',
    944: 'CMXLIV',
    1000:'M',
    1987:'MCMLXXXVII',
    3999:'MMMCMXCIX'
  };

  Object.entries(validCases).forEach(([num, roman]) => {
    it(`converts ${num} → "${roman}"`, function () {
      expect(integerToRoman(Number(num))).to.equal(roman);
    });
  });

  it('throws an error for 0 (below range)', function () {
    expect(() => integerToRoman(0)).to.throw('The number must be between 1 and 3999.');
  });

  it('throws an error for 4000 (above range)', function () {
    expect(() => integerToRoman(4000)).to.throw('The number must be between 1 and 3999.');
  });
});

// romanToInteger
describe('romanToInteger', function () {
  const validCases = {
    'I': 1,
    'III': 3,
    'IV': 4,
    'IX': 9,
    'XL': 40,
    'XC': 90,
    'CD': 400,
    'CM': 900,
    'MMXXV': 2025,
    'MMMCMXCIX': 3999
  };

  Object.entries(validCases).forEach(([roman, int]) => {
    it(`converts "${roman}" → ${int}`, function () {
      expect(romanToInteger(roman)).to.equal(int);
    });
  });

  it('throws an error for empty input', function () {
    expect(() => romanToInteger('')).to.throw('Input must be a valid Roman numeral.');
  });

  it('throws for invalid characters', function () {
    expect(() => romanToInteger('ABC')).to.throw('The Roman numeral contains invalid characters.');
    expect(() => romanToInteger('I V')).to.throw('The Roman numeral contains invalid characters.');
    expect(() => romanToInteger('123')).to.throw('The Roman numeral contains invalid characters.');
  });

  it('throws for non‑canonical numerals', function () {
    // Passes character check but fails canonical check
    ['IIII', 'VX', 'IC', 'IIV', 'XXC'].forEach(bad => {
      expect(() => romanToInteger(bad)).to.throw('The Roman numeral is not in canonical form.');
    });
  });
});

//Round‑trip property tests
describe('round‑trip conversion', function () {
  const samples = [1, 44, 99, 2025, 3999];
  samples.forEach(num => {
    it(`integerToRoman(${num}) then romanToInteger → ${num}`, function () {
      const roman = integerToRoman(num);
      expect(romanToInteger(roman)).to.equal(num);
    });
  });
});
