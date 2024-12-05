"use client";
import { CardComponentProps } from "nextstepjs";

const OnboardingCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}) => {
  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg flex flex-col gap-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{step.title}</h2>
        {step.icon}
      </div>
      <div className="mb-4 bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      <p>{step.content}</p>
      {step.showControls && (
        <div className="flex justify-between mt-4 space-x-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="bg-secondary text-black px-4 py-2 rounded-md"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="bg-primary text-black px-4 py-2 rounded-md"
          >
            {currentStep === totalSteps - 1 ? "Finish" : "Next"}
          </button>
        </div>
      )}
      {step.showSkip && (
        <button
          onClick={skipTour}
          className="px-4 py-2 rounded-md bg-secondary text-black"
        >
          Skip
        </button>
      )}
      {arrow}
    </div>
  );
};

export default OnboardingCard;
