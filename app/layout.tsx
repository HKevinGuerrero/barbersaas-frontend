import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
      <body className="font-sans antialiased selection:bg-amber-500/30" suppressHydrationWarning>
        
        {/* 👇 AQUÍ ENVUELVES TODA TU APP CON EL PROVEEDOR DE GOOGLE 👇 */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          
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

        </GoogleOAuthProvider>
      </body>
    </html>
  );
}