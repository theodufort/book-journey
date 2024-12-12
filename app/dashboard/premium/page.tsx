"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import Pricing from "@/components/Pricing";
import { checkPremium } from "@/libs/premium";
import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function Premium() {
  const supabase = createClientComponentClient<Database>();
  const [isPremium, setIsPremium] = useState(false);
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
      const checkAccess = async () => {
        const hasPremium = await checkPremium(user.id);
        setIsPremium(hasPremium);
      };
      checkAccess();
    }
  }, [user]);

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div>
          <Pricing />
        </div>
      </section>
    </main>
  );
}
