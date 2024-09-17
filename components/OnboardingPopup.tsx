import React, { useState } from "react";
import CategorySelection from "./CategorySelection";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const OnboardingPopup: React.FC<OnboardingPopupProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const supabase = createClientComponentClient<Database>();
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Choose Your Preferred Categories",
      content: "Select the book categories you're most interested in.",
      component: <CategorySelection userId={userId} />,
    },
    {
      title: "Add Your Books",
      content:
        "Start building your personal library by adding books you've read or want to read.",
      // Add book addition UI here
    },
    {
      title: "Get Recommendations and Rewards",
      content:
        "Based on your preferences and books, we'll provide personalized recommendations and exciting rewards!",
      // Add recommendations preview or rewards explanation here
    },
  ];
  async function handleFinishOnboarding() {
    await supabase
      .from("user_preferences")
      .update({ onboarded: true })
      .eq("user_id", userId);
  }
  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      handleFinishOnboarding();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">{steps[step - 1].title}</h3>
        <p className="py-4">{steps[step - 1].content}</p>

        {steps[step - 1].component}

        <div className="modal-action">
          {step > 1 && (
            <button onClick={handlePrevious} className="btn btn-outline">
              Previous
            </button>
          )}
          <button onClick={handleNext} className="btn btn-primary">
            {step === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPopup;
