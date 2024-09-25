import { getSEOTags } from "@/libs/seo";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ArticleClientContent from "./ArticleClientContent";
export async function generateStaticParams() {
  const supabase = createClientComponentClient<Database>();
  const { data: articles, error } = await supabase
    .from("blog_articles")
    .select(
      "id, slug, title, description, isbn_13, image_url, image_alt, published_at"
    );

  // Handle the case where no articles are returned or there's an error
  if (error) {
    console.error("Error fetching articles:", error.message);
    return [];
  }

  if (!articles) {
    console.error("No articles found.");
    return [];
  }

  const paths = articles.map((x) => ({
    articleId: x.slug,
  }));

  console.log(paths);
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}) {
  const supabase = createClientComponentClient<Database>();
  const { data: article } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", params.articleId)
    .single();

  if (!article) {
    return {};
  }

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

export default async function Article({
  params,
}: {
  params: { articleId: string };
}) {
  const supabase = createClientComponentClient<Database>();
  const { data: article } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", params.articleId)
    .single();
  if (article != null)
    return (
      <ArticleClientContent
        articleId={params.articleId}
        initialArticle={article || null}
      />
    );
}
