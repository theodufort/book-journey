"use client";
export const dynamic = "force-dynamic";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Dashboard() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    setLoading(false);
  };
  useEffect(() => {
    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 pb-24 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <button>Back to dashboard</button>
      <div className="w-full h-full"></div>
    </main>
  );
}
