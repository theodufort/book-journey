import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface CategorySelectionProps {
  userId: string;
}

const categories = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy',
  'Romance', 'Thriller', 'Biography', 'History', 'Self-Help',
  'Business', 'Science', 'Technology', 'Art', 'Travel'
];

const CategorySelection: React.FC<CategorySelectionProps> = ({ userId }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Fetch user preferences
    const fetchPreferences = async () => {
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('category')
        .eq('user_id', userId);

      if (preferencesError) {
        console.error('Error fetching user preferences:', preferencesError);
        return;
      }

      setSelectedCategories(preferencesData.map(pref => pref.category));
    };

    fetchPreferences();
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
