const {
  createClientComponentClient,
} = require("@supabase/auth-helpers-nextjs");
const supabase = createClientComponentClient();
const getBlogSlugs = async () => {
  const { data: slugs, error } = await supabase
    .from("blog_articles")
    .select("slug");
  return slugs.map((x: any) => {
    return { loc: "/blog/" + x };
  });
};
module.exports = { getBlogSlugs };
