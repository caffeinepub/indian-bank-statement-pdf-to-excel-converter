import type { Transaction } from '../types';

export function normalizeTransactions(
  transactions: Transaction[],
  dateFormat: string
): Transaction[] {
  return transactions.map((txn) => ({
    ...txn,
    date: normalizeDate(txn.date, dateFormat),
    debit: normalizeAmount(txn.debit),
    credit: normalizeAmount(txn.credit),
    balance: normalizeAmount(txn.balance),
    reference: txn.reference || '',
  }));
}

function normalizeDate(date: string, format: string): string {
  if (!date) return '';

  // Try to parse various date formats
  const patterns = [
    { regex: /(\d{2})[-\/](\d{2})[-\/](\d{4})/, format: 'DD-MM-YYYY' },
    { regex: /(\d{2})\s+([A-Za-z]{3})\s+(\d{4})/, format: 'DD MMM YYYY' },
    { regex: /(\d{2})[-\/]([A-Za-z]{3})[-\/](\d{4})/, format: 'DD-MMM-YYYY' },
  ];

  for (const pattern of patterns) {
    const match = date.match(pattern.regex);
    if (match) {
      if (pattern.format === 'DD MMM YYYY' || pattern.format === 'DD-MMM-YYYY') {
        const day = match[1];
        const month = parseMonth(match[2]);
        const year = match[3];
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        const day = match[1];
        const month = match[2];
        const year = match[3];
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }

  return date;
}

function parseMonth(monthStr: string): string {
  const months: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12',
  };

  return months[monthStr.toLowerCase().substring(0, 3)] || '01';
}

function normalizeAmount(amount: string): string {
  if (!amount) return '';

  // Remove commas and spaces
  let normalized = amount.replace(/,/g, '').replace(/\s/g, '');

  // Ensure it's a valid number
  const num = parseFloat(normalized);
  if (isNaN(num)) return '';

  return num.toFixed(2);
}
