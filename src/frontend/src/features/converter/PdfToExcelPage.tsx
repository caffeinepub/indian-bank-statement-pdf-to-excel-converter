import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload, Eye, Download } from 'lucide-react';
import { UploadDropzone } from './components/UploadDropzone';
import { ConversionGuidance } from './components/ConversionGuidance';
import { ParsingSettingsPanel } from './components/ParsingSettingsPanel';
import { TransactionsTableEditor } from './components/TransactionsTableEditor';
import { extractTransactionsFromPDF } from './lib/pdfExtract';
import { exportToXLSX } from './lib/exportXlsx';
import { normalizeTransactions } from './lib/normalize';
import type { Transaction, ParsingSettings, ExtractionResult, BankTemplate } from './types';
import { Button } from '@/components/ui/button';

type Step = 'upload' | 'review' | 'export';

export function PdfToExcelPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parsingSettings, setParsingSettings] = useState<ParsingSettings>({
    bankTemplate: 'auto-detect',
    pageRange: 'all',
    dateFormat: 'auto',
    headerDetection: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setPdfFile(file);
    setError(null);
    await processFile(file, parsingSettings);
  };

  const processFile = async (file: File, settings: ParsingSettings) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await extractTransactionsFromPDF(file, settings);
      setExtractionResult(result);

      if (result.transactions.length === 0) {
        setError('No transactions found. Please adjust parsing settings and try again.');
        setCurrentStep('upload');
      } else {
        const normalized = normalizeTransactions(result.transactions, settings.dateFormat);
        setTransactions(normalized);
        setCurrentStep('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReparse = async () => {
    if (pdfFile) {
      await processFile(pdfFile, parsingSettings);
    }
  };

  const handleExport = async () => {
    if (transactions.length === 0) return;

    const detectedBank = extractionResult?.detectedBank || 'Unknown';
    await exportToXLSX(transactions, detectedBank, parsingSettings.bankTemplate as BankTemplate);
    setCurrentStep('export');
  };

  const handleReset = () => {
    setPdfFile(null);
    setExtractionResult(null);
    setTransactions([]);
    setError(null);
    setCurrentStep('upload');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { step: 'upload', label: 'Upload', icon: Upload },
              { step: 'review', label: 'Review', icon: Eye },
              { step: 'export', label: 'Export', icon: Download },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                      currentStep === step
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index < ['upload', 'review', 'export'].indexOf(currentStep)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-sm font-medium">{label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-colors ${
                      index < ['upload', 'review', 'export'].indexOf(currentStep)
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UploadDropzone
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              selectedFile={pdfFile}
            />

            {pdfFile && extractionResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Parsing Settings</CardTitle>
                  <CardDescription>
                    Adjust settings to improve extraction accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ParsingSettingsPanel
                    settings={parsingSettings}
                    onSettingsChange={setParsingSettings}
                    detectedBank={extractionResult.detectedBank}
                    diagnostics={extractionResult.diagnostics}
                    onReparse={handleReparse}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <ConversionGuidance />
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && extractionResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Transactions</CardTitle>
                  <CardDescription>
                    {transactions.length} transactions extracted
                    {extractionResult.detectedBank !== 'Unknown' && (
                      <Badge variant="outline" className="ml-2">
                        {extractionResult.detectedBank}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    Start Over
                  </Button>
                  <Button onClick={handleExport} disabled={transactions.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {extractionResult.diagnostics.warnings.length > 0 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {extractionResult.diagnostics.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <TransactionsTableEditor
                transactions={transactions}
                onTransactionsChange={setTransactions}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Success Step */}
      {currentStep === 'export' && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Export Successful!</h3>
                <p className="text-muted-foreground mb-6">
                  Your Excel file has been downloaded successfully.
                </p>
              </div>
              <Button onClick={handleReset} size="lg">
                Convert Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
