import type { BankTemplateConfig } from '../types';

export const BANK_TEMPLATES: Record<string, BankTemplateConfig> = {
  sbi: {
    name: 'State Bank of India (SBI)',
    patterns: ['state bank', 'sbi', 'sbiin'],
    columnMapping: {
      date: ['txn date', 'date', 'value date', 'txn dt'],
      description: ['description', 'narration', 'particulars', 'remarks'],
      debit: ['debit', 'withdrawal', 'dr', 'debit amt'],
      credit: ['credit', 'deposit', 'cr', 'credit amt'],
      balance: ['balance', 'closing balance', 'bal'],
    },
    dateFormats: ['DD MMM YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY'],
  },
  hdfc: {
    name: 'HDFC Bank',
    patterns: ['hdfc', 'housing development'],
    columnMapping: {
      date: ['date', 'transaction date', 'value date'],
      description: ['narration', 'description', 'particulars'],
      debit: ['withdrawal amt', 'debit', 'withdrawal'],
      credit: ['deposit amt', 'credit', 'deposit'],
      balance: ['closing balance', 'balance'],
      reference: ['reference', 'ref no', 'reference no', 'utr', 'chq/ref no', 'ref', 'cheque no', 'transaction id'],
    },
    dateFormats: ['DD/MM/YY', 'DD/MM/YYYY', 'DD-MM-YYYY'],
  },
  icici: {
    name: 'ICICI Bank',
    patterns: ['icici', 'industrial credit'],
    columnMapping: {
      date: ['transaction date', 'date', 'value date'],
      description: ['transaction remarks', 'description', 'particulars'],
      debit: ['withdrawal amount', 'debit', 'dr'],
      credit: ['deposit amount', 'credit', 'cr'],
      balance: ['balance', 'closing balance'],
    },
    dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY', 'DD MMM YYYY'],
  },
  axis: {
    name: 'Axis Bank',
    patterns: ['axis', 'axis bank'],
    columnMapping: {
      date: ['tran date', 'date', 'transaction date'],
      description: ['particulars', 'description', 'narration'],
      debit: ['debit', 'dr', 'withdrawal'],
      credit: ['credit', 'cr', 'deposit'],
      balance: ['balance', 'closing bal'],
    },
    dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
  },
  kotak: {
    name: 'Kotak Mahindra Bank',
    patterns: ['kotak', 'mahindra'],
    columnMapping: {
      date: ['transaction date', 'date'],
      description: ['description', 'particulars', 'narration'],
      debit: ['debit', 'withdrawal'],
      credit: ['credit', 'deposit'],
      balance: ['balance'],
    },
    dateFormats: ['DD/MM/YYYY', 'DD-MM-YYYY'],
  },
};

export function detectBankFromText(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [key, template] of Object.entries(BANK_TEMPLATES)) {
    if (template.patterns.some((pattern) => lowerText.includes(pattern))) {
      return template.name;
    }
  }

  return 'Unknown';
}

export function getBankTemplate(bankKey: string): BankTemplateConfig | null {
  return BANK_TEMPLATES[bankKey] || null;
}
