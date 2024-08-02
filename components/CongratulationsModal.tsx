// components/CongratulationsModal.tsx
import React from "react";
import Confetti from "react-confetti";

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageType: string;
  bookTitle: string;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose,
  messageType,
  bookTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <Confetti />
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        {messageType == "begin" ? (
          <p className="mb-4">
            You&apos;ve started reading "{bookTitle}". Enjoy your new adventure!
          </p>
        ) : (
          <p className="mb-4">
            You&apos;ve finished reading "{bookTitle}". What will you read next?
          </p>
        )}
        <button onClick={onClose} className="btn btn-primary">
          Close
        </button>
      </div>
    </div>
  );
};

export default CongratulationsModal;
