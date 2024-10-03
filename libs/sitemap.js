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
    const slug = `libraries-in-${library.city_ascii
      .toLowerCase()
      .replace(/\s+/g, "-")}-${library.state_id.toLowerCase()}`;
    return {
      loc: `/libraries/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
    };
  });

  return librarySlugs;
};

const getQuotesSlugs = async () => {
  const { data, error } = await supabase.from("quotes").select("*");

  if (error) {
    console.error("Error fetching quotes:", error);
  } else {
    setQuotes(data || []);
  }
  const generateSlug = (text, author) => {
    const words = text.split(" ").slice(0, 10).join("-");
    const slug = author ? `${words}-by-${author.replace(/\s+/g, "-")}` : words;
    return encodeURIComponent(slug.toLowerCase());
  };
  data.map((x) => {
    return {
      loc: `/tools/quotes/${generateSlug(x.text, x.author)}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
    };
  });
};
module.exports = { getBlogSlugs, getLibrarySlugs, getQuotesSlugs };
