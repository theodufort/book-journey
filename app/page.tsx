import Link from "next/link";
import Header from "@/components/Header";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Problem from "@/components/Problem";
import { Suspense } from "react";
import BookFinder from "@/components/BookFinder";

export default function Page() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <BookFinder />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
