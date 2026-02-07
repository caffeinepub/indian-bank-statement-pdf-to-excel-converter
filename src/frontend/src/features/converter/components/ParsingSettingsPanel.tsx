import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { ParsingSettings, ExtractionDiagnostics } from '../types';
import { BANK_TEMPLATES } from '../lib/bankTemplates';

interface ParsingSettingsPanelProps {
  settings: ParsingSettings;
  onSettingsChange: (settings: ParsingSettings) => void;
  detectedBank: string;
  diagnostics: ExtractionDiagnostics;
  onReparse: () => void;
  isProcessing: boolean;
}

export function ParsingSettingsPanel({
  settings,
  onSettingsChange,
  detectedBank,
  diagnostics,
  onReparse,
  isProcessing,
}: ParsingSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {diagnostics.confidence < 0.7 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Low extraction confidence ({Math.round(diagnostics.confidence * 100)}%). Try adjusting
            the settings below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bank-template">Bank Template</Label>
          <Select
            value={settings.bankTemplate}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, bankTemplate: value })
            }
          >
            <SelectTrigger id="bank-template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto-detect">
                Auto-detect
                {detectedBank !== 'Unknown' && (
                  <Badge variant="outline" className="ml-2">
                    {detectedBank}
                  </Badge>
                )}
              </SelectItem>
              {Object.entries(BANK_TEMPLATES).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-format">Date Format</Label>
          <Select
            value={settings.dateFormat}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, dateFormat: value })
            }
          >
            <SelectTrigger id="date-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
              <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
              <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-range">Page Range</Label>
          <Select
            value={settings.pageRange}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, pageRange: value })
            }
          >
            <SelectTrigger id="page-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="first-5">First 5 Pages</SelectItem>
              <SelectItem value="last-5">Last 5 Pages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="header-detection" className="flex-1">
            Smart Header Detection
          </Label>
          <Switch
            id="header-detection"
            checked={settings.headerDetection}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, headerDetection: checked })
            }
          />
        </div>
      </div>

      <Button onClick={onReparse} disabled={isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Re-parsing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-run Extraction
          </>
        )}
      </Button>
    </div>
  );
}
