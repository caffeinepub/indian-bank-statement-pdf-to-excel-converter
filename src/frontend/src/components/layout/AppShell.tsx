import { FileSpreadsheet } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/logo-rupee.dim_512x512.png" 
              alt="Logo" 
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Bank Statement Converter
              </h1>
              <p className="text-sm text-muted-foreground">
                PDF to Excel • Secure & Private
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <Separator className="mb-4" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              © 2026. Built with love using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>All processing happens locally in your browser</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
