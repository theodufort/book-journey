"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
const StatsFeature = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();

  return (
    <section className="bg-base-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 max-w-7xl mx-auto">
        {/* Left Side */}
        <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start m-auto">
          <h2 className="font-bold text-4xl tracking-tight md:-mb-4">
            {t("featureslisticle_feat5")} 📊
          </h2>
          <ul className="space-y-2 text-left">
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
        </div>
        {/* Right Side */}
        <div className="overflow-hidden rounded-3xl m-auto">
          <Image
            src={"/stats.svg"}
            alt={""}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }} // optional
          />
        </div>
      </div>
    </section>
  );
};

export default StatsFeature;
