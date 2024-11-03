import { ReadingListItem } from "@/interfaces/ReadingList";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import BookListItem from "./BookListItem";

export default function CollapsibleSection({
  status,
  title,
  isExpanded,
  onToggle,
  books,
  onUpdate,
}: {
  status: string;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  books: ReadingListItem[];
  onUpdate: (bookId: string, newStatus: string) => void;
}) {
  const t = useTranslations("CollapsibleSection");
  const [bookTags, setBookTags] = useState<{ [key: string]: string[] }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title"); 
  const [currentPage, setCurrentPage] = useState(1);
  const [newTag, setNewTag] = useState("");
  const ITEMS_PER_PAGE = 5;
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
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
      .eq(
        "book_id",
        book.data.volumeInfo.industryIdentifiers?.find(
          (id) => id.type === "ISBN_13"
        )?.identifier
      )
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
      .eq(
        "book_id",
        book.data.volumeInfo.industryIdentifiers?.find(
          (id) => id.type === "ISBN_13"
        )?.identifier
      );

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
          return tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm));
        default:
          return true;
      }
    });
  };

  const filteredBooks = filterBooks(books);
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div
      className={`collapse  ${
        isExpanded ? "collapse-open" : "collapse-close"
      } bg-base-200 mx-0`}
    >
      <div
        className="collapse-title text-xl font-medium flex flex-col md:flex-row items-start md:items-center cursor-pointer"
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
          <label className="input input-bordered flex items-center gap-2 flex-grow ">
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
          {paginatedBooks.length > 0 ? (
            <>
              {paginatedBooks.map((item) => (
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
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {t("previous")}
                  </button>
                  <span className="flex items-center">
                    {t("page")} {currentPage} {t("of")} {totalPages}
                  </span>
                  <button
                    className="btn btn-sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="col-span-full">{t("no_books_found")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
