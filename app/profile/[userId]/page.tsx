"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import HeaderDashboard from "@/components/DashboardHeader";

export default function UserProfile({ params }: { params: { userId: string } }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [params.userId, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />
        <h1 className="text-3xl md:text-4xl font-extrabold">User Profile</h1>
        <div>
          <p>User ID: {profile.id}</p>
          <p>Email: {profile.email}</p>
          {/* Add more profile information as needed */}
        </div>
      </section>
    </main>
  );
}
