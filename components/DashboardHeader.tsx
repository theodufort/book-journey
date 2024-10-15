// components/HeaderDashboard.tsx

import ButtonAccount from "@/components/ButtonAccount";
import config from "@/config";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HowToEarnPointsPopup } from "./HowToEarnPointsPopup";
import ReferralLinkCard from "./ReferralLinkCard";

const HeaderDashboard = () => {
  const t = useTranslations("HeaderDashboard");
  const [points, setPoints] = useState<number | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [showHowToEarnPoints, setShowHowToEarnPoints] =
    useState<boolean>(false);
  const [dropDown, setDropDown] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
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
        .select("points_earned, points_redeemed,points_earned_referrals")
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
        .eq("user_id", user.id)
        .single();

      if (checkExistStreak == null) {
        await supabase.from("user_point_streak").insert({ user_id: user.id });
      }
      if (error) {
        console.error("Error fetching points:", error);
      } else {
        setPoints(
          checkExistPoints?.points_earned +
            checkExistPoints?.points_earned_referrals -
            checkExistPoints?.points_redeemed || 0
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
            className={`menu bg-base-200 text-base-content min-h-full w-80 p-4 shadow-lg rounded-r-lg flex flex-col`}
          >
            <div className="flex justify-between items-center w-full">
              {/* Header part with app logo and points */}
              <li>
                <Link
                  className="flex items-center gap-2 shrink-0 p-2"
                  href="/"
                  title={`${config.appName} homepage`}
                >
                  <span className="font-extrabold text-lg">
                    {config.appName}
                  </span>
                  <Image
                    src={"/logo.png"}
                    alt={`${config.appName} logo`}
                    className="w-8"
                    priority={true}
                    width={32}
                    height={32}
                  />
                </Link>
              </li>
              <li>
                <div
                  className="bg-base-200 text-primary rounded-xl p-2 flex items-center overflow-hidden"
                  style={{ boxShadow: "0 0px 10px 0px #6366f1" }}
                >
                  <Link
                    href="/dashboard/reading-rewards"
                    className="whitespace-nowrap overflow-hidden text-ellipsis mr-1"
                  >
                    {points ? points : 0}
                  </Link>
                  <div className="flex-shrink-0">
                    <Image
                      src={"/coin.png"}
                      height={25}
                      width={25}
                      alt="coin"
                    />
                  </div>
                </div>
              </li>
            </div>

            {/* Links list */}
            <div className="mb-auto">
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  📊 {t("link1")}
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/reading-list"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  📚 {t("link2")}
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/notes"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  ✍️ {t("link3")}
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/recommendations"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  🔮 {t("link4")}
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/reading-rewards"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  🏆 {t("link5")}
                </Link>
              </li>
              <li className="hover:bg-base-300 rounded-lg transition-colors duration-200">
                <Link
                  href="/dashboard/support"
                  className="flex items-center space-x-3 p-2 align-middle text-lg"
                >
                  🙋‍♂️ {t("link6")}
                </Link>
              </li>
            </div>

            {/* Footer with referral link and buttons */}
            <div className="mt-auto flex flex-col space-y-4">
              <div className="flex justify-between items-center">
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
                <label
                  htmlFor="my-drawer"
                  className="btn btn-circle btn-ghost drawer-button"
                  aria-label="Close drawer"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </label>
              </div>
              <ReferralLinkCard />
            </div>
          </ul>
        </div>
      </div>
      <div>
        <Link
          className="flex items-center gap-2 shrink-0 md:ml-12"
          href="/"
          title={`${config.appName} homepage`}
        >
          {" "}
          <span className="font-extrabold text-lg hidden md:block">
            {config.appName}
          </span>{" "}
          <Image
            src={"/logo.png"}
            alt={`${config.appName} logo`}
            className="h-full"
            priority={true}
            width={32}
            height={32}
          />
        </Link>
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
