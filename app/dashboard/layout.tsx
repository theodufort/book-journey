import OnboardingCard from "@/components/OnboardingCard";
import config from "@/config";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NextStepWrapper from "./NextStepWrapper";
import { ReactNode } from "react";
const steps = [
  {
    tour: "dashboardTour",
    steps: [
      {
        icon: <>👋</>,
        title: "Welcome to MyBookQuest!",
        showControls: true,
        content: (
          <p>
            We are glad to have you on board! <br />
            Let us show you your dashboard.
          </p>
        ),
      },
      {
        icon: <>📊</>,
        title: "Your Statistics",
        showControls: true,
        side: "bottom",
        selector: "#dashboard_stats",
        content: <p>Here, you can find 3 basic stats of your reading quest!</p>,
      },
      {
        icon: <>☯️</>,
        title: "The Book Nook",
        showControls: true,
        side: "top",
        selector: "#dashboard_booknook",
        content: (
          <p>
            Here, you can be redirected to the Book Nook!
            <br /> But more on that later.
          </p>
        ),
      },
      {
        icon: <>🔄</>,
        title: "Your Reading Habit",
        showControls: true,
        side: "top",
        selector: "#dashboard_habit",
        content: (
          <p>
            Here, you can set your personalized reading habit!
            <br /> Choose your custom habit to see your progress.
          </p>
        ),
      },
    ],
  },
];

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!session) {
    redirect(config.auth.loginUrl);
  }
  return (
    <>
      <NextStepWrapper userId={user.id} steps={steps}>
        {children}
      </NextStepWrapper>
    </>
  );
}
