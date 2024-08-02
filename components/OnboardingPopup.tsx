import React, { useState } from 'react';
import { Modal } from './Modal';

interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingPopup: React.FC<OnboardingPopupProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Choose Your Preferred Categories",
      content: "Select the book categories you're most interested in.",
      // Add category selection UI here
    },
    {
      title: "Add Your Books",
      content: "Start building your personal library by adding books you've read or want to read.",
      // Add book addition UI here
    },
    {
      title: "Get Recommendations and Rewards",
      content: "Based on your preferences and books, we'll provide personalized recommendations and exciting rewards!",
      // Add recommendations preview or rewards explanation here
    }
  ];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Modal isModalOpen={isOpen} setIsModalOpen={onClose}>
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{steps[step - 1].title}</h2>
        <p className="mb-6">{steps[step - 1].content}</p>
        
        {/* Step content goes here */}
        {/* You can add specific UI elements for each step */}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {step === steps.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingPopup;
