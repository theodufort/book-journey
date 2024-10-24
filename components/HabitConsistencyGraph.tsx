import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { addDays, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

interface HabitConsistencyGraphProps {
  habit: any;
  days: number;
}

const HabitConsistencyGraph: React.FC<HabitConsistencyGraphProps> = ({ habit, days }) => {
  const generateData = () => {
    const endDate = new Date();
    const startDate = addDays(endDate, -days + 1);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateRange.map(date => {
      const progressForDay = habit.progress?.find((p: any) => 
        new Date(p.date) >= startOfDay(date) && new Date(p.date) <= endOfDay(date)
      );

      return {
        date: format(date, 'MMM dd'),
        value: progressForDay ? progressForDay.value : 0,
      };
    });
  };

  const data = generateData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HabitConsistencyGraph;
