import { useState } from "react";

export const LanguagePreferences = () => {
  const [bookLanguage, setBookLanguage] = useState<string>("en");
  const [interfaceLanguage, setInterfaceLanguage] = useState<string>("en");
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-extrabold py-2">Languages</h2>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Language for book search</span>
          </div>
          <select
            className="select select-bordered"
            onChange={(e) => setBookLanguage(e.target.value)}
          >
            <option disabled selected>
              Pick a language
            </option>
            <option value={"en"}>English</option>
            <option value={"fr"}>French</option>
          </select>
        </label>
      </div>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Language for the platform</span>
          </div>
          <select
            className="select select-bordered"
            onChange={(e) => setInterfaceLanguage(e.target.value)}
          >
            <option disabled selected>
              Pick a language
            </option>
            <option value={"en"}>English</option>
            <option value={"fr"}>French</option>
          </select>
        </label>
      </div>
    </div>
  );
};
