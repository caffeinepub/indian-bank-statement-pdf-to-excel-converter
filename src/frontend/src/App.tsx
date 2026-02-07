import { PdfToExcelPage } from './features/converter/PdfToExcelPage';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <AppShell>
      <PdfToExcelPage />
    </AppShell>
  );
}
