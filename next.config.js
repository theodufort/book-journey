/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();
const nextPwa = require("next-pwa");
const withPwa = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  // important to avoid running the generation everytime on your local environment
  disable: process.env.NODE_ENV === "development",
});
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "images.isbndb.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "example.com",
      "books.google.com",
      "googleusercontent.com",
      "mybookquest.com",
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: "500mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

module.exports = withPwa(withNextIntl(nextConfig));
