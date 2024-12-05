"use client";

import { NextStepProvider, NextStep } from "nextstepjs";
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

    const { data, error } = await supabase
      .from("onboarding")
      .upsert({ user_id: userId, onboarded: true, tour_name: tourName })
      .eq("user_id", userId);
  };
  const [showTour, setShowTour] = useState(true);

  const getTourFinished = async () => {
    const tourName = steps[0]?.tour || "default";

    const { data: dataOnboarding, error } = await supabase
      .from("onboarding")
      .select("onboarded, tour_name")
      .eq("user_id", userId)
      .single();

    return dataOnboarding?.onboarded || false;
  };

  useEffect(() => {
    const checkTourStatus = async () => {
      const isFinished = await getTourFinished();
      setShowTour(!isFinished);
    };
    
    checkTourStatus();
  }, []);

  return (
    <NextStepProvider>
      {showTour && (
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
      )}
      {!showTour && children}
    </NextStepProvider>
  );
}
