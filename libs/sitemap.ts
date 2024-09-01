const {
  createClientComponentClient,
} = require("@supabase/auth-helpers-nextjs");

const supabase = createClientComponentClient();
const getBlogSlugs = async () => {
  const { data: slugs, error } = await supabase
    .from("blog_articles")
    .select("slug");
  const concatSlugs = slugs.map((x) => {
    return { loc: "/blog/" + x.slug };
  });
  return concatSlugs;
};
module.exports = { getBlogSlugs };
