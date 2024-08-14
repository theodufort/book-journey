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

const HeaderDashboard = () => {
  const [points, setPoints] = useState<number | null>(null);
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [dropDown, setDropDown] = useState<boolean>(false);
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
      <div className="mb-auto md:mt-auto">
        <div className="mr-5 hidden md:block">
          <button>How to earn points?</button>
        </div>
        <div className="bg-base-200 text-primary rounded-xl p-2 h-full mr-5">
          <Link href="/dashboard/reading-rewards">
            {user ? points : 0} points
          </Link>
        </div>
        <ButtonAccount />
      </div>
      <HowToEarnPointsPopup showDialog={true} onClose={function (): void {}} />
    </div>
  );
};

export default HeaderDashboard;
