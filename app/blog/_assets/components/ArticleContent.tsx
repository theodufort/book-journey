"use client";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { useState } from "react";

interface Section {
  title: string;
  content: React.ReactNode;
}

interface Styles {
  [key: string]: string;
}

interface ArticleContentProps {
  image: {
    src: StaticImageData;
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
  const [commentsUpdated, setCommentsUpdated] = useState(false);

  const handleCommentSubmitted = () => {
    setCommentsUpdated((prev) => !prev);
  };

  return (
    <article className="prose lg:prose-xl">
      <div className="grid md:grid-cols-2">
        <div>
          <h4 className={styles.h3}>Book info</h4>
          <ul className="">
            <li>ISBN-13: {isbn13}</li>
            <li>Page Count: {pageCount}</li>
            <li>Description: {description}</li>
          </ul>
        </div>
        <Image
          src={image.src}
          alt={image.alt}
          className="w-full h-auto rounded-lg shadow-lg mb-8"
        />
      </div>
      <h2 className={styles.h2}>Review</h2>
      {sections.map((section, index) => (
        <section key={index}>
          <h3 className={styles.h3}>{section.title}</h3>
          {section.content}
        </section>
      ))}
    </article>
  );
};

export default ArticleContent;
