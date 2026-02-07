import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Shield, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  selectedFile: File | null;
}

export function UploadDropzone({ onFileSelect, isProcessing, selectedFile }: UploadDropzoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>100% Private & Secure:</strong> Your PDF is processed entirely in your browser.
          No data is uploaded to any server.
        </AlertDescription>
      </Alert>

      <Card
        className="border-2 border-dashed transition-colors hover:border-primary/50 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="pt-12 pb-12">
          {!selectedFile ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <img
                src="/assets/generated/empty-state-document.dim_1200x800.png"
                alt="Upload document"
                className="w-64 h-auto opacity-80"
              />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Upload Bank Statement PDF</h3>
                <p className="text-muted-foreground max-w-md">
                  Drag and drop your bank statement PDF here, or click to browse
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose PDF File
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports Indian bank statements from SBI, HDFC, ICICI, Axis, Kotak, and more
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-1">Processing PDF...</h3>
                    <p className="text-sm text-muted-foreground">
                      Extracting transactions from {selectedFile.name}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-1">File Selected</h3>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
