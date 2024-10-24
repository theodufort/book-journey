import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { addDays, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

interface HabitConsistencyGraphProps {
  days: number;
}

const HabitConsistencyGraph: React.FC<HabitConsistencyGraphProps> = ({ days }) => {
  const [habit, setHabit] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchHabit();
  }, []);

  const fetchHabit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (error) {
        console.error("Error fetching habit:", error);
        setHabit(null);
      } else {
        setHabit(data);
      }
    }
  };

  const generateData = () => {
    if (!habit) return [];

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

  if (!habit) {
    return <div>Loading...</div>;
  }

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
