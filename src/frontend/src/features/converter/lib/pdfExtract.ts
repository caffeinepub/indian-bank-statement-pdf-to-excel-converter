import type { Transaction, ParsingSettings, ExtractionResult } from '../types';
import { detectBankFromText, getBankTemplate, BANK_TEMPLATES } from './bankTemplates';

// Load PDF.js from CDN at runtime
let pdfjsLib: any = null;
let loadingPromise: Promise<any> | null = null;

async function loadPDFJS() {
  if (pdfjsLib) return pdfjsLib;
  if (loadingPromise) return loadingPromise;
  
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs';
    script.type = 'module';
    script.onload = () => {
      // Access the global pdfjs object
      pdfjsLib = (window as any).pdfjsLib || (window as any)['pdfjs-dist'];
      
      // If not available globally, try to get it from the module
      if (!pdfjsLib) {
        // Fallback: create a minimal wrapper
        pdfjsLib = {
          GlobalWorkerOptions: { workerSrc: '' },
          getDocument: (window as any).getDocument || (() => {
            throw new Error('PDF.js not loaded correctly');
          })
        };
      }
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';
      resolve(pdfjsLib);
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load PDF.js library'));
    };
    document.head.appendChild(script);
  });
  
  return loadingPromise;
}

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
  fontName: string;
}

export async function extractTransactionsFromPDF(
  file: File,
  settings: ParsingSettings
): Promise<ExtractionResult> {
  const pdfjs = await loadPDFJS();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  const allTextItems: TextItem[] = [];

  // Determine page range
  const totalPages = pdf.numPages;
  let startPage = 1;
  let endPage = totalPages;

  if (settings.pageRange === 'first-5') {
    endPage = Math.min(5, totalPages);
  } else if (settings.pageRange === 'last-5') {
    startPage = Math.max(1, totalPages - 4);
  }

  // Extract text from pages
  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    textContent.items.forEach((item: any) => {
      if ('str' in item) {
        fullText += item.str + ' ';
        allTextItems.push(item as TextItem);
      }
    });
  }

  // Detect bank
  const detectedBank = detectBankFromText(fullText);

  // Get template
  let templateKey = settings.bankTemplate;
  if (templateKey === 'auto-detect') {
    // Find matching template
    const lowerText = fullText.toLowerCase();
    for (const [key, template] of Object.entries(BANK_TEMPLATES)) {
      if (template.patterns.some((pattern) => lowerText.includes(pattern))) {
        templateKey = key;
        break;
      }
    }
  }

  const template = templateKey !== 'auto-detect' ? getBankTemplate(templateKey) : null;

  // Extract transactions using simple line-based parsing
  const transactions = extractTransactionsFromText(fullText, template, settings);

  // Calculate diagnostics
  const warnings: string[] = [];
  
  if (transactions.length === 0) {
    warnings.push('No transactions found. Try adjusting the bank template or page range.');
  }

  if (detectedBank === 'Unknown') {
    warnings.push('Could not auto-detect bank. Please select manually.');
  }

  // Detect columns including reference for HDFC
  const detectedColumns = ['date', 'description', 'debit', 'credit', 'balance'];
  if (template?.columnMapping.reference && templateKey === 'hdfc') {
    const lowerText = fullText.toLowerCase();
    const hasReference = template.columnMapping.reference.some((syn) =>
      lowerText.includes(syn.toLowerCase())
    );
    if (hasReference) {
      detectedColumns.push('reference');
    }
  }

  const diagnostics = {
    confidence: transactions.length > 0 ? 0.8 : 0.3,
    warnings,
    detectedColumns,
    totalPages,
    processedPages: endPage - startPage + 1,
  };

  if (detectedBank === 'Unknown') {
    diagnostics.confidence = Math.max(0.5, diagnostics.confidence - 0.2);
  }

  return {
    transactions,
    detectedBank,
    diagnostics,
  };
}

function extractTransactionsFromText(
  text: string,
  template: any,
  settings: ParsingSettings
): Transaction[] {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const transactions: Transaction[] = [];

  // Simple pattern matching for common transaction formats
  const datePatterns = [
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
    /(\d{2}\s+[A-Za-z]{3}\s+\d{4})/,
    /(\d{2}[-\/][A-Za-z]{3}[-\/]\d{4})/,
  ];

  const amountPattern = /[\d,]+\.\d{2}/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a date
    let dateMatch: RegExpMatchArray | null = null;
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateMatch = match;
        break;
      }
    }

    if (!dateMatch) continue;

    const date = dateMatch[1];
    const amounts = line.match(amountPattern) || [];

    // Skip header rows
    if (
      line.toLowerCase().includes('date') ||
      line.toLowerCase().includes('balance') ||
      line.toLowerCase().includes('opening')
    ) {
      continue;
    }

    // Extract description (text between date and amounts)
    let description = line
      .replace(date, '')
      .replace(/[\d,]+\.\d{2}/g, '')
      .trim();

    // Clean up description
    description = description.replace(/\s+/g, ' ').substring(0, 100);

    if (description.length < 3) {
      description = 'Transaction';
    }

    // Parse amounts (typically: debit, credit, balance or just credit/debit, balance)
    let debit = '';
    let credit = '';
    let balance = '';

    if (amounts.length >= 2) {
      // Most common: last is balance, second-to-last is debit or credit
      balance = amounts[amounts.length - 1];

      if (amounts.length === 2) {
        // Could be either debit or credit
        credit = amounts[0];
      } else if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3] || '';
        credit = amounts[amounts.length - 2] || '';
      }
    }

    // Extract reference for HDFC if template supports it
    let reference: string | undefined = undefined;
    if (template?.columnMapping.reference && settings.bankTemplate === 'hdfc') {
      // Look for reference patterns in the line
      const refPatterns = [
        /(?:ref|reference|utr|chq)[:\s#]*([A-Z0-9]{6,})/i,
        /([A-Z]{3}\d{10,})/,
        /(\d{12,})/,
      ];
      
      for (const pattern of refPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          reference = match[1].trim();
          break;
        }
      }
    }

    const transaction: Transaction = {
      id: `txn-${Date.now()}-${i}`,
      date,
      description,
      debit,
      credit,
      balance,
    };

    if (reference !== undefined) {
      transaction.reference = reference;
    }

    transactions.push(transaction);
  }

  return transactions;
}
