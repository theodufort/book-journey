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
        <div className="card-body items-center text-center flex flex-col h-full">
          <h3 className="card-title">{vol.volumeInfo.title}</h3>
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
          <div className="mt-auto w-full">
            <div className="flex gap-4 justify-center">
              {allowAdd && (
                <div className="card-actions">
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
              )}
              <div className="dropdown dropdown-top">
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
                    <a
                      href={createAffLink(vol.volumeInfo.title)}
                      target="_blank"
                    >
                      Amazon
                    </a>
                  </li>
                </ul>
              </div>
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
