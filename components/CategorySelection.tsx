import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

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
    let newSelectedCategories: string[];

    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Prevent deselecting if it's the last category
        if (prev.length === 1) {
          return prev;
        }
        newSelectedCategories = prev.filter((cat) => cat !== category);
      } else if (prev.length < 10) {
        newSelectedCategories = [...prev, category];
      } else {
        newSelectedCategories = prev;
      }
      return newSelectedCategories;
    });

    // Update user preferences in the database
    supabase
      .from("user_preferences")
      .upsert({ user_id: userId, preferred_categories: newSelectedCategories })
      .select();
  };

  return (
    <div>
      <p className="mb-2">Select up to 10 categories:</p>
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => (
          <label key={category} className="flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mr-2"
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
