import { getUser } from "@/libs/supabase/queries";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const rewards = [1, 1, 3, 3, 5, 5, 10]; // Rewards for days 1 to 7

const StreakRewardSystem = ({ onUpdate }: { onUpdate: () => void }) => {
  const t = useTranslations("StreakRewardSystem");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<any>(null);

  async function checkStreak() {
    // Fetch the user's streak data from the database
    const { data: userStreak, error } = await supabase
      .from("user_point_streak")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (error) {
      console.error("Error fetching user streak:", error);
      return;
    }

    setStreak(userStreak);

    // Get the last sign-in date from the user's metadata
    const lastSignIn = new Date(user?.last_sign_in_at as string);
    const today = new Date();

    // Define the streak dates and reward tracking array
    const streakDates = [
      userStreak.day1,
      userStreak.day2,
      userStreak.day3,
      userStreak.day4,
      userStreak.day5,
      userStreak.day6,
      userStreak.day7,
    ];

    let rewardAwarded = userStreak.reward_awarded || [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    // Adjusted calculation for lastStreakDayIndex and lastStreakDate
    let lastStreakDayIndex = streakDates.findIndex((day) => day === null);
    if (lastStreakDayIndex === -1) {
      // All days are filled
      lastStreakDayIndex = streakDates.length; // 7
    }
    const lastStreakDate =
      lastStreakDayIndex > 0
        ? new Date(streakDates[lastStreakDayIndex - 1])
        : null;

    // Reset streak if the user hasn't signed in for more than 48 hours since the last streak date
    if (lastStreakDate) {
      const diffInHours =
        (today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours > 48) {
        // Reset the streak and award points for day 1
        const { data: resetStreak, error: resetError } = await supabase
          .from("user_point_streak")
          .update({
            day1: today.toISOString(),
            day2: null,
            day3: null,
            day4: null,
            day5: null,
            day6: null,
            day7: null,
            reward_awarded: [true, false, false, false, false, false, false],
          })
          .eq("user_id", user?.id)
          .select()
          .single();

        if (resetError) {
          console.error("Error resetting streak:", resetError);
          return;
        }

        setStreak(resetStreak);

        // Award points for day 1
        const { error: pointsError } = await supabase.rpc(
          "increment_points_earned",
          {
            _user_id: user?.id,
            _points_to_add: rewards[0],
          }
        );

        if (pointsError) {
          console.error("Error incrementing points:", pointsError);
        } else {
          console.log("Points incremented successfully for day 1.");
          onUpdate();
        }

        console.log(
          "Streak reset due to inactivity and awarded points for day 1."
        );
        return;
      } else if (diffInHours < 24) {
        // If less than 24 hours since the last streak update, do nothing
        console.log("Streak cannot be updated yet; wait for 24 hours.");
        return;
      }
    }

    // If no streak has been started, initialize the first day and award points
    if (lastStreakDayIndex === 0) {
      const { data: newStreak, error: newStreakError } = await supabase
        .from("user_point_streak")
        .update({
          day1: today.toISOString(),
          reward_awarded: [true, false, false, false, false, false, false],
        })
        .eq("user_id", user?.id)
        .select()
        .single();

      if (newStreakError) {
        console.error("Error starting new streak:", newStreakError);
        return;
      }

      setStreak(newStreak);

      // Award points for day 1
      const { error: pointsError } = await supabase.rpc(
        "increment_points_earned",
        {
          _user_id: user?.id,
          _points_to_add: rewards[0],
        }
      );

      if (pointsError) {
        console.error("Error incrementing points:", pointsError);
      } else {
        console.log("Points incremented successfully for day 1.");
        onUpdate();
      }

      console.log("Started streak and awarded points for day 1.");
      return;
    } else if (lastStreakDate) {
      // Calculate the difference in days between today and the last streak date
      const diffInDays = Math.floor(
        (today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 1) {
        // Update the next day in the streak
        const updateData: any = {};
        const nextDayIndex = lastStreakDayIndex + 1;

        if (nextDayIndex <= 7) {
          updateData[`day${lastStreakDayIndex + 1}`] = today.toISOString();
          rewardAwarded[lastStreakDayIndex] = true; // Mark the reward as awarded for this day
          updateData["reward_awarded"] = rewardAwarded;

          const { data: updatedStreak, error: updateError } = await supabase
            .from("user_point_streak")
            .update(updateData)
            .eq("user_id", user?.id)
            .select()
            .single();

          if (updateError) {
            console.error("Error updating streak:", updateError);
            return;
          }

          setStreak(updatedStreak);

          // Award points for the current day
          const { error: pointsError } = await supabase.rpc(
            "increment_points_earned",
            {
              _user_id: user?.id,
              _points_to_add: rewards[lastStreakDayIndex],
            }
          );

          if (pointsError) {
            console.error("Error incrementing points:", pointsError);
          } else {
            console.log(
              `Points incremented successfully for day ${
                lastStreakDayIndex + 1
              }.`
            );
            onUpdate();
          }

          console.log(`Streak updated for day ${lastStreakDayIndex + 1}.`);
        } else {
          // Streak is complete, reset the streak and optionally award bonus points
          console.log("Streak completed!");

          // Optionally, award bonus points for completing the streak
          const bonusPoints = 10; // Define your bonus points
          const { error: bonusError } = await supabase.rpc(
            "increment_points_earned",
            {
              _user_id: user?.id,
              _points_to_add: bonusPoints,
            }
          );

          if (bonusError) {
            console.error("Error awarding bonus points:", bonusError);
          } else {
            console.log(
              `Bonus points (${bonusPoints}) awarded for completing the streak.`
            );
            onUpdate();
          }

          // Reset the streak
          const { data: resetStreak, error: resetError } = await supabase
            .from("user_point_streak")
            .update({
              day1: today.toISOString(),
              day2: null,
              day3: null,
              day4: null,
              day5: null,
              day6: null,
              day7: null,
              reward_awarded: [true, false, false, false, false, false, false],
            })
            .eq("user_id", user?.id)
            .select()
            .single();

          if (resetError) {
            console.error(
              "Error resetting streak after completion:",
              resetError
            );
            return;
          }

          setStreak(resetStreak);

          console.log("Streak reset after completion and bonus awarded.");
        }
      } else if (diffInDays > 1) {
        // Reset the streak due to missed days
        const { data: resetStreak, error: resetError } = await supabase
          .from("user_point_streak")
          .update({
            day1: today.toISOString(),
            day2: null,
            day3: null,
            day4: null,
            day5: null,
            day6: null,
            day7: null,
            reward_awarded: [true, false, false, false, false, false, false],
          })
          .eq("user_id", user?.id)
          .select()
          .single();

        if (resetError) {
          console.error(
            "Error resetting streak due to missed days:",
            resetError
          );
          return;
        }

        setStreak(resetStreak);

        // Award points for day 1
        const { error: pointsError } = await supabase.rpc(
          "increment_points_earned",
          {
            _user_id: user?.id,
            _points_to_add: rewards[0],
          }
        );

        if (pointsError) {
          console.error("Error incrementing points:", pointsError);
        } else {
          console.log("Points incremented successfully for day 1 after reset.");
          onUpdate();
        }

        console.log("Streak reset due to missed days.");
        return;
      }
    }
  }

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);
  useEffect(() => {
    if (user) {
      checkStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="m-auto flex">
      {streak != null ? (
        <ul className="steps steps-vertical lg:steps-horizontal gap-4 m-auto">
          {[...Array(7)].map((_, index) => (
            <li
              key={index}
              data-content={`+${rewards[index]}`}
              className={`step ${
                streak[`day${index + 1}`] ? "step-primary" : ""
              }`}
            >
              <p>
                {t("day")} {index + 1}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default StreakRewardSystem;
