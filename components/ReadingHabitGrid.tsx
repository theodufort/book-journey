import React from 'react';
import { useTranslations } from 'next-intl';

interface ReadingHabitGridProps {
  habits: any[];
}

const ReadingHabitGrid: React.FC<ReadingHabitGridProps> = ({ habits }) => {
  const t = useTranslations('ReadingHabits');

  // Generate a 7x52 grid for a year
  const grid = Array(7).fill(null).map(() => Array(52).fill(0));

  // Fill the grid with habit data (this is a simplified example)
  habits.forEach(habit => {
    const day = new Date(habit.created_at).getDay();
    const week = Math.floor((new Date(habit.created_at).getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)) + 52;
    if (week >= 0 && week < 52) {
      grid[day][week] += 1;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-52 gap-1" style={{ width: 'max-content' }}>
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-3 h-3 rounded-sm ${
                  value > 0 ? 'bg-primary' : 'bg-base-300'
                }`}
                title={`${value} habits on this day`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ReadingHabitGrid;
