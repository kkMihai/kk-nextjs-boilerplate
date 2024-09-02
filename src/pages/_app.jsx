import '@/styles/globals.css';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { DefaultSeo } from 'next-seo';
import { Toaster } from '@/components/ui/toaster.jsx';
import config from '@/config.mjs';

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
      <DefaultSeo {...config.seo} />
      <main style={montserrat.style}>
        <Component {...pageProps} />
        <Toaster />
      </main>
    </ThemeProvider>
  );
}
