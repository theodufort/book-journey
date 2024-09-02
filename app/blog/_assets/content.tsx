"use client";
import type { JSX } from "react";
import { StaticImageData } from "next/image";
import theoImg from "@/app/blog/_assets/images/authors/theo.png";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

// ... (keep the existing code for categories, authors, and styles)
const supabase = createClientComponentClient<Database>();
export type BasicArticleInfo = {
  id: number;
  slug: string;
  title: string;
  description: string;
  isbn_13: string;
  image_url: string;
  image_alt: string;
  published_at: string;
};

export type FullArticleContent = {
  id: number;
  content: string;
};

export const useArticles = () => {
  console.log("ok");
  const [articles, setArticles] = useState<BasicArticleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_articles")
        .select(
          "id, slug, title, description, isbn_13, image_url, image_alt, published_at"
        );

      if (error) throw error;
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(articles);
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
      const { data, error } = await supabase.rpc("get_full_article_content", {
        p_slug: slug,
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setContent(data[0].content);
      }
    } catch (error) {
      console.error("Error fetching article content:", error);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading };
};
