"use client";

import { useState, useEffect, useRef } from "react";
import type { JSX } from "react";

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
    name: "Recommendations",
    description: (
      <>
        <ul className="space-y-1">
          {[
            "Get tailored book recommendations",
            "No recommendation bias",
            "Based on ratings, comments and personal preferences",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
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
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    name: "Notes",
    description: (
      <>
        <ul className="space-y-2">
          {["Take notes on books", "Keep your knowledge organized"].map(
            (item) => (
              <li key={item} className="flex items-center gap-3">
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
            )
          )}
        </ul>
      </>
    ),
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    name: "Rewards (Coming Soon)",
    description: (
      <>
        <ul className="space-y-2">
          {[
            "Get rewarded for reading your favorite books",
            "Earn points when you rate and review",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
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
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  },
];

// A list of features with a listicle style.
// - Click on a feature to display its description.
// - Good to use when multiples features are available.
// - Autoscroll the list of features (optional).
const FeaturesListicle = () => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  // (Optional) Autoscroll the list of features so user know it's interactive.
  // Stop scrolling when user scroll after the featuresEndRef element (end of section)
  // emove useEffect is not needed.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasClicked) {
        const index = features.findIndex(
          (feature) => feature.name === featureSelected
        );
        const nextIndex = (index + 1) % features.length;
        setFeatureSelected(features[nextIndex].name);
      }
    }, 5000);

    try {
      // stop the interval when the user scroll after the featuresRef element
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log("STOP AUTO CHANGE");
            clearInterval(interval);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        }
      );
      if (featuresEndRef.current) {
        observer.observe(featuresEndRef.current);
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, [featureSelected, hasClicked]);

  return (
    <section id="features">
      <div>
        <div className="grid grid-cols-4 md:flex justify-center gap-4 md:gap-12 max-md:px-8 max-w-3xl mx-auto mb-8">
          {features.map((feature) => (
            <span
              key={feature.name}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(feature.name);
              }}
              className={`flex flex-col items-center justify-center gap-3 select-none cursor-pointer p-2 duration-200 group`}
            >
              <span
                className={`duration-100 ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/30 group-hover:text-base-content/50"
                }`}
              >
                {feature.svg}
              </span>
              <span
                className={`font-semibold text-sm ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/50"
                }`}
              >
                {feature.name}
              </span>
            </span>
          ))}
        </div>
        <div className="bg-base-200">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center md:items-center gap-12">
            <div
              className="text-base-content/80 leading-relaxed space-y-4 px-12 md:px-0 py-12 max-w-xl animate-opacity"
              key={featureSelected}
            >
              <h3 className="font-semibold text-base-content text-lg">
                {features.find((f) => f.name === featureSelected)["name"]}
              </h3>

              {features.find((f) => f.name === featureSelected)["description"]}
            </div>
          </div>
        </div>
      </div>
      {/* Just used to know it's the end of the autoscroll feature (optional, see useEffect) */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
