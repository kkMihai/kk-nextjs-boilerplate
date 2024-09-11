// Import the environment variables
import('./src/env.mjs').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  // Disable the "Powered by Next.js" header
  poweredByHeader: false,
  // Configure the headers for the application
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            // Deny the ability to render the application in an iframe
            // This helps protect against clickjacking attacks
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent the browser from trying to guess the content type
            // This helps protect against certain types of attacks
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Prevent the browser from sending the referrer information
            // This helps protect the privacy of the user
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            // Set the Strict-Transport-Security header
            // This instructs the browser to only access the website using HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Set the Permissions-Policy header
            // This is similar to the Feature-Policy header, but uses a different syntax
            // It also disables access to various device features
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
          },
          // {
          //   // Configure the Content-Security-Policy header
          //   // This helps mitigate cross-site scripting (XSS) attacks
          //   // You should configure this based on your needs and requirements
          //   key: 'Content-Security-Policy',
          //   value: ``, // Add your CSP configuration here
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
