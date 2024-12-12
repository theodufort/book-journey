"use client";

import logo from "@/app/icon.png";
import config from "@/config";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonTheme } from "./ButtonTheme";
import { getUser } from "@/libs/supabase/queries";

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const AdminHeader = () => {
  const t = useTranslations("Header");
  const DashboardButton = () => (
    <Link href="/dashboard" className="btn btn-primary">
      {t("cta_btn")}
    </Link>
  );
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="bg-base-200">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          {" "}
          {/* <LocaleSwitcher /> */}
          {/*<ButtonTheme />*/}
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <ul className="menu md:menu-horizontal bg-base-200 rounded-box">
          <li>
            <details>
              <summary>
                <Link href={"/admin/indie-authors"}>Indie Authors</Link>
              </summary>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <Link href={"/admin/indie-books"}>Indie Books</Link>
              </summary>
              <ul>
                <li>
                  <Link href={"/admin/indie-books/review"}>Review</Link>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>
                <Link href={"/admin/books"}>Books Modifications</Link>
              </summary>
              <ul>
                <li>
                  <Link href={"/admin/books/review"}>Review</Link>
                </li>
              </ul>
            </details>
          </li>
        </ul>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">
          {" "}
          //
          {/*<ButtonTheme />*/}
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state and user authentication */}
      {!user && (
        <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
          <div
            className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
          >
            {/* Your logo/name on small screens */}
            <div className="flex items-center justify-between">
              <Link
                className="flex items-center gap-2 shrink-0 "
                title={`${config.appName} homepage`}
                href="/"
              >
                <Image
                  src={logo}
                  alt={`${config.appName} logo`}
                  className="w-8"
                  placeholder="blur"
                  priority={true}
                  width={32}
                  height={32}
                />
                <span className="font-extrabold text-lg">{config.appName}</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close menu</span>
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
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
