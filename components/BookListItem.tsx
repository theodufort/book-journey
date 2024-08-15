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
  const [review, setReview] = useState("");
  // Truncate the description if it's too long and not expanded
  const MAX_LENGTH = 100;
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const supabase = createClientComponentClient<Database>();
  const book = item.volumeInfo;
  const loading = false;
  const error: any = null;
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
  async function awardPoints(points: number, type: string) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const {
      data: {
        pointsAwardedFinished,
        pointsAwardedRating,
        pointsAwardedTextReview,
      },
    } = await supabase
      .from("reading_list")
      .select(
        "pointsAwardedFinished, pointsAwardedRating, pointsAwardedTextReview"
      )
      .eq("user_id", user.id)
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .single();
    switch (type) {
      case "pointsAwardedFinished": {
        // const { data, error } = await supabase.from("point_transactions").insert({
        //   user_id: user.id,
        //   points,
        //   type: "earned",
        //   description,
        // });
        //Prevent abuse of rewards
        await supabase
          .from("reading_list")
          .update({
            pointsAwardedFinished: true,
          })
          .eq("user_id", user.id)
          .eq(
            "book_id",
            item.volumeInfo.industryIdentifiers?.find(
              (id) => id.type === "ISBN_13"
            )?.identifier
          );
        if (error) {
          console.error("Error awarding points:", error);
        }
        const { data: dataUpdatePoints, error: errorUpdatePoints } =
          await supabase.rpc("increment_points_earned", {
            _user_id: user.id,
            _points_to_add: points,
          });

        if (error) {
          console.error("Error incrementing points:", errorUpdatePoints);
        } else {
          console.log("Points incremented successfully:", dataUpdatePoints);
        }
      }
      case "pointsAwardedRating": {
        // const { data, error } = await supabase.from("point_transactions").insert({
        //   user_id: user.id,
        //   points,
        //   type: "earned",
        //   description,
        // });
        //Prevent abuse of rewards
        await supabase
          .from("reading_list")
          .update({
            pointsAwardedRating: true,
          })
          .eq("user_id", user.id)
          .eq(
            "book_id",
            item.volumeInfo.industryIdentifiers?.find(
              (id) => id.type === "ISBN_13"
            )?.identifier
          );
        if (error) {
          console.error("Error awarding points:", error);
        }
        const { data: dataUpdatePoints, error: errorUpdatePoints } =
          await supabase.rpc("increment_points_earned", {
            _user_id: user.id,
            _points_to_add: points,
          });

        if (error) {
          console.error("Error incrementing points:", errorUpdatePoints);
        } else {
          console.log("Points incremented successfully:", dataUpdatePoints);
        }
      }
      case "pointsAwardedTextReview": {
        // const { data, error } = await supabase.from("point_transactions").insert({
        //   user_id: user.id,
        //   points,
        //   type: "earned",
        //   description,
        // });
        //Prevent abuse of rewards
        await supabase
          .from("reading_list")
          .update({
            pointsAwardedTextReview: true,
          })
          .eq("user_id", user.id)
          .eq(
            "book_id",
            item.volumeInfo.industryIdentifiers?.find(
              (id) => id.type === "ISBN_13"
            )?.identifier
          );
        if (error) {
          console.error("Error awarding points:", error);
        }
        const { data: dataUpdatePoints, error: errorUpdatePoints } =
          await supabase.rpc("increment_points_earned", {
            _user_id: user.id,
            _points_to_add: points,
          });

        if (error) {
          console.error("Error incrementing points:", errorUpdatePoints);
        } else {
          console.log("Points incremented successfully:", dataUpdatePoints);
        }
      }
    }
  }
  useEffect(() => {
    // Fetch the current rating when the component mounts and user is available
    if (user) {
      fetchRating();
    }
  }, [item.id, user]);
  useEffect(() => {
    if (user && status === "Finished") {
      fetchReview();
    }
  }, [user, status]);

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
      calculateUserStats(book_page_count, 1);
      await performUpdate(ns, book_page_count);
    } else if (
      (status === "Reading" || status === "To Read") &&
      ns === "Finished"
    ) {
      setMessageType("end");
      setShowModal(true);
      setPendingUpdate(true);
      //Add number of pages and time spent
      calculateUserStats(book_page_count, 1);
      await performUpdate(ns, book_page_count);
    } else if (ns != "Finished") {
      //Substract number of pages and time spent
      calculateUserStats(book_page_count, -1);
      await performUpdate(ns, book_page_count);
      onUpdate(); // Call onUpdate immediately after updating the status
    } else {
      calculateUserStats(book_page_count, 1);
      await performUpdate(ns, book_page_count);
      setPendingUpdate(true);
    }
  }
  async function calculateUserStats(book_page_count: number, opp: number) {
    const { data, error } = await supabase.rpc("update_reading_stats", {
      p_user_id: user.id,
      p_books_read: opp,
      p_pages_read: book_page_count * opp,
      p_reading_time_minutes:
        (book_page_count / Math.round(Number(process.env.AVERAGE_READ_SPEED))) *
        opp, // Assuming 2 pages per minute on average
    });
    if (error) {
      console.error("Error updating reading stats:", error);
    }
  }
  async function performUpdate(
    status: string = newStatus,
    book_page_count: number
  ) {
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
      awardPoints(100, "pointsAwardedFinished");
    }

    if (error) {
      console.error("Error updating book status:", error);
    }
  }

  async function updateRating(newRating: number) {
    setRating(newRating);
    const { data, error } = await supabase
      .from("reading_list")
      .update({ rating: newRating })
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user?.id)
      .select("pointsAwardedRating")
      .single();

    if (error) {
      console.error("Error updating rating:", error);
    } else if (!data.pointsAwardedRating) {
      await awardPoints(25, "pointsAwardedRating");
      await supabase
        .from("reading_list")
        .update({ pointsAwardedRating: true })
        .eq(
          "book_id",
          item.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13"
          )?.identifier
        )
        .eq("user_id", user?.id);
    }
  }

  async function updateReview(reviewContent: string) {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    const { data, error } = await supabase
      .from("reading_list")
      .update({ review: reviewContent })
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user.id)
      .select("pointsAwardedTextReview")
      .single();

    if (error) {
      console.error("Error updating review:", error);
    } else if (
      !data.pointsAwardedTextReview &&
      reviewContent.trim().length > 0
    ) {
      await awardPoints(50, "pointsAwardedTextReview");
      await supabase
        .from("reading_list")
        .update({ pointsAwardedTextReview: true })
        .eq(
          "book_id",
          item.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13"
          )?.identifier
        )
        .eq("user_id", user.id);
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
    onUpdate();
    if (pendingUpdate) {
      setPendingUpdate(false);
    }
  }

  const renderRatingInput = () => (
    <div className="rating rating-md rating-half inline-block my-2">
      <label>
        <b>Your Rating (+50 points):</b>{" "}
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

  async function fetchReview() {
    if (!user) return;
    const { data, error } = await supabase
      .from("reading_list")
      .select("review")
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user.id)
      .single();
    if (error) {
      console.error("Error fetching review:", error);
    } else {
      setReview(data?.review || "");
    }
  }

  const renderReviewInput = () => {
    if (status === "Finished") {
      return (
        <div className="mt-4">
          <label htmlFor="review" className="block font-bold mb-2">
            Your Review (+50 points):
          </label>
          <textarea
            id="review"
            className="textarea textarea-bordered w-full"
            rows={4}
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
              updateReview(e.target.value);
            }}
          ></textarea>
        </div>
      );
    }
    return null;
  };
  const description = book.description || "";
  const truncatedDescription =
    description.length > MAX_LENGTH
      ? description.substring(0, MAX_LENGTH) + "..."
      : description;
  return (
    <>
      <div className="card md:card-side bg-base-100 shadow-xl">
        <figure className="p-10 md:w-1/4">
          <img
            src={book.imageLinks?.thumbnail || "/placeholder-book-cover.jpg"}
            alt={book.title || "Book cover"}
            className="rounded-lg md:w-full object-cover"
          />
        </figure>
        <div className="card-body md:w-2/3">
          <h2 className="card-title">{book.title || "Untitled"}</h2>
          <p>
            <b>Author:</b> {book.authors?.join(", ") || "Unknown"}
          </p>
          <p>
            <b>Page Count:</b> {book.pageCount || "Unknown"}
          </p>
          <div className="description-container">
            <b>Description:</b>{" "}
            <div className="description-text text-justify">
              {isExpanded ? description : truncatedDescription}
              {description && description.length > MAX_LENGTH && (
                <button
                  onClick={handleToggleExpand}
                  className="text-blue-500 ml-2"
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              )}
              {!description && "No description available"}
            </div>
          </div>
          <div className="grid grid-cols-1 card-actions justify-start mt-4">
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
            {status === "Finished" && (
              <>
                {renderRatingInput()}
                {renderReviewInput()}
              </>
            )}
            <button
              className="btn btn-primary md:ml-auto my-5 flex"
              onClick={removeBook}
            >
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
