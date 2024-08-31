import type { JSX } from "react";
import { StaticImageData } from "next/image";
import theoImg from "@/app/blog/_assets/images/authors/theo.png";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization (replace with your actual Supabase URL and anon key)
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

// ... (keep the existing code for categories, authors, and styles)

export type BasicArticleInfo = {
  id: number;
  slug: string;
  title: string;
  description: string;
  isbn13: string;
  image_url: string;
  image_alt: string;
  published_at: string;
};

export type FullArticleContent = {
  id: number;
  content: string;
};

export const useArticles = () => {
  const [articles, setArticles] = useState<BasicArticleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id, slug, title, description, isbn13, image_url, image_alt, published_at');

      if (error) throw error;
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return { articles, loading };
};

export const useArticleContent = (slug: string) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleContent();
  }, [slug]);

  const fetchArticleContent = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_full_article_content', { p_slug: slug });

      if (error) throw error;
      if (data && data.length > 0) {
        setContent(data[0].content);
      }
    } catch (error) {
      console.error('Error fetching article content:', error);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading };
};

// Example of how to use these hooks in a component:
/*
const ArticleList = () => {
  const { articles, loading } = useArticles();

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {articles.map(article => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
};

const ArticlePage = ({ slug }) => {
  const { content, loading } = useArticleContent(slug);

  if (loading) return <div>Loading...</div>;

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};
*/
