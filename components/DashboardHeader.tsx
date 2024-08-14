// components/HeaderDashboard.tsx

import Link from "next/link";
import ButtonAccount from "@/components/ButtonAccount";
import { useEffect, useState } from "react";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { HowToEarnPointsPopup } from "./HowToEarnPointsPopup";
import { useTheme } from "next-themes";

const HeaderDashboard = () => {
  const [points, setPoints] = useState<number | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [showHowToEarnPoints, setShowHowToEarnPoints] =
    useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    console.log("Current theme:", theme);
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("Switching to:", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    console.log("Theme changed to:", theme);
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.setAttribute("data-theme", theme || "light");
    }
  }, [theme]);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, [supabase]);
  useEffect(() => {
    const fetchPoints = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_points")
        .select("points_earned, points_redeemed")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching points:", error);
      } else {
        setPoints(data?.points_earned - data?.points_redeemed || 0);
      }
    };

    fetchPoints();
  }, [user, supabase]);
  return (
    <div className="flex justify-between items-center mb-8 space-x-4 navbar">
      <div className="inline-block navbar-start">
        <div className="dropdown">
          <div
            role="button"
            className="btn btn-ghost lg:hidden bg-base-200"
            onClick={() => setDropDown(!dropDown)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            className={`menu menu-sm bg-base-200 rounded-box z-[1] mt-3 w-auto p-2 shadow absolute ${
              dropDown ? "block" : "hidden"
            }`}
          >
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/dashboard/reading-list">Reading List</Link>
            </li>
            <li>
              <Link href="/dashboard/recommendations">
                Reading Recommendations
              </Link>
            </li>
            <li>
              <Link href="/dashboard/reading-rewards">Reading Rewards</Link>
            </li>
            <li>
              <Link href="/dashboard/profile">Profile</Link>
            </li>
          </ul>
        </div>{" "}
        <div className="card navbar-center hidden md:flex bg-base-200 ">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/dashboard/reading-list">Reading List</Link>
            </li>
            <li>
              <Link href="/dashboard/recommendations">
                Reading Recommendations
              </Link>
            </li>
            <li>
              <Link href="/dashboard/reading-rewards">Reading Rewards</Link>
            </li>
            <li>
              <Link href="/dashboard/profile">Profile</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mb-auto md:mt-auto flex items-center">
        <div className="mr-5 hidden md:block">
          <button onClick={() => setShowHowToEarnPoints(true)}>
            How to earn points?
          </button>
        </div>
        <div className="bg-base-200 text-primary rounded-xl p-2 h-full mr-5">
          <Link href="/dashboard/reading-rewards">
            {user ? points : 0} points
          </Link>
        </div>
        <button
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost mr-5"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          )}
        </button>
        <ButtonAccount />
      </div>
      <HowToEarnPointsPopup
        showDialog={showHowToEarnPoints}
        onClose={function (): void {
          setShowHowToEarnPoints(false);
        }}
      />
    </div>
  );
};

export default HeaderDashboard;
