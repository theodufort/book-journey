const { getBlogSlugs, getLibrarySlugs } = require("./libs/sitemap.js");
module.exports = {
  outdir: "app/",
  additionalPaths: async (config) => {
    const blogSlugs = await getBlogSlugs();
    const librarySlugs = await getLibrarySlugs();
    const result = [
      ...blogSlugs,
      ...librarySlugs,
      { loc: "/" },
      { loc: "/blog" },
      { loc: "/signin" },
      { loc: "/libraries" },
    ];
    return result;
  },
  // REQUIRED: add your own domain name here (e.g. https://shipfa.st),
  siteUrl: process.env.SITE_URL || "https://mybookquest.com",
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard). By default, NextJS app router metadata files are excluded (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
};
