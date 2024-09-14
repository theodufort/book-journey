// components/HeaderDashboard.tsx

import Link from "next/link";
import Image from "next/image";
import ButtonAccount from "@/components/ButtonAccount";
import config from "@/config";
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

      const { data: checkExistPoints, error } = await supabase
        .from("user_points")
        .select("points_earned, points_redeemed")
        .eq("user_id", user.id)
        .single();

      if (checkExistPoints == null) {
        await supabase
          .from("user_points")
          .insert({ user_id: user.id, points_earned: 0, points_redeemed: 0 });
      }

      const { data: checkExistStreak } = await supabase
        .from("user_point_streak")
        .select("*")
        .eq("id", user.id)
        .single();

      if (checkExistStreak == null) {
        await supabase.from("user_point_streak").insert({ id: user.id });
      }
      if (error) {
        console.error("Error fetching points:", error);
      } else {
        setPoints(
          checkExistPoints?.points_earned - checkExistPoints?.points_redeemed ||
            0
        );
      }
    };

    fetchPoints();
  }, [user, supabase]);
  return (
    <div className="flex justify-between items-center mb-8 space-x-4 navbar">
      <div className="drawer inline-block navbar-start max-w-min">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
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
          </label>
        </div>
        <div className="drawer-side" style={{ zIndex: 1000 }}>
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>

          <ul
            className={`menu bg-base-200 text-base-content min-h-full w-80 p-4 space-y-2 shadow-lg rounded-r-lg flex flex-col`}
          >
            <div className="flex">
              <li>
                <Link
                  className="flex items-center gap-2 shrink-0 p-2"
                  href="/"
                  title={`${config.appName} homepage`}
                >
                  <Image
                    src={"/logo.png"}
                    alt={`${config.appName} logo`}
                    className="w-8"
                    priority={true}
                    width={32}
                    height={32}
                  />
                  <span className="font-extrabold text-lg">
                    {config.appName}
                  </span>
                </Link>
              </li>
            </div>
            <div className="mb-auto">
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 p-2 align-middle"
                >
                  {/* Pointier Home Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3l8 8-1.5 1.5L18 11V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6H8v6a1 1 0 01-1 1H4a1 1 0 01-1-1V11L1.5 12.5 12 3z"
                    />
                  </svg>
                  Dashboard
                </Link>
              </li>

              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/reading-list"
                  className="flex items-center space-x-3 p-2 align-middle"
                >
                  {/* Bookmark Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v16l7-7 7 7V3z"
                    />
                  </svg>
                  Reading List
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/notes"
                  className="flex items-center space-x-3 p-2 align-middle"
                >
                  {/* Notebook Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7h18M3 7v13a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 5 9-5"
                    />
                  </svg>
                  Reading Notes
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/recommendations"
                  className="flex items-center space-x-3 p-2 align-middle"
                >
                  {/* Star Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3l2.09 6.26L21 9.27l-5 3.65 2 6.08L12 15.27l-6 3.65 2-6.08-5-3.65 6.91-1.01L12 3z"
                    />
                  </svg>
                  Reading Recommendations
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/reading-rewards"
                  className="flex items-center space-x-3 p-2 align-middle"
                >
                  {/* Trophy Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 4V2H8v2H5a1 1 0 00-1 1v3a5 5 0 004 4.9V14a5 5 0 004 4.9V20H9v2h6v-2h-3v-1.1a5 5 0 004-4.9v-1.1a5 5 0 004-4.9V5a1 1 0 00-1-1h-3z"
                    />
                  </svg>
                  Reading Rewards
                </Link>
              </li>
            </div>
            {/* Align these two items at the bottom */}
            <div
              className="space-x-2 flex mt-auto"
              style={{ marginTop: "auto" }}
            >
              <div className="flex mr-auto">
                <button
                  onClick={toggleTheme}
                  className="btn btn-circle btn-ghost"
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
              </div>
              <div
                className="bg-base-200 text-primary rounded-xl p-2 h-full flex items-center overflow-hidden"
                style={{ boxShadow: "0 0px 10px 0px #6366f1" }}
              >
                <Link
                  href="/dashboard/reading-rewards"
                  className="whitespace-nowrap overflow-hidden text-ellipsis mr-1"
                >
                  {points ? points : 0}
                </Link>
                <div className="flex-shrink-0">
                  <Image src={"/coin.png"} height={25} width={25} alt="coin" />
                </div>
              </div>
            </div>
          </ul>
        </div>
      </div>
      <div className="mb-auto md:mt-auto flex">
        {/* <div className="mr-5 hidden md:block">
          <button onClick={() => setShowHowToEarnPoints(true)}>
            How to earn points?
          </button>
        </div> */}

        <div className="">
          <ButtonAccount />
        </div>
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
