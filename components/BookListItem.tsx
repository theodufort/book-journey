import { useBookDetails } from "@/hooks/useBookDetails";
import { useState, useEffect } from "react";
import CongratulationsModal from "./CongratulationsModal";
import { User } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Volume } from "@/interfaces/GoogleAPI";
export default function BookListItem({
  status,
  item,
  onUpdate,
}: {
  item: Volume;
  status: string;
  onUpdate: () => void;
}) {
  const supabase = createClientComponentClient<Database>();
  const { book, loading, error } = useBookDetails(
    item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
      ?.identifier
  );
  const [showModal, setShowModal] = useState(false);
  const [messageType, setMessageType] = useState("begin");
  const [newStatus, setNewStatus] = useState(status);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState(0);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };
    getUser();
  }, [supabase]);
  async function awardPoints(points: number, description: string) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { data, error } = await supabase.from("point_transactions").insert({
      user_id: user.id,
      points,
      type: "earned",
      description,
    });

    if (error) {
      console.error("Error awarding points:", error);
    }
  }
  useEffect(() => {
    // Fetch the current rating when the component mounts and user is available
    if (user) {
      fetchRating();
    }
  }, [item.id, user]);

  async function fetchRating() {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { data, error } = await supabase
      .from("reading_list")
      .select("rating")
      .eq("user_id", user.id)
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") {
        // No rating found for this book, set rating to 0
        setRating(0);
      } else {
        console.error("Error fetching rating:", error);
      }
    } else {
      setRating(data?.rating || 0);
    }
  }

  if (loading)
    return (
      <div className="text-center">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  if (error)
    return (
      <div className="text-center text-error">Error loading book details</div>
    );
  if (!book) return null;

  async function updateBookStatus(ns: string, book_page_count: number) {
    setNewStatus(ns);
    if (status === "To Read" && ns === "Reading") {
      setMessageType("begin");
      setShowModal(true);
      setPendingUpdate(true);
    } else if (
      (status === "Reading" || status === "To Read") &&
      ns === "Finished"
    ) {
      setMessageType("end");
      setShowModal(true);
      setPendingUpdate(true);
      //Add number of pages and time spent
      calculateUserStats(book_page_count);
    } else {
      await performUpdate(ns, book_page_count);
    }
  }
  async function calculateUserStats(book_page_count: number) {
    const { data, error } = await supabase.rpc("update_reading_stats", {
      p_user_id: user.id,
      p_books_read: 1,
      p_pages_read: book_page_count,
      p_reading_time_minutes:
        book_page_count / Math.round(Number(process.env.AVERAGE_READ_SPEED)), // Assuming 2 pages per minute on average
    });

    if (error) {
      console.error("Error updating reading stats:", error);
    }
  }
  async function performUpdate(
    status: string = newStatus,
    book_page_count: number
  ) {
    console.log(status);
    const { error } = await supabase
      .from("reading_list")
      .update({ status, rating })
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user?.id);
    if (status === "Finished") {
      awardPoints(100, `Finished reading ${book.title}`);
    }

    if (error) {
      console.error("Error updating book status:", error);
    } else {
      onUpdate();
    }
  }

  async function updateRating(newRating: number) {
    setRating(newRating);
    const { error } = await supabase
      .from("reading_list")
      .update({ rating: newRating })
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user?.id);
    console.log(error);
    if (error) {
      console.error("Error updating rating:", error);
    } else {
      onUpdate();
    }
  }

  async function removeBook() {
    const { error } = await supabase
      .from("reading_list")
      .delete()
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user?.id);

    if (error) console.error("Error removing book:", error);
    else onUpdate();
  }

  function handleModalClose() {
    setShowModal(false);
    if (pendingUpdate) {
      performUpdate();
      setPendingUpdate(false);
    }
  }

  const renderRatingInput = () => (
    <div className="rating rating-md rating-half inline-block my-2">
      <label>
        <b>Your Rating:</b>{" "}
      </label>
      <input
        type="radio"
        name={`rating-${item.id}`}
        className="rating-hidden"
        checked={rating === 0}
        onChange={() => updateRating(0)}
      />
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
        <input
          key={star}
          type="radio"
          name={`rating-${item.id}`}
          className={`mask mask-star-2 ${
            star % 1 === 0 ? "mask-half-2" : "mask-half-1"
          } bg-orange-400`}
          checked={rating === star}
          onChange={() => updateRating(star)}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure className="p-4">
          <img
            src={book.imageLinks?.thumbnail || "/placeholder-book-cover.jpg"}
            alt={book.title || "Book cover"}
            className="rounded-lg"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{book.title || "Untitled"}</h2>
          <p>
            <b>Author:</b> {book.authors || "Unknown"}
          </p>
          <p>
            <b>Page Count:</b> {book.pageCount || "Unknown"}
          </p>
          <p>
            <b>Description:</b>{" "}
            {book.description
              ? `${book.description.substring(0, 200)}...`
              : "No description available"}
          </p>
          <div className="card-actions justify-end my-auto inline-block">
            <div>
              <label>
                <b>Status:</b>{" "}
              </label>
              <select
                value={status}
                onChange={(e) =>
                  updateBookStatus(e.target.value, book.pageCount)
                }
                className="select select-bordered w-auto max-w-xs"
              >
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
            {status === "Finished" && renderRatingInput()}
            <button className="btn btn-primary float-end" onClick={removeBook}>
              Remove
            </button>
          </div>
        </div>
      </div>
      <CongratulationsModal
        isOpen={showModal}
        onClose={handleModalClose}
        messageType={messageType}
        bookTitle={book?.title || "Untitled"}
      />
    </>
  );
}
