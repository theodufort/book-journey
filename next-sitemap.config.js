const { getBlogSlugs } = require("./libs/sitemap.ts");
module.exports = {
  additionalPaths: async (config) => {
    const result = await getBlogSlugs();
    return result;
  },
  // REQUIRED: add your own domain name here (e.g. https://shipfa.st),
  siteUrl: process.env.SITE_URL || "https://mybookquest.com",
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
};
