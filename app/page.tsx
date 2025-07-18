"use client";
import Header from "@/components/Header";

import FAQ from "@/components/FAQ";
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
import NotesFeature from "@/components/NotesFeature";
import RewardsFeature from "@/components/RewardsFeature";
import RecommendationsFeature from "@/components/RecommendationsFeature";
import ReadingListFeature from "@/components/ReadingListFeature";
import StatsFeature from "@/components/StatsFeature";
import ImportFeature from "@/components/ImportFeature";
import VocalNotesFeature from "@/components/VocalNotesFeature";
import { getUser } from "@/libs/supabase/queries";

export default function Page() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
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
        <NotesFeature />
        <VocalNotesFeature />
        <RewardsFeature />
        <RecommendationsFeature />
        <ReadingListFeature />
        <StatsFeature />
        <ImportFeature />
        <FAQ />
      </main>
      {/* <CalendlyFooter /> */}
      <Footer />
    </>
  );
}
