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

    // Find the latest date in streak entries
    const latestStreakDate = habit.streak.reduce((latest: Date, entry: { day: string }) => {
      const entryDate = new Date(entry.day);
      return entryDate > latest ? entryDate : latest;
    }, new Date(0));

    const endDate = latestStreakDate;
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    const startDate = addDays(endDate, -(selectedDays - 1));
    startDate.setHours(0, 0, 0, 0); // Set to start of first day
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const data = dateRange.map((date) => {
      // Log the current date we're checking and the streak entries
      console.log(
        "Available streak entries:",
        habit.streak.map((entry: { day: string }) => entry.day)
      );

      // Find all entries for this day
      const entriesForDay = habit.streak.filter(
        (entry: { day: string; progress_value: number }) => {
          // Use format to compare dates as strings in local timezone
          const entryDateStr = format(entry.day, "yyyy-MM-dd");
          const currentDateStr = format(date, "yyyy-MM-dd");

          console.log(
            `Comparing dates: entry=${entryDateStr} current=${currentDateStr}`
          );
          return entryDateStr === currentDateStr;
        }
      );

      // Get the last entry for the day (if any exist)
      const progressForDay =
        entriesForDay.length > 0
          ? entriesForDay[entriesForDay.length - 1]
          : null;

      console.log(
        `Date ${format(date, "yyyy-MM-dd")} has ${
          entriesForDay.length
        } entries, last value: ${progressForDay?.progress_value}`
      );

      // Track last known value outside the data array
      static let lastKnownValue = 0;
      
      let value = 0;
      if (progressForDay) {
        value = Number(progressForDay.progress_value);
        lastKnownValue = value; // Update last known value
      } else {
        // Use the last known value
        value = lastKnownValue;
      }

      const dataPoint = {
        date: format(date, "MMM dd"),
        value: value,
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
