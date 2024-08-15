/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
