import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { UnitProvider } from '@/contexts/UnitContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'CutList Pro',
  description: 'Woodworking cut list optimizer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <UnitProvider>
            {children}
          </UnitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
