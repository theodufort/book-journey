import { getSEOTags } from "@/libs/seo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const supabase = createClientComponentClient<Database>();

export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}) {
  const { data: article } = await supabase
    .from("libraries")
    .select("*")
    .eq("slug", params.articleId)
    .single();

  if (!article) {
    return {};
  }

  return getSEOTags({
    title: null,
    description: null,
    canonicalUrlRelative: `/libraries/${article.slug}`,
    extraTags: {
      openGraph: {
        title: article.title,
        description: article.description,
        url: `/libraries/${article.slug}`,
        images: [
          {
            url: null,
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
  const { data: article } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", params.articleId)
    .single();
  console.log(article);
  if (article != null)
    return (
      <ArticleClientContent
        articleId={params.articleId}
        initialArticle={article || null}
      />
    );
}
