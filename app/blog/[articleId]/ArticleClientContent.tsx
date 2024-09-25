"use client";

import { useEffect, useState } from "react";
import ArticleContent from "../_assets/components/ArticleContent";
import {
  BasicArticleInfo,
  useArticleContent,
  useArticles,
} from "../_assets/content";

export default function ArticleClientContent({
  articleId,
  initialArticle,
}: {
  articleId: string;
  initialArticle: BasicArticleInfo | null;
}) {
  const [article, setArticle] = useState<BasicArticleInfo | null>(
    initialArticle
  );
  const { content, loading: contentLoading } = useArticleContent(articleId);
  const { articles, loading: articlesLoading } = useArticles();

  useEffect(() => {
    if (content) {
      setArticle((prevArticle) => ({ ...prevArticle, content }));
    }
  }, [content]);

  if (contentLoading || articlesLoading) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  const articlesRelated = articles
    .filter((a) => a.slug !== articleId)
    .slice(0, 3);

  return <ArticleContent article={article} articlesRelated={articlesRelated} />;
}
