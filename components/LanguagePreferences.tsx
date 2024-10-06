import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { setUserLocale } from "@/libs/locale";
import { Locale } from "@/i18n/config";

interface LanguagePreferencesProps {
  userId: string;
}

export const LanguagePreferences: React.FC<LanguagePreferencesProps> = ({ userId }) => {
  const [bookLanguage, setBookLanguage] = useState<string>("en");
  const [interfaceLanguage, setInterfaceLanguage] = useState<string>("en");
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchLanguagePreferences = async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferred_book_language, preferred_ui_language")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching language preferences:", error);
      } else if (data) {
        setBookLanguage(data.preferred_book_language || "en");
        setInterfaceLanguage(data.preferred_ui_language || "en");
      }
    };

    fetchLanguagePreferences();
  }, [userId, supabase]);

  const updateLanguagePreferences = async (
    type: "book" | "ui",
    value: string
  ) => {
    const updateData =
      type === "book"
        ? { preferred_book_language: value }
        : { preferred_ui_language: value };

    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: userId, ...updateData });

    if (error) {
      console.error(`Error updating ${type} language preference:`, error);
    } else {
      if (type === "book") {
        setBookLanguage(value);
      } else {
        setInterfaceLanguage(value);
        await setUserLocale(value as Locale);
      }
    }
  };

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
            value={bookLanguage}
            onChange={(e) => updateLanguagePreferences("book", e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
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
            value={interfaceLanguage}
            onChange={(e) => updateLanguagePreferences("ui", e.target.value)}
          >
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>
    </div>
  );
};
