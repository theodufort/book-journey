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
}) => {
  const t = useTranslations("CongratulationsModal");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center modal modal-open">
      <Confetti />
      <div
        className="bg-base-200 p-8 rounded-lg max-w-md w-full mx-10"
        style={{ boxShadow: "0 0px 50px 0px #6366f1" }}
      >
        <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
        <button onClick={onClose} className="btn btn-primary">
          {t("close_btn")}
        </button>
      </div>
    </div>
  );
};

export default CongratulationsModal;
interface CongratulationsModalSessionProps {
  isOpen: boolean;
  onClose: () => void;
  pagesRead: number;
}

export default function CongratulationsModalSession({
  isOpen,
  onClose,
  pagesRead,
}: CongratulationsModalSessionProps) {
  if (!isOpen) return null;

  return (
    <dialog id="congrats_modal" className="modal modal-open">
      <div className="modal-box" style={{ backgroundColor: "#FFE0B5" }}>
        <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
        <p className="py-4">
          You've completed another reading session! You read {pagesRead} pages.
          Keep up the great work!
        </p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary" onClick={onClose}>
              Continue Reading
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
