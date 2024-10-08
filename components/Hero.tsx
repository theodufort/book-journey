"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import YouTube from "react-youtube";

const Hero = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();

  return (
    <section className="w-full flex flex-col lg:flex-row items-start justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20 max-w-7xl m-auto">
      {/* Left Side */}
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start m-auto">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          {t("hero_tagline")}
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">{t("hero_desc")}</p>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/signin")}
        >
          {t("hero_cta")}
        </button>
      </div>
      {/* Right Side */}
      <div
        className="w-full overflow-hidden md:w-1/2 lg:w-1/3 rounded-2xl m-auto"
        style={{ boxShadow: "0 0px 50px 0px #6366f1" }}
      >
        <div className="aspect-video">
          <YouTube
            className="w-full h-full rounded-2xl"
            videoId="qtQhC1YqiBw"
            opts={{
              height: "100%",
              width: "100%",
              playerVars: {
                autoplay: 0,
              },
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
