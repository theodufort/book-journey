'use client';

import { useEffect, useState } from "react";
import BookNookComponent from "@/components/BookNook";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClient } from "@/libs/supabase/client";
import { getUser } from "@/libs/supabase/queries";
import { User } from "@supabase/auth-helpers-nextjs";

export default function BookNook() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const userData = await getUser(supabase);
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Not Authenticated</h2>
          <p>Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100 h-full">
          <HeaderDashboard />
        </div>
        <BookNookComponent user={user} />
      </section>
    </main>
  );
}
