"use client";

import { NextStepProvider, NextStep, useNextStep } from "nextstepjs";
import OnboardingCard from "@/components/OnboardingCard";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function NextStepWrapper({
  children,
  userId,
  steps,
}: {
  children: React.ReactNode;
  userId: string;
  steps: any[];
}) {
  const supabase = createClientComponentClient();

  const setTourFinished = async () => {
    // Get the tour name from the first step group
    const tourName = steps[0]?.tour || "default";
    const now = new Date().toISOString();

    const { data, error } = await supabase.from("onboarding").upsert(
      {
        user_id: userId,
        tour_name: tourName,
        onboarded: true,
        onboarded_at: now,
      },
      {
        onConflict: "user_id,tour_name",
      }
    );

    if (error) {
      console.error("Error updating onboarding status:", error);
    }
  };
  const [showTour, setShowTour] = useState(true); // Start with showing the tour
  const [isLoading, setIsLoading] = useState(true);
  const [currentTour, setCurrentTour] = useState(() => {
    // Initialize tour type immediately
    return typeof window !== "undefined" &&
      window.location.pathname.includes("/book-nook")
      ? "booknookTour"
      : "dashboardTour";
  });

  const getTourFinished = async (tourName: string) => {
    try {
      console.log("Checking tour status for:", { tourName, userId });

      const { data: dataOnboarding, error } = await supabase
        .from("onboarding")
        .select("onboarded, tour_name")
        .eq("user_id", userId)
        .eq("tour_name", tourName)
        .single();

      console.log("Tour status response:", { dataOnboarding, error });

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No tour record found, showing tour");
          return false;
        }
        throw error;
      }

      return dataOnboarding?.onboarded || false;
    } catch (error) {
      console.error("Error checking tour status:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        console.log("Checking tour status with:", { currentTour, userId });
        const isFinished = await getTourFinished(currentTour);
        console.log("Tour finished status:", isFinished);
        setShowTour(!isFinished);
      } catch (error) {
        console.error("Error in checkTourStatus:", error);
        setShowTour(true); // Show tour on error
      } finally {
        setIsLoading(false);
      }
    };

    if (currentTour && userId) {
      checkTourStatus();
    }
  }, [currentTour, userId]);

  // Find the current tour steps
  const currentTourSteps =
    steps.find((step) => step.tour === currentTour)?.steps || [];

  console.log("Render state:", {
    isLoading,
    showTour,
    currentTour,
    hasSteps: currentTourSteps.length > 0,
  });

  return (
    <NextStepProvider>
      {isLoading ? (
        children
      ) : showTour && currentTourSteps.length > 0 ? (
        <NextStep
          cardComponent={OnboardingCard}
          onComplete={setTourFinished}
          steps={currentTourSteps}
          shadowRgb="0, 0, 0"
          shadowOpacity="0.8"
          cardTransition={{ duration: 0.2, type: "spring" }}
        >
          {children}
        </NextStep>
      ) : (
        children
      )}
    </NextStepProvider>
  );
}
