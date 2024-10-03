const {
  getBlogSlugs,
  getLibrarySlugs,
  getQuotesSlugs,
} = require("./libs/sitemap.js");
module.exports = {
  outdir: "app/",
  additionalPaths: async (config) => {
    const blogSlugs = await getBlogSlugs();
    const librarySlugs = await getLibrarySlugs();
    const quoteSlugs = await getQuotesSlugs();
    const result = [
      ...blogSlugs,
      ...librarySlugs,
      ...quoteSlugs,
      { loc: "/", lastmod: new Date().toISOString(), changefreq: "weekly" },
      { loc: "/blog", lastmod: new Date().toISOString(), changefreq: "weekly" },
      {
        loc: "/tools",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
      {
        loc: "/tools/ai-book-recommendations",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
      {
        loc: "/tools/movie-based-on-book",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
      {
        loc: "/tools/quotes",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
      {
        loc: "/signin",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
      {
        loc: "/libraries",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
      },
    ];
    return result;
  },
  // REQUIRED: add your own domain name here (e.g. https://shipfa.st),
  siteUrl: process.env.SITE_URL || "https://mybookquest.com",
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
};
