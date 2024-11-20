import { useState, useRef } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function DictionaryWidget() {
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [definition, setDefinition] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="space-y-3">
      <div className="join w-full">
        <input
          type="text"
          placeholder="Enter a word..."
          className="join-item input input-bordered w-full"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
      </div>
      <button
        className="btn btn-primary btn-sm w-full"
        onClick={async () => {
          if (!word) return;

          setIsLoading(true);
          try {
            const response = await fetch("/api/ai/notes/dictionary", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: `Define the word: ${word}`,
              }),
            });

            if (!response.ok) throw new Error("Failed to get definition");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader available");

            let result = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              result += new TextDecoder().decode(value);
            }

            setDefinition(result);
            dialogRef.current?.showModal();
          } catch (error) {
            console.error("Dictionary error:", error);
            toast.error("Failed to get definition");
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "Look up"
        )}
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box relative w-11/12 max-w-5xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Definition of "{word}"</h3>
          <div className="prose">
            <ReactMarkdown>{definition}</ReactMarkdown>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
