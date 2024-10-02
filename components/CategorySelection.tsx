import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

interface CategorySelectionProps {
  userId: string;
}

const categories = [
  "Fantasy",
  "History",
  "Music",
  "Art",
  "Biography",
  "Business",
  "Chick Lit",
  "Children's",
  "Christian",
  "Classics",
  "Comics",
  "Contemporary",
  "Cookbooks",
  "Crime",
  "Ebooks",
  "Fiction",
  "Gay and Lesbian",
  "Graphic Novels",
  "Historical Fiction",
  "Horror",
  "Humor and Comedy",
  "Manga",
  "Memoir",
  "Mystery",
  "Nonfiction",
  "Paranormal",
  "Philosophy",
  "Poetry",
  "Psychology",
  "Religion",
  "Romance",
  "Science",
  "Science Fiction",
  "Self-Help",
  "Suspense",
  "Spirituality",
  "Sports",
  "Thriller",
  "Travel",
  "Technology",
];

const CategorySelection: React.FC<CategorySelectionProps> = ({ userId }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const supabase = createClientComponentClient<Database>();
  const t = useTranslations("CategorySelection");
  useEffect(() => {
    // Fetch user preferences
    const fetchPreferences = async () => {
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("user_preferences")
        .select("preferred_categories")
        .eq("user_id", userId)
        .single();

      if (preferencesError) {
        console.error("Error fetching user preferences:", preferencesError);
        return;
      }

      if (
        preferencesData &&
        preferencesData.preferred_categories &&
        preferencesData.preferred_categories.length > 0
      ) {
        setSelectedCategories(preferencesData.preferred_categories);
      } else {
        // If no categories are selected, default to the first category
        const defaultCategory = categories[0];
        setSelectedCategories([defaultCategory]);
        // Update the database with the default category
        const { error } = await supabase
          .from("user_preferences")
          .upsert({ user_id: userId, preferred_categories: [defaultCategory] })
          .select();

        if (error) {
          console.error("Error setting default category:", error);
        }
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleCategoryChange = async (category: string) => {
    setSelectedCategories((prev) => {
      let newSelectedCategories: string[];

      if (prev.includes(category)) {
        // Prevent deselecting if it's the last category
        if (prev.length === 1) {
          return prev;
        }
        newSelectedCategories = prev.filter((cat) => cat !== category);
      } else if (prev.length < 10) {
        newSelectedCategories = [...prev, category];
      } else {
        return prev; // No change if already at 10 categories
      }

      // Update user preferences in the database immediately
      supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          preferred_categories: newSelectedCategories,
        })
        .select()
        .then(({ error }) => {
          if (error) {
            console.error("Error updating user preferences:", error);
            // Optionally, you could revert the state change here if the database update fails
          }
        });

      return newSelectedCategories;
    });
  };

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-extrabold py-2">{t("title")}</h2>
      <p className="mb-2">{t("prompt")}</p>
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <label key={category} className="flex items-center mr-1 mb-1">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mr-1"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              disabled={
                selectedCategories.length >= 10 &&
                !selectedCategories.includes(category)
              }
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategorySelection;
