import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/libs/locale";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface LanguagePreferencesProps {
  userId: string;
}

export const LanguagePreferences: React.FC<LanguagePreferencesProps> = ({
  userId,
}) => {
  const t = useTranslations("LanguagePreferences");
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
      <h2 className="text-2xl md:text-3xl font-extrabold py-2">{t("title")}</h2>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">{t("subtitle")}</span>
          </div>
          <select
            className="select select-bordered"
            value={bookLanguage}
            onChange={(e) => updateLanguagePreferences("book", e.target.value)}
          >
            <option value="en">{t("english")}</option>
            <option value="fr">{t("french")}</option>
            <option value="es">{t("spanish")}</option>
          </select>
        </label>
      </div>
      <div>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">{t("title2")}</span>
          </div>
          <select
            className="select select-bordered"
            value={interfaceLanguage}
            onChange={(e) => updateLanguagePreferences("ui", e.target.value)}
          >
            <option value="en">{t("english")}</option>
            <option value="fr">{t("french")}</option>
          </select>
        </label>
      </div>
    </div>
  );
};
