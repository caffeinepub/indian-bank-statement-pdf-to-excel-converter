import type { Transaction, BankTemplate } from '../types';

// Load XLSX from CDN at runtime
let XLSX: any = null;
let loadingPromise: Promise<any> | null = null;

async function loadXLSX() {
  if (XLSX) return XLSX;
  if (loadingPromise) return loadingPromise;
  
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload = () => {
      XLSX = (window as any).XLSX;
      if (!XLSX) {
        loadingPromise = null;
        reject(new Error('XLSX library not found on window object'));
        return;
      }
      resolve(XLSX);
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load XLSX library'));
    };
    document.head.appendChild(script);
  });
  
  return loadingPromise;
}

export async function exportToXLSX(
  transactions: Transaction[],
  bankName: string,
  template: BankTemplate
): Promise<void> {
  try {
    const XLSXLib = await loadXLSX();
    
    // Prepare data for export with Reference column between Description and Debit
    const data = transactions.map((txn) => ({
      Date: txn.date,
      Description: txn.description,
      Reference: txn.reference || '',
      Debit: txn.debit || '',
      Credit: txn.credit || '',
      Balance: txn.balance || '',
    }));

    // Create worksheet
    const worksheet = XLSXLib.utils.json_to_sheet(data);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 50 }, // Description
      { wch: 18 }, // Reference
      { wch: 12 }, // Debit
      { wch: 12 }, // Credit
      { wch: 12 }, // Balance
    ];

    // Create workbook
    const workbook = XLSXLib.utils.book_new();
    XLSXLib.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${bankName.replace(/\s+/g, '_')}_Statement_${timestamp}.xlsx`;

    // Download file
    XLSXLib.writeFile(workbook, filename);
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export to Excel. Please try again.');
  }
}
