"use client";

import { useEffect, useState } from "react";
import { useArticles, useArticleContent, BasicArticleInfo } from "../_assets/content";
import ArticleContent from "../_assets/components/ArticleContent";

export default function ArticleClientContent({
  articleId,
  initialArticle,
}: {
  articleId: string;
  initialArticle: BasicArticleInfo;
}) {
  const [article, setArticle] = useState<BasicArticleInfo>(initialArticle);
  const { content, loading: contentLoading } = useArticleContent(articleId);
  const { articles, loading: articlesLoading } = useArticles();

  useEffect(() => {
    if (content) {
      setArticle((prevArticle) => ({ ...prevArticle, content }));
    }
  }, [content]);

  if (contentLoading || articlesLoading) {
    return <div>Loading...</div>;
  }

  const articlesRelated = articles
    .filter((a) => a.slug !== articleId)
    .slice(0, 3);

  return <ArticleContent article={article} articlesRelated={articlesRelated} />;
}
