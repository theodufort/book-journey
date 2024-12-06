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
  const getTourFinished = async () => {
    try {
      const tourName = steps[0]?.tour;
      console.log("Checking tour status for:", { tourName, userId });

      const { data: dataOnboarding, error } = await supabase
        .from("onboarding")
        .select("onboarded")
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
        const isFinished = await getTourFinished();
        console.log("Tour finished status:", isFinished);
        setShowTour(!isFinished);
      } catch (error) {
        console.error("Error in checkTourStatus:", error);
        setShowTour(true); // Show tour on error
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      checkTourStatus();
    }
  }, [userId]);

  console.log("Render state:", {
    isLoading,
    showTour,
    hasSteps: steps[0]?.steps?.length > 0,
  });

  return (
    <NextStepProvider>
      {isLoading ? (
        children
      ) : showTour && steps[0]?.steps?.length > 0 ? (
        <NextStep
          cardComponent={OnboardingCard}
          onComplete={setTourFinished}
          steps={steps[0]?.steps || []}
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
