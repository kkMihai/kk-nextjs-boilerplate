import React, { Fragment } from 'react';
import Head from 'next/head';
import Header from '@/components/landingpage/Header.jsx';
import Footer from '@/components/landingpage/Footer.jsx';
import { env } from '@/env.mjs';

export default function Layout({
  title = env.NEXT_PUBLIC_APP_NAME,
  children,
  session,
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/assets/images/logo.png" />
      </Head>
      <div className="relative flex flex-col items-center justify-center">
        <Header session={session} />
        {children}
        <Footer />
      </div>
    </>
  );
}
