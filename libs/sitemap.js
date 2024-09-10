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
      lastmod: new Date().toISOString(),
      changefreq: "daily",
    };
  });
  return concatSlugs;
};

const getLibrarySlugs = async () => {
  const { data: libraries, error } = await supabase
    .from("libraries")
    .select("city_ascii, state_id");
  
  if (error) {
    console.error("Error fetching library slugs:", error);
    return [];
  }

  const librarySlugs = libraries.map((library) => {
    const slug = `libraries-in-${library.city_ascii.toLowerCase().replace(/\s+/g, "-")}-${library.state_id.toLowerCase()}`;
    return {
      loc: `/libraries/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
    };
  });

  return librarySlugs;
};

module.exports = { getBlogSlugs, getLibrarySlugs };
