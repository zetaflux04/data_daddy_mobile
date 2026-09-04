/**
 * Converts a number into Indian Rupee words.
 * E.g., 13000 -> "Rupees Thirteen Thousand Only"
 *       8500 -> "Rupees Eight Thousand Five Hundred Only"
 */

const units = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertLessThanThousand(n) {
  let str = '';
  if (n >= 100) {
    str += units[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += units[n] + ' ';
  }
  return str.trim();
}

export function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Rupees Zero Only';

  let remaining = num;
  let words = '';

  // Crores (10,000,000)
  const crores = Math.floor(remaining / 10000000);
  if (crores > 0) {
    words += convertLessThanThousand(crores) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs (100,000)
  const lakhs = Math.floor(remaining / 100000);
  if (lakhs > 0) {
    words += convertLessThanThousand(lakhs) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands (1,000)
  const thousands = Math.floor(remaining / 1000);
  if (thousands > 0) {
    words += convertLessThanThousand(thousands) + ' Thousand ';
    remaining %= 1000;
  }

  // Remaining (< 1000)
  if (remaining > 0) {
    words += convertLessThanThousand(remaining) + ' ';
  }

  return `Rupees ${words.trim()} Only`;
}
