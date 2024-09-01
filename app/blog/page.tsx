"use client";

import { useArticles } from "./_assets/content";
import CardArticle from "./_assets/components/CardArticle";
import CardCategory from "./_assets/components/CardCategory";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";

export default function Blog() {
  const { articles, loading } = useArticles();
  console.log(articles);
  if (loading) {
    return <div>Loading...</div>;
  }

  const articlesToDisplay = articles
    .sort(
      (a, b) =>
        new Date(b.published_at).valueOf() - new Date(a.published_at).valueOf()
    )
    .slice(0, 6);

  return (
    <>
      <section className="text-center max-w-xl mx-auto mt-12 mb-24 md:mb-32">
        <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-6">
          The {config.appName} Blog
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Read our diverse articles on everything book related!
        </p>
      </section>

      <section className="grid lg:grid-cols-2 mb-24 md:mb-32 gap-8">
        {articlesToDisplay.map((article, i) => (
          <CardArticle
            article={article}
            key={article.slug}
            isImagePriority={i <= 2}
            showCategory={false}
          />
        ))}
      </section>

      {/* Note: Categories are not fetched dynamically yet. You may want to implement this in the future. */}
    </>
  );
}

// Note: Metadata is handled in the layout.tsx file
