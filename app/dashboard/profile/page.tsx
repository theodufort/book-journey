"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import HeaderDashboard from "@/components/DashboardHeader";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
export default function Profile() {
  const supabase = createClientComponentClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();
    if (user) fetchProfile();
  }, [supabase]);

  async function fetchProfile() {
    if (user) {
      setEmail(user.email);

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      if (profileError) console.error("Error fetching profile:", profileError);
      else setName(profile.name);

      const { data: preferences, error: preferencesError } = await supabase
        .from("user_preferences")
        .select("preferred_categories")
        .eq("user_id", user.id)
        .single();

      if (preferencesError)
        console.error("Error fetching preferences:", preferencesError);
      else setPreferredCategories(preferences.preferred_categories);
    }
  }

  async function updateProfile() {
    if (user) {
      const { error: preferencesError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          preferred_categories: preferredCategories,
        });

      if (preferencesError)
        console.error("Error updating preferences:", preferencesError);

      alert("Profile updated successfully!");
    }
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <HeaderDashboard />

        <h1 className="text-3xl md:text-4xl font-extrabold">My Profile</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile();
          }}
          className="space-y-6"
        >
          <div>
            <span className="label-text">
              Preferred Book Categories (Choose up to 3)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {[
                "Fiction",
                "Non-fiction",
                "Mystery",
                "Science Fiction",
                "Fantasy",
                "Romance",
                "Thriller",
                "Biography",
                "History",
                "Self-help",
              ].map((category) => (
                <label
                  key={category}
                  className="label cursor-pointer justify-start gap-2"
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={preferredCategories.includes(category)}
                    onChange={() => {
                      if (preferredCategories.includes(category)) {
                        setPreferredCategories(
                          preferredCategories.filter((c) => c !== category)
                        );
                      } else if (preferredCategories.length < 3) {
                        setPreferredCategories([
                          ...preferredCategories,
                          category,
                        ]);
                      }
                    }}
                  />
                  <span className="label-text">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Profile
          </button>
        </form>
      </section>
    </main>
  );
}
