import { getSEOTags } from "@/libs/seo";
import { BasicArticleInfo } from "../_assets/content";
import ArticleContent from "../_assets/components/ArticleContent";

export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}) {
  const article = await fetchArticle(params.articleId);

  return getSEOTags({
    title: article.title,
    description: article.description,
    canonicalUrlRelative: `/blog/${article.slug}`,
    extraTags: {
      openGraph: {
        title: article.title,
        description: article.description,
        url: `/blog/${article.slug}`,
        images: [
          {
            url: article.image_url,
            width: 1200,
            height: 660,
          },
        ],
        locale: "en_US",
        type: "website",
      },
    },
  });
}

async function fetchArticle(articleId: string): Promise<BasicArticleInfo> {
  // Implement your server-side fetching logic here
  // This is a placeholder implementation
  return {
    id: parseInt(articleId),
    slug: articleId,
    title: "Sample Article",
    description: "This is a sample article description",
    isbn13: "1234567890123",
    image_url: "/sample-image.jpg",
    image_alt: "Sample Image",
    published_at: new Date().toISOString(),
  };
}

export default async function Article({
  params,
}: {
  params: { articleId: string };
}) {
  const article = await fetchArticle(params.articleId);

  return (
    <ArticleContent
      image={{
        src: article.image_url,
        alt: article.image_alt,
      }}
      isbn13={article.isbn13}
      description={article.description}
      pageCount="Unknown" // Add this information to your BasicArticleInfo if available
      sections={[]} // Add sections if you have them
      styles={{}} // Add styles if needed
    />
  );
}
