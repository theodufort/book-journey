import ReactConfetti from "react-confetti";

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
      <ReactConfetti />
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
