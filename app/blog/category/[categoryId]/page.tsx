"use client";

import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import CardArticle from "../../_assets/components/CardArticle";
import CardCategory from "../../_assets/components/CardCategory";

const supabase = createClientComponentClient<Database>();

export default function Category({
  params,
}: {
  params: { categoryId: string };
}) {
  const [category, setCategory] = useState<any>(null);
  const [articlesInCategory, setArticlesInCategory] = useState<any[]>([]);
  const [otherCategories, setOtherCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the current category
      const { data: categoryData } = await supabase
        .from("blog_categories")
        .select("*")
        .eq("slug", params.categoryId)
        .single();

      if (categoryData) {
        setCategory(categoryData);

        // Fetch articles in this category
        const { data: articlesData } = await supabase
          .from("blog_articles")
          .select("*")
          .eq("category_id", categoryData.id)
          .order("published_at", { ascending: false })
          .limit(3);

        setArticlesInCategory(articlesData || []);

        // Fetch other categories
        const { data: categoriesData } = await supabase
          .from("blog_categories")
          .select("*")
          .neq("id", categoryData.id);

        setOtherCategories(categoriesData || []);
      }
    };

    fetchData();
  }, [params.categoryId]);

  if (!category) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <>
      <section className="mt-12 mb-24 md:mb-32 max-w-3xl mx-auto text-center">
        <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-6 md:mb-12">
          {category.name}
        </h1>
        <p className="md:text-lg opacity-80 max-w-xl mx-auto">
          {category.description}
        </p>
      </section>

      <section className="mb-24">
        <h2 className="font-bold text-2xl lg:text-4xl tracking-tight text-center mb-8 md:mb-12">
          Most recent articles in {category.name}
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {articlesInCategory.map((article) => (
            <CardArticle
              key={article.slug}
              article={article}
              tag="h3"
              showCategory={false}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-2xl lg:text-4xl tracking-tight text-center mb-8 md:mb-12">
          Other categories you might like
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherCategories.map((otherCategory) => (
            <CardCategory
              key={otherCategory.slug}
              category={otherCategory}
              tag="h3"
            />
          ))}
        </div>
      </section>
    </>
  );
}
