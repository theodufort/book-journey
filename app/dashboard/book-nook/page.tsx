import BookNookComponent from "@/components/BookNook";
import HeaderDashboard from "@/components/DashboardHeader";
import { createClient } from "@/libs/supabase/client";
import { getUser } from "@/libs/supabase/queries";

export default async function BookNook() {
  const supabase = createClient();
  const [user] = await Promise.all([getUser(supabase)]);
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <section className="mx-auto space-y-4 sm:space-y-8">
        <div className="sticky top-0 z-50 bg-base-100 h-full">
          <HeaderDashboard />
        </div>
        <BookNookComponent supabase={supabase} user={user} />
      </section>
    </main>
  );
}
