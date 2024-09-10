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
  params: { libraryLocationId: string };
}) {
  const { data: article } = await supabase
    .from("libraries")
    .select("*")
    .eq("slug", params.libraryLocationId)
    .single();
  console.log(article);
  if (article != null)
    return (
    );
}
