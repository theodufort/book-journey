"use client";

import { useTranslations } from "next-intl";
import type { JSX } from "react";
import { useRef, useState } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const FAQ = () => {
  const t = useTranslations("HomePage");
  const faqList: FAQItemProps[] = [
    {
      question: t("faq_question1"),
      answer: (
        <div className="space-y-2 leading-relaxed">{t("faq_answer1")}</div>
      ),
    },
    {
      question: t("faq_question2"),
      answer: <p>{t("faq_answer2")}</p>,
    },
  ];

  const FaqItem = ({ item }: { item: FAQItemProps }) => {
    const accordion = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
      <li>
        <button
          className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
        >
          <span
            className={`flex-1 text-base-content ${
              isOpen ? "text-primary" : ""
            }`}
          >
            {item?.question}
          </span>
          <svg
            className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className={`transform origin-center transition duration-200 ease-out ${
                isOpen && "rotate-180"
              }`}
            />
            <rect
              y="7"
              width="16"
              height="2"
              rx="1"
              className={`transform origin-center rotate-90 transition duration-200 ease-out ${
                isOpen && "rotate-180 hidden"
              }`}
            />
          </svg>
        </button>

        <div
          ref={accordion}
          className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
          style={
            isOpen
              ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
              : { maxHeight: 0, opacity: 0 }
          }
        >
          <div className="pb-5 leading-relaxed">{item?.answer}</div>
        </div>
      </li>
    );
  };
  return (
    <section className="bg-base-100" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">
            {t("faq_shorttitle")}
          </p>
          <h2 className="sm:text-4xl text-3xl font-extrabold max-w-12">
            {t("faq_title")}
          </h2>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
