export interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  reference?: string;
  rawData?: Record<string, string>;
}

export interface ParsingSettings {
  bankTemplate: string;
  pageRange: string;
  dateFormat: string;
  headerDetection: boolean;
}

export interface ExtractionDiagnostics {
  confidence: number;
  warnings: string[];
  detectedColumns: string[];
  totalPages: number;
  processedPages: number;
}

export interface ExtractionResult {
  transactions: Transaction[];
  detectedBank: string;
  diagnostics: ExtractionDiagnostics;
}

export type BankTemplate = 'auto-detect' | 'sbi' | 'hdfc' | 'icici' | 'axis' | 'kotak';

export interface BankTemplateConfig {
  name: string;
  patterns: string[];
  columnMapping: {
    date: string[];
    description: string[];
    debit: string[];
    credit: string[];
    balance: string[];
    reference?: string[];
  };
  dateFormats: string[];
}
