import ReactConfetti from "react-confetti";
import toast from "react-hot-toast";

interface CongratulationsModalSessionProps {
  isOpen: boolean;
  onClose: () => void;
  pagesRead: number;
  sessionStartTime: Date | null;
  readingSessionId: string;
}

export default function CongratulationsModalSession({
  isOpen,
  onClose,
  pagesRead,
  sessionStartTime,
  readingSessionId,
}: CongratulationsModalSessionProps) {
  if (!isOpen) return null;
  const copySessionLink = (id: string) => {
    const link = process.env.NEXT_PUBLIC_BASE_URL + `/reading-sessions/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };
  return (
    <dialog id="congrats_modal" className="modal modal-open">
      <ReactConfetti />
      <div className="modal-box" style={{ backgroundColor: "#FFE0B5" }}>
        <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
        <div className="py-4 space-y-2">
          <p>
            You've completed another reading session! Keep up the great work!
          </p>
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
            <div className="gap-4 flex">
              <button className="btn btn-secondary" onClick={onClose}>
                Continue Reading
              </button>
              <button
                onClick={() => copySessionLink(readingSessionId)}
                className="btn btn-primary"
              >
                Share Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
