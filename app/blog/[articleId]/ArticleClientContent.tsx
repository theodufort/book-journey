"use client";

import { useArticleContent } from "../_assets/content";
import ArticleContent from "../_assets/components/ArticleContent";
import { useState, useEffect } from "react";

export default function ArticleClientContent({
  articleId,
  initialArticle,
}: {
  articleId: string;
  initialArticle: any;
}) {
  const [article, setArticle] = useState(initialArticle);
  const { content, loading: contentLoading } = useArticleContent(articleId);

  useEffect(() => {
    setArticle(initialArticle);
  }, [initialArticle]);

  if (contentLoading) {
    return <div>Loading content...</div>;
  }

  return (
    <ArticleContent
      image={{
        src: article.image_url,
        alt: article.image_alt,
      }}
      isbn13={article.isbn13}
      description={article.description}
      pageCount={article.page_count || "Unknown"}
      sections={[]} // Add sections if you have them
      styles={{}} // Add styles if needed
      content={content || ""}
    />
  );
}
