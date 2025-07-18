import { ReadingListItem } from "@/interfaces/ReadingList";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import BookListItem from "./BookListItem";
import { getUser } from "@/libs/supabase/queries";

export default function CollapsibleSection({
  status,
  title,
  isExpanded,
  onToggle,
  books,
  onUpdate,
  setReadingList,
  currentPage,
  onPageChange,
  itemsPerPage,
}: {
  status: string;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  books: ReadingListItem[];
  onUpdate: (bookId: string, newStatus: string) => void;
  setReadingList: React.Dispatch<React.SetStateAction<ReadingListItem[]>>;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  itemsPerPage: number;
}) {
  const t = useTranslations("CollapsibleSection");
  const [bookTags, setBookTags] = useState<{ [key: string]: string[] }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      fetchAllTags();
    }
  }, [user, books]);

  if (books.length === 0) return null;

  async function fetchAllTags() {
    for (const book of books) {
      await fetchTags(book);
    }
  }

  async function fetchTags(book: ReadingListItem) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { data, error } = await supabase
      .from("reading_list")
      .select("tags")
      .eq("user_id", user.id)
      .eq("book_id", book.book_id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tags:", error);
    } else {
      setBookTags((prevTags) => ({
        ...prevTags,
        [book.book_id]: data?.tags || [],
      }));
    }
  }

  async function updateTags(book: ReadingListItem, newTags: string[]) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { error } = await supabase
      .from("reading_list")
      .update({ tags: newTags })
      .eq("user_id", user.id)
      .eq("book_id", book.book_id);

    if (error) {
      console.error("Error updating tags:", error);
    } else {
      setBookTags((prevTags) => ({
        ...prevTags,
        [book.book_id]: newTags,
      }));
    }
  }

  function handleAddTag(book: ReadingListItem, tagToAdd: string) {
    if (tagToAdd.trim() && !bookTags[book.book_id]?.includes(tagToAdd.trim())) {
      const updatedTags = [...(bookTags[book.book_id] || []), tagToAdd.trim()];
      updateTags(book, updatedTags);
    }
  }

  function handleRemoveTag(book: ReadingListItem, tagToRemove: string) {
    const updatedTags =
      bookTags[book.book_id]?.filter((tag) => tag !== tagToRemove) || [];
    updateTags(book, updatedTags);
  }

  const filterBooks = (books: ReadingListItem[]) => {
    return books.filter((item) => {
      if (item.status !== status) {
        return false;
      }
      const lowerSearchTerm = searchTerm.toLowerCase();
      switch (searchType) {
        case "title":
          return item.data.volumeInfo.title
            .toLowerCase()
            .includes(lowerSearchTerm);
        case "author":
          return (
            item.data.volumeInfo.authors?.some((author) =>
              author.toLowerCase().includes(lowerSearchTerm)
            ) || false
          );
        case "tag":
          const tags = bookTags[item.book_id] || [];
          return tags.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm)
          );
        default:
          return true;
      }
    });
  };

  // Filtered books after applying search
  const filteredBooks = filterBooks(books);

  // Since we are now fetching page-wise from the parent, `filteredBooks` should already represent the current page's data.
  // However, if you still want local pagination on top of server fetch, you can apply slicing here.
  // For simplicity, assume `filteredBooks` is the data for the current page already fetched from the parent.

  const totalItems = filteredBooks.length;
  // If we knew total count of items on the server, we would keep track of total pages separately.
  // For demo, let's assume total count is unknown and we rely on parent to fetch next pages.

  return (
    <div
      className={`collapse  ${
        isExpanded ? "collapse-open" : "collapse-close"
      } bg-base-200 mx-0`}
    >
      <div
        className="collapse-title pr-[16px] text-xl font-medium flex flex-col md:flex-row items-start md:items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center w-full">
          <div className="mr-2">{title}</div>
          <div className="ml-auto md:ml-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          className="grid md:grid-rows-1 md:grid-cols-2 md:mt-0 mt-4 grid-rows-2 grid-cols-1 w-full gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="input input-bordered flex items-center gap-2 flex-grow">
            <input
              type="text"
              className="grow"
              placeholder={t("filter_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <select
            className="select select-bordered "
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="title">{t("filter_choice1")}</option>
            <option value="author">{t("filter_choice2")}</option>
            <option value="tag">{t("filter_choice3")}</option>
          </select>
        </div>
      </div>
      <div className="collapse-content sm:px-4">
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              {filteredBooks.map((item) => (
                <BookListItem
                  key={item.book_id}
                  status={status}
                  item={item.data}
                  onUpdate={() => onUpdate(item.book_id, status)}
                  tags={bookTags[item.book_id] || []}
                  onAddTag={(tag) => handleAddTag(item, tag)}
                  onRemoveTag={(tag) => handleRemoveTag(item, tag)}
                />
              ))}

              {/* Pagination Controls */}
              {/* Assuming we know there's potentially more pages. 
                  If we must know total pages, we need total count from the server. */}
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  disabled={currentPage === 1}
                >
                  {t("previous")}
                </button>
                <span className="flex items-center">
                  {t("page")} {currentPage}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    // Assuming next page will fetch new items
                    onPageChange(currentPage + 1);
                  }}
                >
                  {t("next")}
                </button>
              </div>
            </>
          ) : (
            <p className="col-span-full">{t("no_books_found")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
