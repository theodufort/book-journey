export const generateQuoteSlug = (text: string, author: string | null) => {
  const words = text.split(" ").slice(0, 10).join("-");
  const slug = author ? `${words}-by-${author.replace(/\s+/g, "-")}` : words;
  return encodeURIComponent(slug.toLowerCase());
};
