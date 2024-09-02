import { env } from '@/env.mjs';

const config = {
  seo: {
    title: env.NEXT_PUBLIC_APP_NAME,
    description: "An NextJS Boilerplate to get you started quickly easily.",
    canonical: env.NEXT_PUBLIC_APP_URL,
    openGraph: {
      url: env.NEXT_PUBLIC_APP_URL,
      title: env.NEXT_PUBLIC_APP_NAME,
      description: "An NextJS Boilerplate to get you started quickly easily.",
      images: [
        {
          url: `${env.NEXT_PUBLIC_APP_URL}/assets/images/logo.png`,
          width: 800,
          height: 600,
          alt: 'Logo',
          type: 'image/png',
        },
      ],
      siteName: env.NEXT_PUBLIC_APP_NAME,
    },
    twitter: {
      handle: '@handle',
      site: '@site',
      cardType: 'summary_large_image',
    },
  },
  header: {
    links: [
      {
        title: 'Github',
        url: '/',
      },
    ],
  },
  footer: {
    links: [
      {
        category: 'Nav',
        links: [
          {
            title: 'Hero',
            url: '#hero',
          },
        ],
      },
    ],
  },
};

export default config;
