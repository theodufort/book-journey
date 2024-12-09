// components/CongratulationsModal.tsx
import { useTranslations } from "next-intl";
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
  const t = useTranslations("CongratulationsModal");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center modal modal-open">
      <Confetti />
      <div
        className="bg-base-200 p-8 rounded-lg max-w-md w-full mx-10"
        style={{ boxShadow: "0 0px 50px 0px #cc785c" }}
      >
        <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
        {messageType == "begin" ? (
          <p className="mb-4">
            {t("started1")} "{bookTitle}". {t("started2")}
          </p>
        ) : (
          <p className="mb-4">
            {t("finished1")} "{bookTitle}". {t("finished2")}
          </p>
        )}
        <button onClick={onClose} className="btn btn-primary">
          {t("close_btn")}
        </button>
      </div>
    </div>
  );
};

export default CongratulationsModal;
