import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HabitConsistencyGraphProps {
  days: number;
}

const HabitConsistencyGraph: React.FC<HabitConsistencyGraphProps> = ({
  days,
}) => {
  const [habit, setHabit] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();
  const t = useTranslations("ReadingHabits");

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

    return dateRange.map((date) => {
      const progressForDay = habit.progress?.find(
        (p: any) =>
          new Date(p.date) >= startOfDay(date) &&
          new Date(p.date) <= endOfDay(date)
      );

      return {
        date: format(date, "MMM dd"),
        value: progressForDay ? progressForDay.value : 0,
        target: habit.value,
      };
    });
  };

  const data = generateData();

  if (!habit) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card bg-base-200 shadow-xl h-full">
      <div className="card-body">
        <h2 className="card-title">{t("consistency_graph")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-center">{t("progress_bar_chart")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name={t("actual")} fill="#8884d8" />
                <Bar dataKey="target" name={t("target")} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitConsistencyGraph;
