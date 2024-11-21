"use client";
import Header from "@/components/Header";

import FAQ from "@/components/FAQ";
import Feature1 from "@/components/Feature1";
import Feature2 from "@/components/Feature2";
import Feature3 from "@/components/Feature3";
import Feature4 from "@/components/Feature4";
import Feature5 from "@/components/Feature5";
import Feature6 from "@/components/Feature6";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Pricing from "@/components/Pricing";

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
        <Feature1 />
        <Feature2 />
        <Feature3 />
        <Feature4 />
        <Feature5 />
        <Feature6 />
        <FAQ />
        <Pricing />
      </main>
      {/* <CalendlyFooter /> */}
      <Footer />
    </>
  );
}
