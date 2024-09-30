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
};

module.exports = withPwa(withNextIntl(nextConfig));
