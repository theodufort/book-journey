import { useState } from "react";
import toast from "react-hot-toast";

export default function TranslationWidget() {
  const [textToTranslate, setTextToTranslate] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  return (
    <div className="space-y-3">
      <div className="join w-full">
        <input
          type="text"
          placeholder="Text to translate..."
          className="join-item input input-bordered w-3/4"
          value={textToTranslate}
          onChange={(e) => setTextToTranslate(e.target.value)}
        />
        <select
          className="join-item select select-bordered w-1/4"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="it">IT</option>
          <option value="pt">PT</option>
          <option value="ru">RU</option>
          <option value="ja">JA</option>
          <option value="ko">KO</option>
          <option value="zh">ZH</option>
        </select>
      </div>
      <button
        className="btn btn-primary btn-sm w-full"
        onClick={async () => {
          if (!textToTranslate) return;

          setIsTranslating(true);
          try {
            const response = await fetch(
              "https://translate.mybookquest.com/translate",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  q: textToTranslate,
                  source: "auto",
                  target: targetLang,
                }),
              }
            );

            if (!response.ok) throw new Error("Translation failed");

            const data = await response.json();
            setTextToTranslate(data.translatedText);
          } catch (error) {
            console.error("Translation error:", error);
            toast.error("Translation failed");
          } finally {
            setIsTranslating(false);
          }
        }}
        disabled={isTranslating}
      >
        {isTranslating ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "Translate"
        )}
      </button>
    </div>
  );
}
