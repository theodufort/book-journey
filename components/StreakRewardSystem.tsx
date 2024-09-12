import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
const rewards = [1, 1, 3, 3, 5, 5, 10, 10];
const StreakRewardSystem = () => {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState(null);
  async function checkStreak() {
    // Fetch the user's streak data from the database
    const { data: userStreak, error } = await supabase
      .from("user_point_streak")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user streak:", error);
      return;
    }

    // Get the last sign-in date from the user's metadata
    const lastSignIn = new Date(user.last_sign_in_at);
    const today: any = new Date();

    // Define the streak dates array
    const streakDates: any = [
      userStreak.day1,
      userStreak.day2,
      userStreak.day3,
      userStreak.day4,
      userStreak.day5,
      userStreak.day6,
      userStreak.day7,
    ];

    // Find the last day in the streak
    const lastStreakDayIndex: any = streakDates.findIndex(
      (day: any) => day === null
    );
    const lastStreakDate: any =
      lastStreakDayIndex > 0
        ? new Date(streakDates[lastStreakDayIndex - 1])
        : null;

    // Reset streak if the user hasn't signed in for more than 24 hours since the last streak date
    if (lastStreakDate) {
      const diffInHours = Math.abs(today - lastStreakDate) / (1000 * 60 * 60);

      if (diffInHours > 48) {
        // If more than 48 hours (2 days) have passed, reset the streak
        await supabase
          .from("user_point_streak")
          .update({
            day1: today.toISOString(),
            day2: null,
            day3: null,
            day4: null,
            day5: null,
            day6: null,
            day7: null,
          })
          .eq("id", user.id);
        console.log("Streak reset due to inactivity.");
        return;
      } else if (diffInHours < 24) {
        // If less than 24 hours since the last streak update, do nothing
        console.log("Streak cannot be updated yet; wait for 24 hours.");
        return;
      }
    }

    // If no streak has been started, initialize the first day
    if (lastStreakDayIndex === 0) {
      await supabase
        .from("user_point_streak")
        .update({ day1: today.toISOString() })
        .eq("id", user.id);
    } else if (lastStreakDate) {
      // Calculate the difference in days between today and the last streak date
      const diffInDays = Math.floor(
        (today - lastStreakDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        // Update the next day in the streak
        const updateData: any = {};
        updateData[`day${lastStreakDayIndex + 1}`] = today.toISOString();
        await supabase
          .from("user_point_streak")
          .update(updateData)
          .eq("id", user.id);
      } else if (diffInDays > 1) {
        // If more than one day has passed, reset the streak
        await supabase
          .from("user_point_streak")
          .update({
            day1: today.toISOString(),
            day2: null,
            day3: null,
            day4: null,
            day5: null,
            day6: null,
            day7: null,
          })
          .eq("id", user.id);
      }
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);
  async function updateStreak() {
    // Fetch the user's streak data from the database
    const { data: streakSetting } = await supabase
      .from("user_point_streak")
      .select("*")
      .eq("id", user.id)
      .single();
    setStreak(streakSetting);
  }
  useEffect(() => {
    if (user) {
      checkStreak();
      updateStreak();
    }
  }, [user]);
  return (
    <div className="m-auto">
      {streak != null ? (
        <ul className="steps steps-vertical lg:steps-horizontal gap-4">
          <li
            data-content={`+${rewards[0]}`}
            className={`step ${streak.day1 ? "step-warning" : null}`}
          >
            <div className="badge badge-primary">Day 1</div>
          </li>
          <li
            data-content={`+${rewards[1]}`}
            className={`step ${streak.day2 ? "step-warning" : null}`}
          >
            <div className="badge badge-primary">Day 2</div>
          </li>
          <li
            data-content={`+${rewards[2]}`}
            className={`step ${streak.day3 ? "step-warning" : null}`}
          >
            <div className="badge badge-primary">Day 3</div>
          </li>
          <li
            data-content={`+${rewards[3]}`}
            className={`step ${streak.day4 ? "step-warning" : null}`}
          >
            <div className="badge badge-primary">Day 4</div>
          </li>
          <li
            data-content={`+${rewards[4]}`}
            className={`step ${streak.day5 ? "step-warning" : null}`}
          >
            <div className="badge badge-primary">Day 5</div>
          </li>
          <li
            data-content={`+${rewards[5]}`}
            className={`step ${streak.day6 ? "step-primary" : null}`}
          >
            <div className="badge badge-primary">Day 6</div>
          </li>
          <li
            data-content={`+${rewards[6]}`}
            className={`step ${streak.day7 ? "step-primary" : null}`}
          >
            <div className="badge badge-primary">Day 7</div>
          </li>
        </ul>
      ) : null}
    </div>
  );
};

export default StreakRewardSystem;
