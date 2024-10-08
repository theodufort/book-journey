"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
const opts = {
  playerVars: {
    autoplay: 0,
  },
};
const Hero = () => {
  const t = useTranslations("HomePage");

  const router = useRouter();
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          {t("hero_tagline")}
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">{t("hero_desc")}</p>
        {/* <button
          className="btn btn-primary btn-wide"
          onClick={() => router.push("/signin")}
        >
          Use {config.appName} for Free!
        </button> */}

        <button
          className="btn btn-primary"
          onClick={() => router.push("/signin")}
        >
          {t("hero_cta")}
        </button>
      </div>
      <div
        className="h-full rounded-2xl"
        style={{ boxShadow: "0 0px 50px 0px #6366f1" }}
      >
        {/* <YouTube
          className="rounded-2xl w-[300px] md:w-[560px]"
          videoId="qtQhC1YqiBw"
          opts={opts}
        /> */}

        <Image
          src="/showcase.png"
          alt="MyBookQuest Showcase"
          className="w-full rounded-2xl"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
