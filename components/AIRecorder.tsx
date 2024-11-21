import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onTranscription: (text: string) => void;
  autoFormatEnabled: boolean;
  autoCleanEnabled: boolean;
}

export default function AIRecorder({
  onTranscription,
  autoFormatEnabled,
  autoCleanEnabled,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleModalClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <dialog id="transcribe_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Transcribe Audio</h3>
          <div className="flex flex-col gap-4">
            <audio ref={audioRef} src={audioPreview} controls className="w-full" />
            <button
              className="btn btn-primary w-full"
              onClick={async () => {
                setIsTranscribing(true);
                try {
                  const response = await fetch(audioPreview);
                  const audioBlob = await response.blob();

                  const formData = new FormData();
                  formData.append("file", audioBlob);
                  formData.append("autoFormat", autoFormatEnabled.toString());
                  formData.append("autoClean", autoCleanEnabled.toString());

                  const transcribeResponse = await fetch(
                    "/api/ai/notes/speech-to-text",
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  if (!transcribeResponse.ok)
                    throw new Error("Transcription failed");

                  const data = await transcribeResponse.json();
                  onTranscription(data.text);
                  setAudioPreview(null);
                  (
                    document.getElementById(
                      "transcribe_modal"
                    ) as HTMLDialogElement
                  )?.close();
                } catch (error) {
                  console.error("Error transcribing audio:", error);
                  toast.error("Failed to transcribe audio");
                } finally {
                  setIsTranscribing(false);
                }
              }}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Start Transcription"
              )}
            </button>
          </div>
          <div className="modal-action">
            <form method="dialog" onSubmit={handleModalClose}>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      <button
        className={`btn ${
          isRecording
            ? "btn-base-100 btn-circle w-12 h-12 p-0"
            : "btn-primary flex items-center gap-2 md:px-4 px-2"
        }`}
        onClick={async () => {
          if (isRecording) {
            mediaRecorder?.stop();
            setIsRecording(false);
          } else {
            setAudioPreview(null);

            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
              });
              const recorder = new MediaRecorder(stream);
              const chunks: BlobPart[] = [];

              recorder.ondataavailable = (e) => chunks.push(e.data);
              recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/mp3" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioPreview(audioUrl);
                stream.getTracks().forEach((track) => track.stop());
                // Show the dialog immediately after recording stops
                setTimeout(() => {
                  (
                    document.getElementById(
                      "transcribe_modal"
                    ) as HTMLDialogElement
                  )?.showModal();
                }, 100);
              };

              setMediaRecorder(recorder);
              recorder.start();
              setIsRecording(true);
            } catch (error) {
              console.error("Error accessing microphone:", error);
              toast.error("Failed to access microphone");
            }
          }
        }}
      >
        {isRecording ? (
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            <span className="hidden md:inline">Start Recording</span>
          </>
        )}
      </button>
    </>
  );
}
