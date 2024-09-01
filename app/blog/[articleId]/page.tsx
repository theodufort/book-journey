import { getSEOTags } from "@/libs/seo";
import { BasicArticleInfo } from "../_assets/content";
import ArticleContent from "./ArticleContent";

export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}) {
  // Fetch the article data from your API or database
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
            url: article.image.urlRelative,
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
  // This could be a database query or an API call
  // Return the article data
}

export default async function Article({
  params,
}: {
  params: { articleId: string };
}) {
  const article = await fetchArticle(params.articleId);
  const articlesRelated = await fetchRelatedArticles(article);

  return <ArticleContent article={article} articlesRelated={articlesRelated} />;
}

async function fetchRelatedArticles(article: BasicArticleInfo): Promise<BasicArticleInfo[]> {
  // Implement your server-side logic to fetch related articles
  // This could be a database query or an API call
  // Return the related articles data
}
