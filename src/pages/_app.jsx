import '@/styles/globals.css';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster.jsx';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <main style={montserrat.style}>
        <Component {...pageProps} />
        <Toaster />
      </main>
    </ThemeProvider>
  );
}
