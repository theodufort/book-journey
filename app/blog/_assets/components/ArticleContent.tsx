"use client";

import Image from "next/image";

interface Section {
  title: string;
  content: React.ReactNode;
}

interface Styles {
  [key: string]: string;
}

interface ArticleContentProps {
  image: {
    src: string;
    alt: string;
  };
  isbn13: string;
  description: string;
  pageCount: string;
  sections: Section[];
  styles: Styles;
}

const ArticleContent: React.FC<ArticleContentProps> = ({
  image,
  isbn13,
  description,
  pageCount,
  sections,
  styles,
}) => {
  return (
    <article className="prose lg:prose-xl">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className={styles.h3 || "text-2xl font-bold mb-4"}>Book info</h4>
          <ul className="list-none pl-0">
            <li><strong>ISBN-13:</strong> {isbn13}</li>
            <li><strong>Page Count:</strong> {pageCount}</li>
            <li><strong>Description:</strong> {description}</li>
          </ul>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={image.src}
            alt={image.alt}
            width={300}
            height={450}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
      <h2 className={styles.h2 || "text-3xl font-bold mt-8 mb-4"}>Review</h2>
      {sections.map((section, index) => (
        <section key={index}>
          <h3 className={styles.h3 || "text-2xl font-bold mt-6 mb-3"}>{section.title}</h3>
          {section.content}
        </section>
      ))}
    </article>
  );
};

export default ArticleContent;
