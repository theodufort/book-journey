import ReactConfetti from "react-confetti";

interface CongratulationsModalSessionProps {
  isOpen: boolean;
  onClose: () => void;
  pagesRead: number;
  sessionStartTime: Date | null;
}

export default function CongratulationsModalSession({
  isOpen,
  onClose,
  pagesRead,
  sessionStartTime,
}: CongratulationsModalSessionProps) {
  if (!isOpen) return null;

  return (
    <dialog id="congrats_modal" className="modal modal-open">
      <ReactConfetti />
      <div className="modal-box" style={{ backgroundColor: "#FFE0B5" }}>
        <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
        <div className="py-4 space-y-2">
          <p>You've completed another reading session! Keep up the great work!</p>
          <p className="flex items-center gap-2">
            <span>📚</span> You read {pagesRead} pages
          </p>
          {sessionStartTime && (
            <p className="flex items-center gap-2">
              <span>⏱️</span> Session duration:{" "}
              {Math.round(
                (new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60
              )}{" "}
              minutes
            </p>
          )}
        </div>
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
