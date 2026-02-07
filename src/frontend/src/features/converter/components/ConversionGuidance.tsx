import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, Download, FileSpreadsheet } from 'lucide-react';

export function ConversionGuidance() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          How It Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-Step Process */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <Upload className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-semibold text-sm mb-1">1. Upload</h4>
              <p className="text-sm text-muted-foreground">
                Select your bank statement PDF. Processing happens entirely in your browser—no uploads to any server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <Eye className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-semibold text-sm mb-1">2. Review</h4>
              <p className="text-sm text-muted-foreground">
                Check extracted transactions, edit any errors, and delete unwanted rows before exporting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <Download className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-semibold text-sm mb-1">3. Export</h4>
              <p className="text-sm text-muted-foreground">
                Download your data as an Excel (.xlsx) file ready for analysis, budgeting, or record-keeping.
              </p>
            </div>
          </div>
        </div>

        {/* Why Excel */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              Why Excel?
            </Badge>
            <p className="text-sm text-muted-foreground flex-1">
              Excel (.xlsx) files let you sort, filter, calculate totals, create charts, and integrate with accounting software—making your financial data actionable.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
