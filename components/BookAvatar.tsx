import { Volume } from "@/interfaces/GoogleAPI";
import { createAffLink } from "@/libs/amazon-aff";
import { Database } from "@/types/supabase";
import {
  createClientComponentClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Props {
  vol: Volume;
  isBlurred: boolean;
  allowAdd: boolean;
}

const BookAvatar = ({ vol, isBlurred, allowAdd }: Props) => {
  const t = useTranslations("BookAvatar");
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();
  }, [supabase]);
  const addToReadingList = async (book_isbn: string, status: string) => {
    const { error } = await supabase.from("reading_list").insert({
      user_id: user.id,
      book_id: book_isbn,
      status: status,
    });

    if (error) {
      setError("Failed to add book to reading list");
      console.error(error);
    } else {
      router.push("/dashboard/reading-list");
    }
  };
  // Truncate the description if it's too long and not expanded
  const MAX_LENGTH = 100;
  const description = (vol.volumeInfo.description || "Unknown")
    .replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<br>", "")
    .replaceAll("<br/>", "");
  const truncatedDescription =
    description.length > MAX_LENGTH
      ? description.substring(0, MAX_LENGTH) + "..."
      : description;
  return (
    <div
      className="relative h-full"
      key={
        vol.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      }
    >
      <div
        className={`card w-auto bg-base-200 shadow-xl h-full pt-5 ${
          isBlurred ? "blur-md" : ""
        }`}
      >
        <figure className="flex items-center justify-center h-64 m-auto">
          <img
            src={
              vol.volumeInfo.imageLinks?.thumbnail ||
              "https://mybookquest.com/default-book-cover.png"
            }
            alt="Book Thumbnail"
            className="max-h-full w-auto object-contain rounded-lg"
          />
        </figure>
        <div className="card-body items-center text-center">
          <h3 className="card-title">{vol.volumeInfo.title}</h3>
          {/* <h5>
            {" "}
            <div className="rating rating-md rating-half">
              <input type="radio" name="rating-10" className="rating-hidden" />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-1"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-2"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-1"
                checked
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-2"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-1"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-2"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-1"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-2"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-1"
              />
              <input
                type="radio"
                name="rating-10"
                className="bg-green-500 mask mask-star-2 mask-half-2"
              />
            </div>
          </h5> */}
          <h5>
            <b>{t("author_label")}:</b> {vol.volumeInfo.authors[0]}
          </h5>
          <h5>
            <b>{t("page_label")}:</b>{" "}
            {vol.volumeInfo.pageCount != 0
              ? vol.volumeInfo.pageCount
              : t("unknown_label")}
          </h5>
          <h5>
            <b>{t("categories_label")}: </b>
            <ul>
              {useMemo(() => {
                const allCategories = [
                  vol.volumeInfo.mainCategory,
                  ...(vol.volumeInfo.categories || []),
                ].filter(Boolean);
                const displayCategories = isCategoriesExpanded
                  ? allCategories
                  : allCategories.slice(0, 3);
                return displayCategories.map((category, index) => (
                  <li key={index}>{category}</li>
                ));
              }, [
                vol.volumeInfo.mainCategory,
                vol.volumeInfo.categories,
                isCategoriesExpanded,
              ])}
            </ul>
            {(vol.volumeInfo.mainCategory ? 1 : 0) +
              (vol.volumeInfo.categories?.length || 0) >
              3 && (
              <button
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className="text-blue-500 ml-2"
              >
                {isCategoriesExpanded ? t("view_less") : t("view_more")}
              </button>
            )}
          </h5>
          <h5>
            <b>{t("description_label")}: </b>
            {isExpanded ? description : truncatedDescription}
            {description.length > MAX_LENGTH && (
              <button
                onClick={handleToggleExpand}
                className="text-blue-500 ml-2"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </h5>
          <div className="flex gap-4">
            {/* <a
              href={createAffLink(
                vol.volumeInfo.industryIdentifiers?.find(
                  (id) => id.type === "ISBN_13"
                )?.identifier
              )}
              target="_blank"
            >
              <button className="btn btn-primary p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  color="yellow"
                  height={"100%"}
                  width={"100%"}
                >
                  <path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z" />
                </svg>
              </button>
            </a> */}
            {allowAdd ? (
              <div className="card-actions justify-end ml-auto">
                <select
                  className="select select-bordered"
                  onChange={(e) =>
                    addToReadingList(
                      vol.volumeInfo.industryIdentifiers?.find(
                        (id) => id.type === "ISBN_13"
                      )?.identifier,
                      e.target.value
                    )
                  }
                >
                  <option disabled selected>
                    {t("addtolist_label")}
                  </option>
                  <option value="To Read">{t("reading_status1")}</option>
                  <option value="Reading">{t("reading_status2")}</option>
                  <option value="Finished">{t("reading_status3")}</option>
                </select>
              </div>
            ) : null}
            <div className="dropdown dropdown-top dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-primary p-2">
                {t("view_sellers")}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
              >
                <li>
                  <a
                    href={`https://www.anrdoezrs.net/click-101259626-15734439?url=https://booksamillion.com/search2?query=${vol.volumeInfo.title}`}
                    target="_blank"
                  >
                    Books a Million
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.jdoqocy.com/click-101259626-15736645?url=https%3A%2F%2Fwww.2ndandcharles.com%2Fbook%2Fbrowse%2Fkeyword%2F${vol.volumeInfo.title}`}
                    target="_blank"
                  >
                    2ND and Charles
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.tkqlhce.com/click-101259626-15734795?url=https%3A%2F%2Fwww.barnesandnoble.com%2Fb%2F${vol.volumeInfo.title}%2F_%2FN-1p38`}
                    target="_blank"
                  >
                    Barnes and Nobles
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.tkqlhce.com/click-101259626-15733690?url=https%3A%2F%2Fwww.audiobooks.com%2Fsearch%2Fbook%2F${vol.volumeInfo.title}`}
                    target="_blank"
                  >
                    Audiobooks.com
                  </a>
                </li>
                <li>
                  <a href={createAffLink(vol.volumeInfo.title)} target="_blank">
                    Amazon
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isBlurred && (
        <Link href={"/signin"} target="_blank">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="h-12 w-12 text-white mb-2"
            >
              <path d="M400 224h-24v-72C376 68.5 307.5 0 224 0S72 68.5 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zM224 32c66.2 0 120 53.8 120 120v72H104v-72C104 85.8 157.8 32 224 32zm152 400c0 8.8-7.2 16-16 16H88c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16h272c8.8 0 16 7.2 16 16v160z" />
            </svg>
            <h4 className="text-black text-xl">{t("signup_cta")}</h4>
          </div>
        </Link>
      )}
    </div>
  );
};

export default BookAvatar;
