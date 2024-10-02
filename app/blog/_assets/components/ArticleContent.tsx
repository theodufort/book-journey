"use client";

import config from "@/config";
import Link from "next/link";
import Script from "next/script";
import { BasicArticleInfo } from "../content";
import Avatar from "./Avatar";
// These styles are used in the content of the articles. When you update them, all articles will be updated.
const styles: {
  [key: string]: string;
} = {
  h2: "text-2xl lg:text-4xl font-bold tracking-tight mb-4 text-base-content",
  h3: "text-xl lg:text-2xl font-bold tracking-tight mb-2 text-base-content",
  p: "text-base-content/90 leading-relaxed text-justify py-5",
  ul: "list-inside list-disc text-base-content/90 leading-relaxed",
  li: "list-item",
  // Altnernatively, you can use the library react-syntax-highlighter to display code snippets.
  code: "text-sm font-mono bg-neutral text-neutral-content p-6 rounded-box my-4 overflow-x-scroll select-all",
  codeInline:
    "text-sm font-mono bg-base-300 px-1 py-0.5 rounded-box select-all",
};
export default function ArticleContent({
  article,
  articlesRelated,
}: {
  article: any;
  articlesRelated: BasicArticleInfo[];
}) {
  if (!article) {
    return <div>Article not found</div>;
  }
  const parseArticleContent = () => {
    // Update regex to use lazy quantifier and ensure multi-line support
    const introMatch = article.content.match(
      /Introduction:\s*([\s\S]*?)(?=\n\n|\nDevelopment:|Conclusion:|$)/i
    );
    const developmentMatch = article.content.match(
      /Development:\s*([\s\S]*?)(?=\n\n|\nConclusion:|$)/i
    );
    const conclusionMatch = article.content.match(
      /Conclusion:\s*([\s\S]*?)(?=$)/i
    );

    const introduction = introMatch
      ? `<h2 class='${styles.h2}'>Introduction</h2><p class='${
          styles.p
        }'>${introMatch[1]
          .trim()
          .replace(/\n\n/g, "</p><p>")
          .replace(/\n/g, " ")}</p>`
      : "";
    const development = developmentMatch
      ? `<h2 class='${styles.h2}'>Development</h2><p class='${
          styles.p
        }'>${developmentMatch[1]
          .trim()
          .replace(/\n\n/g, "</p><p>")
          .replace(/\n/g, " ")}</p>`
      : "";
    const conclusion = conclusionMatch
      ? `<h2 class='${styles.h2}'>Conclusion</h2><p class='${
          styles.p
        }'>${conclusionMatch[1]
          .trim()
          .replace(/\n\n/g, "</p><p>")
          .replace(/\n/g, " ")}</p>`
      : "";

    // Combine all formatted content
    const formattedContent = `${introduction}${development}${conclusion}`;
    return formattedContent;
  };
  const articleHTML = { __html: parseArticleContent() };
  return (
    <>
      {article.slug && (
        <Script
          type="application/ld+json"
          id={`json-ld-article-${article.slug}`}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://${config.domainName}/blog/${article.slug}`,
              },
              name: article.title,
              headline: article.title,
              description: article.description,
              image: article.image_url,
              datePublished: article.published_at,
              dateModified: article.published_at,
            }),
          }}
        />
      )}
      {/* GO BACK LINK */}
      <div>
        <Link
          href="/blog"
          className="link !no-underline text-base-content/80 hover:text-base-content inline-flex items-center gap-1"
          title="Back to Blog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </Link>
      </div>
      <article>
        {/* HEADER WITH CATEGORIES AND DATE AND TITLE */}
        <section className="my-12 md:my-20 max-w-[800px]">
          {/* <div className="flex items-center gap-4 mb-6">
            {article.categories.map((category) =>
              category ? (
                <BadgeCategory
                  category={category}
                  key={category.title}
                  extraStyle="!badge-lg"
                />
              ) : null
            )}
            <span className="text-base-content/80" itemProp="datePublished">
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div> */}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 md:mb-8">
            {article.title}
          </h1>

          <p className="text-base-content/80 md:text-lg max-w-[700px]">
            {article.description}
          </p>
        </section>

        <div className="flex flex-col md:flex-row">
          {/* SIDEBAR WITH AUTHORS AND 3 RELATED ARTICLES */}
          <section className="max-md:pb-4 md:pl-12 max-md:border-b md:border-l md:order-last md:w-72 shrink-0 border-base-content/10">
            <p className="text-base-content/80 text-sm mb-2 md:mb-3">
              Posted by
            </p>
            <Avatar name="Theo" image={"/blog/authors/theo.png"} />
            {/* You may want to update this if you have author information */}
          </section>

          {/* ARTICLE CONTENT */}
          <section className="w-full max-md:pt-4 md:pr-20 space-y-12 md:space-y-20">
            <div dangerouslySetInnerHTML={articleHTML} />
          </section>
        </div>
      </article>
    </>
  );
}
