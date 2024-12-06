"use client";

import { NextStepProvider, NextStep, useNextStep } from "nextstepjs";
import OnboardingCard from "@/components/OnboardingCard";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

interface NextStepWrapperProps {
  children: React.ReactNode;
  userId: string;
  steps: any[];
}

function NextStepContent({ children, userId, steps }: NextStepWrapperProps) {
  const supabase = createClientComponentClient();
  const { currentTour } = useNextStep();

  const [showTour, setShowTour] = useState<boolean | null>(null);

  const getTourFinished = async () => {
    if (!currentTour) {
      setShowTour(false);
      return;
    }

    try {
      const { data: dataOnboarding, error } = await supabase
        .from("onboarding")
        .select("onboarded")
        .eq("user_id", userId)
        .eq("tour_name", currentTour)
        .single();

      if (error && error.code === "PGRST116") {
        // PGRST116 often indicates no rows returned by single() query
        // If no row is found, we show onboarding
        setShowTour(true);
      } else if (error) {
        console.error("Error checking tour status:", error);
        // If there's another error, decide a sensible default, e.g., show onboarding
        setShowTour(true);
      } else {
        // If we have data
        if (dataOnboarding && dataOnboarding.onboarded === true) {
          // User has completed the onboarding for this tour
          setShowTour(false);
        } else {
          // User hasn't completed the onboarding yet
          setShowTour(true);
        }
      }
    } catch (err) {
      console.error("Error checking tour status:", err);
      // If there's a runtime error, assume user not onboarded to be safe
      setShowTour(true);
    }
  };

  const setTourFinished = async () => {
    if (!currentTour) return;

    const now = new Date().toISOString();
    const { error } = await supabase.from("onboarding").upsert(
      {
        user_id: userId,
        tour_name: currentTour,
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

  useEffect(() => {
    // If currentTour is defined, check tour status, otherwise skip onboarding
    if (currentTour !== undefined) {
      getTourFinished();
    } else {
      // If no currentTour after initial load, just skip onboarding
      setShowTour(false);
    }
  }, [currentTour]);

  if (showTour === null) {
    // Loading state or show nothing until we have a definitive answer
    return null;
  }

  return showTour ? (
    <NextStep
      cardComponent={OnboardingCard}
      onComplete={setTourFinished}
      steps={steps}
      shadowRgb="0, 0, 0"
      shadowOpacity="0.8"
      cardTransition={{ duration: 0.2, type: "spring" }}
    >
      {children}
    </NextStep>
  ) : (
    <>{children}</>
  );
}

export default function NextStepWrapper({
  children,
  userId,
  steps,
}: NextStepWrapperProps) {
  return (
    <NextStepProvider>
      <NextStepContent userId={userId} steps={steps}>
        {children}
      </NextStepContent>
    </NextStepProvider>
  );
}
