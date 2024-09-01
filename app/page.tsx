"use client";
import Link from "next/link";
import Header from "@/components/Header";
import CTA from "@/components/CTA";
import FeaturesListicle from "@/components/FeaturesListicle";

import FAQ from "@/components/FAQ";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Problem from "@/components/Problem";
import { Suspense, useEffect, useState } from "react";
import BookFinder from "@/components/BookFinder";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        {/* <FeaturesListicle /> */}
        <Problem />
        <BookFinder />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
