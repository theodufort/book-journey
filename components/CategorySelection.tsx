import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface CategorySelectionProps {
  userId: string;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ userId }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Fetch categories and user preferences
    const fetchData = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('category')
        .eq('user_id', userId);

      if (preferencesError) {
        console.error('Error fetching user preferences:', preferencesError);
        return;
      }

      setCategories(categoriesData.map(cat => cat.name));
      setSelectedCategories(preferencesData.map(pref => pref.category));
    };

    fetchData();
  }, [userId]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else if (prev.length < 5) {
        return [...prev, category];
      }
      return prev;
    });
  };

  return (
    <div>
      <p className="mb-2">Select up to 5 categories:</p>
      <div className="grid grid-cols-2 gap-2">
        {categories.map(category => (
          <label key={category} className="flex items-center">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mr-2"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              disabled={selectedCategories.length >= 5 && !selectedCategories.includes(category)}
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategorySelection;
