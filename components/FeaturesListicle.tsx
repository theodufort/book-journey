"use client";

import { useTranslations } from "next-intl";
import type { JSX } from "react";

// Features component
const FeaturesGrid = () => {
  const t = useTranslations("HomePage");
  // List of features to display:
  // - name: name of the feature
  // - description: description of the feature (can be any JSX)
  // - svg: icon of the feature
  const features: {
    name: string;
    description: JSX.Element;
    svg: JSX.Element;
  }[] = [
    {
      name: t("featureslisticle_feat1"),
      description: (
        <>
          <ul className="space-y-2 text-left">
            {[
              t("featureslisticle_feat1_sub1"),
              t("featureslisticle_feat1_sub2"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">🎁</span>,
    },
    {
      name: t("featureslisticle_feat2"),
      description: (
        <>
          <ul className="space-y-1 text-left">
            {[
              t("featureslisticle_feat2_sub1"),
              t("featureslisticle_feat2_sub2"),
              t("featureslisticle_feat2_sub3"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">⚖️</span>,
    },
    {
      name: t("featureslisticle_feat3"),
      description: (
        <>
          <ul className="space-y-2">
            {[
              t("featureslisticle_feat3_sub1"),
              t("featureslisticle_feat3_sub2"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">📚</span>,
    },
    {
      name: t("featureslisticle_feat4"),
      description: (
        <>
          <ul className="space-y-2 text-left">
            {[
              t("featureslisticle_feat4_sub1"),
              t("featureslisticle_feat4_sub2"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">✍️</span>,
    },
    {
      name: t("featureslisticle_feat5"),
      description: (
        <>
          <ul className="space-y-1 text-left">
            {[t("featureslisticle_feat5_sub1")].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">📊</span>,
    },
    {
      name: t("featureslisticle_feat6"),
      description: (
        <>
          <ul className="space-y-1 text-left">
            {[t("featureslisticle_feat6_sub1")].map((item) => (
              <li key={item} className="flex items-center gap-3 text-left">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-[18px] h-[18px] inline shrink-0 opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
      svg: <span className="text-4xl">📥</span>,
    },
  ];
  return (
    <section id="features" className="bg-base-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 max-w-6xl mx-auto">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 text-primary">{feature.svg}</div>
            <h3 className="font-bold text-lg mb-2">{feature.name}</h3>
            <div className="text-base-content/80">{feature.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
