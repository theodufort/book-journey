import React from 'react';
import { useTranslations } from 'next-intl';

interface ReadingHabitGridProps {
  habit: any;
}

const ReadingHabitGrid: React.FC<ReadingHabitGridProps> = ({ habit }) => {
  const t = useTranslations('ReadingHabits');

  // Generate a 7x52 grid for a year
  const grid = Array(7).fill(null).map(() => Array(52).fill(0));

  // Fill the grid with habit data
  const startDate = new Date(habit.created_at);
  const currentDate = new Date();
  let currentDay = new Date(startDate);

  while (currentDay <= currentDate) {
    const day = currentDay.getDay();
    const week = Math.floor((currentDay.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (week >= 0 && week < 52) {
      grid[day][week] = 1; // Mark as completed
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const getDayLabel = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-53 gap-1" style={{ width: 'max-content' }}>
        <div className="col-span-1"></div>
        {Array(52).fill(null).map((_, index) => (
          <div key={`week-${index}`} className="text-xs text-center">{index + 1}</div>
        ))}
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="text-xs text-right pr-2">{getDayLabel(rowIndex)}</div>
            {row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-3 h-3 rounded-sm ${
                  value > 0 ? 'bg-primary' : 'bg-base-300'
                }`}
                title={`${value > 0 ? 'Completed' : 'Not completed'} on ${getDayLabel(rowIndex)}, Week ${colIndex + 1}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ReadingHabitGrid;
