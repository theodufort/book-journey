import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  onTranscription: (text: string) => void;
  autoFormatEnabled: boolean;
  autoCleanEnabled: boolean;
}

export default function AIRecorder({ onTranscription, autoFormatEnabled, autoCleanEnabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  return (
    <div className="flex gap-2 items-center">
      {audioPreview && !isRecording && (
        <>
          <button 
            className="btn btn-primary"
            onClick={() => (document.getElementById('transcribe_modal') as HTMLDialogElement)?.showModal()}
          >
            Transcribe
          </button>
          <dialog id="transcribe_modal" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Transcribe Audio</h3>
              <div className="flex flex-col gap-4">
                <audio src={audioPreview} controls className="w-full" />
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

                      const transcribeResponse = await fetch("/api/ai/notes/speech-to-text", {
                        method: "POST",
                        body: formData,
                      });

                      if (!transcribeResponse.ok) throw new Error("Transcription failed");

                      const data = await transcribeResponse.json();
                      onTranscription(data.text);
                      setAudioPreview(null);
                      (document.getElementById('transcribe_modal') as HTMLDialogElement)?.close();
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
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </>
      )}
      {audioPreview && !isRecording && (
        <button
          className="btn btn-circle btn-ghost"
          onClick={() => setAudioPreview(null)}
          title="Clear recording"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <button
        className={`btn btn-circle ${isRecording ? "btn-error" : "btn-primary"}`}
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
        {isRecording ? <MicOff /> : <Mic />}
      </button>
    </div>
  );
}
