import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import CategorySelection from "./CategorySelection";

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
  const t = useTranslations("OnboardingPopup");
  const supabase = createClientComponentClient<Database>();
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: t("step1_title"),
      content: t("step1_content"),
    },
    {
      title: t("step2_title"),
      content: t("step2_content"),
      component: <CategorySelection userId={userId} />,
    },
    {
      title: t("step3_title"),
      content: t("step3_content"),
    },
    {
      title: t("step4_title"),
      content: t("step4_content"),
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
