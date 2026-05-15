import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      {/* Forzamos que el scroll siempre esté disponible a menos que un modal real lo bloquee */}
      <body className="font-sans antialiased selection:bg-amber-500/30" suppressHydrationWarning>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#09090b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e7e5e4',
            },
            className: 'shadow-2xl shadow-amber-900/10'
          }}
        />
        {children}
      </body>
    </html>
  );
}