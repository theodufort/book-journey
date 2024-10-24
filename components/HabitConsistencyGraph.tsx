// HabitConsistencyGraph.tsx
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { addDays, eachDayOfInterval, format, isSameDay } from "date-fns";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HabitConsistencyGraphProps {
  initialDays: number;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [matches, query]);

  return matches;
}

const HabitConsistencyGraph: React.FC<HabitConsistencyGraphProps> = ({
  initialDays,
}) => {
  const [habit, setHabit] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const supabase = createClientComponentClient<Database>();
  const t = useTranslations("ReadingHabits");

  // Detect if the screen size is medium or larger
  const isMd = useMediaQuery("(min-width: 768px)");

  // Set selectedDays based on screen size
  const [selectedDays, setSelectedDays] = useState(isMd ? initialDays : 7);

  // Update selectedDays when screen size changes
  useEffect(() => {
    if (!isMd) {
      setSelectedDays(7);
    } else {
      setSelectedDays(initialDays);
    }
  }, [isMd, initialDays]);

  useEffect(() => {
    fetchHabitAndProgress();
  }, []);

  const fetchHabitAndProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Fetch habit data
      const { data: habitData, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (habitError) {
        console.error("Error fetching habit:", habitError);
        setHabit(null);
      } else {
        setHabit(habitData);

        // Fetch progress data
        const { data: progressEntries, error: progressError } = await supabase
          .from("habits")
          .select("*")
          .eq("id", habitData.id);

        if (progressError) {
          console.error("Error fetching progress data:", progressError);
          setProgressData([]);
        } else {
          setProgressData(progressEntries);
        }
      }
    }
  };

  const generateData = () => {
    if (!habit) return [];

    const endDate = new Date();
    const startDate = addDays(endDate, -selectedDays + 1);

    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map((date) => {
      const progressForDay = progressData.find((p: any) =>
        isSameDay(new Date(p.date), date)
      );

      return {
        date: format(date, "MMM dd"),
        value: progressForDay ? Number(progressForDay.value) : 0,
        target: Number(habit.value),
      };
    });
  };

  const data = generateData();

  if (!habit) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl h-full">
      <div className="card-body h-full flex flex-col">
        {/* Title and Date Range Buttons Inline on larger screens */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <h2 className="card-title text-center md:justify-start">
            {t("consistency_graph", { days: selectedDays })}
          </h2>
          {/* Date Range Selection Buttons - only visible on md and larger */}
          {isMd && (
            <div className="flex space-x-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  className={`btn btn-sm ${
                    selectedDays === days ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setSelectedDays(days)}
                >
                  {days} {t("days")}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Chart */}
        <div className="flex-1 mt-4 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={selectedDays > 14 ? 2 : 0}
              />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={t("actual")}
                stroke="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="target"
                name={t("target")}
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HabitConsistencyGraph;
