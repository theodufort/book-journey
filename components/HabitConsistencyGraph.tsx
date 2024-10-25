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
        console.log("Fetched habit data:", habitData);
        if (habitData?.streak) {
          console.log("Streak data:", habitData.streak);
        }
        setHabit(habitData);
      }
    }
  };

  const generateData = () => {
    if (!habit) {
      console.log("No habit data available");
      return [];
    }

    if (!habit.streak || !Array.isArray(habit.streak)) {
      console.log("Streak data missing or invalid:", habit.streak);
      return [];
    }

    const endDate = new Date();
    const startDate = addDays(endDate, -selectedDays + 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const data = dateRange.map((date) => {
      const progressForDay = habit.streak.find(
        (entry: { day: string; progress_value: number }) =>
          isSameDay(new Date(entry.day), date)
      );
      console.log(progressForDay);
      const dataPoint = {
        date: format(date, "MMM dd"),
        value: progressForDay ? Number(progressForDay.progress_value) : 0,
        target: Number(habit.value),
      };
      return dataPoint;
    });

    console.log("Generated graph data:", data);
    return data;
  };

  const data = generateData();

  return (
    <div
      className={`card bg-base-200 shadow-xl h-full ${
        !habit ? "border-2 border-dashed border-gray-300" : null
      }`}
    >
      <div className="card-body h-full flex flex-col">
        {!habit ? (
          <div className="flex items-center justify-center h-full ">
            <p className="text-center text-gray-500">{t("no_habits_yet")}</p>
          </div>
        ) : (
          <div>
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
            <div style={{ width: "100%", height: 300 }} className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval={selectedDays > 14 ? 2 : 0}
                    height={50}
                  />
                  <YAxis domain={[0, "auto"]} allowDecimals={false} />
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
        )}
      </div>
    </div>
  );
};

export default HabitConsistencyGraph;
