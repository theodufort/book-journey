const {
  createClientComponentClient,
} = require("@supabase/auth-helpers-nextjs");

const supabase = createClientComponentClient();
const getBlogSlugs = async () => {
  const { data: slugs, error } = await supabase
    .from("blog_articles")
    .select("slug");
  const concatSlugs = slugs.map((x) => {
    return {
      loc: "/blog/" + x.slug,
      lastmod: Date.now().toLocaleString(),
      changefreq: "daily",
    };
  });
  return concatSlugs;
};
module.exports = { getBlogSlugs };
