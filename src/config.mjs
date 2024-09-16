import { env } from '@/env.mjs';

// Main configuration object
const config = {
  // SEO configuration for the application
  seo: {
    title: env.NEXT_PUBLIC_APP_NAME, // Default title for the webpage, taken from environment variables
    description: 'An NextJS Boilerplate to get you started quickly easily.', // Default description for the webpage
    canonical: env.NEXT_PUBLIC_APP_URL, // Canonical URL for the webpage, helps with SEO
    additionalLinkTags: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/assets/images/logo.png', // Specifies the favicon for the webpage
      },
    ],
    openGraph: {
      url: env.NEXT_PUBLIC_APP_URL,  // URL for Open Graph, used in social media sharing
      title: env.NEXT_PUBLIC_APP_NAME, // Title for Open Graph, typically used in social media embeds
      description: 'An NextJS Boilerplate to get you started quickly easily.', // Description for Open Graph
      themeColor: '#ffffff', // Primary color for the Open Graph embed (though not officially supported by OG)
      images: [
        {
          url: `${env.NEXT_PUBLIC_APP_URL}/assets/images/logo.png`, // Image used in Open Graph embeds
          width: 800,  // Width of the Open Graph image
          height: 600, // Height of the Open Graph image
          alt: 'Logo', // Alt text for the Open Graph image
          type: 'image/png', // Image type for the Open Graph image
        },
      ],
      siteName: env.NEXT_PUBLIC_APP_NAME, // Site name for Open Graph, shown in social media embeds
    },
    additionalMetaTags: [
      {
        name: 'theme-color',
        content: '#ffffff', // Specifies the theme color for supported browsers and platforms
      },
      {
        name: 'keywords',
        content:
          'NextJS, Boilerplate, React, TailwindCSS, PostCSS, ESLint, Prettier', // Keywords for SEO, helps with search engine indexing
      },
    ],
    twitter: {
      handle: '@handle', // Twitter handle for the website or company
      site: '@site', // Twitter site associated with the account
      cardType: 'summary_large_image', // Specifies the type of Twitter card to use when sharing content
    },
  },
  // Configuration for the header links
  landingpage: {
    header: {
      links: [
        // {
        //   title: 'Home',
        //   url: '/', // URL for the GitHub link in the header
        // },
      ],
    },
    // Configuration for the footer links
    footer: {
      links: [
        {
          category: 'Nav', // Category name for the footer section
          links: [
            {
              title: 'Hero',
              url: '#hero', // URL for the "Hero" section in the footer navigation
            },
          ],
        },
      ],
    },
  },
  dashboard: {
    sidebar: {
      links: [
        {
          category: 'Dashboard',
          links: [
            { name: 'Overview', href: '/dashboard', icon: 'ic:round-dashboard' },
          ],
        },
        {
          category: 'User Management',
          links: [
            { name: 'All Users', href: '/users', icon: 'ic:round-people' },
            {
              name: 'Roles',
              href: '/roles',
              icon: 'eos-icons:role-binding',
              subLinks: [
                { name: 'Admin', href: '/roles/admin', icon: 'ic:round-security' },
              ],
            },
          ],
        },
        {
          category: 'Settings',
          links: [
            { name: 'General', href: '/settings/general', icon: 'ic:round-settings' },
            {
              name: 'Security',
              href: '/settings/security',
              icon: 'ic:round-security',
            },
          ],
        },
      ]
    },
  }
};

export default config;
