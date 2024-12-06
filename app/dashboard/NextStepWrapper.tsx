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
  const [showTour, setShowTour] = useState(false);
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
  const getTourFinished = async () => {
    try {
      const { data: dataOnboarding, error } = await supabase
        .from("onboarding")
        .select("onboarded")
        .eq("user_id", userId)
        .single();

      // If we have data and onboarded is explicitly true, then the tour is finished
      if (dataOnboarding && dataOnboarding.onboarded === true) {
        setShowTour(false);
      } else {
        setShowTour(true);
      }
    } catch (error) {
      console.error("Error checking tour status:", error);
    }
  };
  useEffect(() => {
    getTourFinished();
  });
  return (
    <NextStepProvider>
      {showTour ? (
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
        children
      )}
    </NextStepProvider>
  );
}
