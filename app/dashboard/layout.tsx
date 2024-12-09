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
  {
    tour: "booknookTour",
    steps: [
      {
        icon: <>☯️</>,
        title: "Introducing: The Book Nook",
        showControls: true,
        content: (
          <p>
            The Book Nook is your all-in-one safe space/reading optimized
            environment for you to consolidate your thoughts in one place.{" "}
            <br />
            Let us break it down for you.
          </p>
        ),
      },
      {
        icon: <>📘</>,
        title: "1. Choose your book",
        showControls: true,
        side: "bottom",
        selector: "#booknook-bookselect",
        content: (
          <p>
            Everything you do in this page is separated by book.
            <br />
            <br />
            Start by choosing your book!
          </p>
        ),
      },
      {
        icon: <>✍</>,
        title: "2. Take notes",
        showControls: true,
        side: "top",
        selector: "#booknook-sessionnote",
        content: (
          <p>
            Session notes are your friend.
            <br />
            <br />
            Start reading and note everything that comes to mind!
          </p>
        ),
      },
      {
        icon: <>❓</>,
        title: "3. Save questions for later",
        showControls: true,
        side: "top",
        selector: "#booknook-sessionquestion",
        content: (
          <p>
            Don't stop reading
            <br />
            <br />
            Write a quick question and come back to it later
          </p>
        ),
      },
      {
        icon: <>📝</>,
        title: "4. View your previous notes",
        showControls: true,
        side: "left",
        selector: "#booknook-previousnotes",
        content: (
          <p>
            Forgot what you were reading?
            <br />
            <br />
            Its all here...
          </p>
        ),
      },
      {
        icon: <>💾</>,
        title: "5. Log your reading session",
        showControls: true,
        side: "top",
        selector: "#booknook-logsession",
        content: (
          <p>
            Finished reading?
            <br />
            Specify those:
            <br />
            - Starting Page
            <br />- Ending Page
            <br />- Label (optional)
          </p>
        ),
      },
    ],
  },
  {
    tour: "readinglistTour",
    steps: [
      {
        icon: <>📚</>,
        title: "Your Reading List",
        showControls: true,
        content: (
          <p>
            Your reading list allows you to track your books by status.
            <br />
            Those are either: To Read, Currently Reading or Finished!
          </p>
        ),
      },
      {
        icon: <>📘</>,
        title: "Add a new book!",
        side: "bottom",
        selector: "#readinglist-addbook",
        showControls: true,
        content: <p>Start by adding your first book.</p>,
      },
    ],
  },
  {
    tour: "recommendationsTour",
    steps: [
      {
        icon: <>🔮</>,
        title: "Your Recommendations",
        showControls: true,
        content: (
          <p>
            Get personalized book recommendations based on your previous books.
            <br />
            This feature is still in beta!
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
  if (!session || !user?.id) {
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
