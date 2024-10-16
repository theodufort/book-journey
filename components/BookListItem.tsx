import { Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import BookSharebutton from "./BookShareButton";
import CongratulationsModal from "./CongratulationsModal";
import ViewSellers from "./ViewSellers";
export default function BookListItem({
  status,
  item,
  onUpdate,
  tags,
  onAddTag,
  onRemoveTag,
}: {
  item: Volume;
  status: string;
  onUpdate: () => void;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const t = useTranslations("BookListItem");
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
  const [newTag, setNewTag] = useState("");
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
    // const {data}
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
        if (!pointsAwardedFinished) {
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

          const { data: dataUpdatePoints, error: errorUpdatePoints } =
            await supabase.rpc("increment_points_earned", {
              _user_id: user.id,
              _points_to_add: points,
            });

          if (errorUpdatePoints) {
            console.error("Error incrementing points:", errorUpdatePoints);
          } else {
            console.log("Points incremented successfully:", dataUpdatePoints);
          }
        }
        break;
      }
      case "pointsAwardedRating": {
        // const { data, error } = await supabase.from("point_transactions").insert({
        //   user_id: user.id,
        //   points,
        //   type: "earned",
        //   description,
        // });
        if (!pointsAwardedRating) {
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

          const { data: dataUpdatePoints, error: errorUpdatePoints } =
            await supabase.rpc("increment_points_earned", {
              _user_id: user.id,
              _points_to_add: points,
            });

          if (errorUpdatePoints) {
            console.error("Error incrementing points:", errorUpdatePoints);
          } else {
            console.log("Points incremented successfully:", dataUpdatePoints);
          }
        }
        break;
      }
      case "pointsAwardedTextReview": {
        // const { data, error } = await supabase.from("point_transactions").insert({
        //   user_id: user.id,
        //   points,
        //   type: "earned",
        //   description,
        // });
        if (!pointsAwardedTextReview) {
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

          const { data: dataUpdatePoints, error: errorUpdatePoints } =
            await supabase.rpc("increment_points_earned", {
              _user_id: user.id,
              _points_to_add: points,
            });

          if (errorUpdatePoints) {
            console.error("Error incrementing points:", errorUpdatePoints);
          } else {
            console.log("Points incremented successfully:", dataUpdatePoints);
          }
        }
        break;
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
      <div className="text-center text-error">{t("error_loading_book")}</div>
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
    <div className="rating rating-md rating-half inline-block ">
      <label>
        <b>
          {t("rating_label")} (+25{" "}
          <Image
            className="inline-flex"
            src={"/coin.png"}
            height={15}
            width={15}
            alt="coin"
          />
          ):
        </b>{" "}
      </label>
      <div className="flex mt-2">
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

  const [isReviewPublic, setIsReviewPublic] = useState(false);

  useEffect(() => {
    if (user && status === "Finished") {
      fetchReviewPublicStatus();
    }
  }, [user, status]);

  async function fetchReviewPublicStatus() {
    if (!user) return;
    const { data, error }: any = await supabase
      .from("reading_list")
      .select("reviewPublic")
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user.id)
      .single();
    if (error) {
      console.error("Error fetching review public status:", error);
    } else {
      setIsReviewPublic(data?.reviewPublic || false);
    }
  }

  async function updateReviewPublicStatus(isPublic: boolean) {
    if (!user) return;
    const { error } = await supabase
      .from("reading_list")
      .update({ reviewPublic: isPublic })
      .eq(
        "book_id",
        item.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
      .eq("user_id", user.id);
    if (error) {
      console.error("Error updating review public status:", error);
    } else {
      setIsReviewPublic(isPublic);
    }
  }

  const renderReviewInput = () => {
    if (status === "Finished") {
      return (
        <div>
          <label htmlFor="review" className="mb-4">
            <b>
              {t("review_label")} (+50{" "}
              <Image
                className="inline-flex"
                src={"/coin.png"}
                height={15}
                width={15}
                alt="coin"
              />
              ):
            </b>
          </label>
          <textarea
            id="review"
            className="textarea textarea-bordered w-full h-auto mt-2"
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
              updateReview(e.target.value);
            }}
          ></textarea>
          <div className="mt-2">
            <label className="cursor-pointer label">
              <span className="label-text">{t("make_review_public")}</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isReviewPublic}
                onChange={(e) => updateReviewPublicStatus(e.target.checked)}
              />
            </label>
          </div>
        </div>
      );
    }
    return null;
  };
  const description = (book.description || "")
    .replaceAll("<p>", "")
    .replaceAll("</p>", "")
    .replaceAll("<br>", "")
    .replaceAll("<br/>", "");
  const truncatedDescription =
    description.length > MAX_LENGTH
      ? description.substring(0, MAX_LENGTH) + "..."
      : description;
  return (
    <>
      <div className="card md:card-side bg-base-100 shadow-xl">
        <figure className="p-10 md:w-1/5 mb-auto">
          <img
            src={book.imageLinks?.thumbnail || "/placeholder-book-cover.jpg"}
            alt={book.title || "Book cover"}
            className="rounded-lg md:w-full object-cover"
          />
        </figure>
        <div className="card-body md:w-2/3">
          <div className="grid md:grid-cols-2 md:grid-rows-1">
            <h2 className="card-title">{book.title || "Untitled"}</h2>
            <div className="my-2 md:my-0 space-x-2 md:ml-auto mr-auto md:mr-0">
              <select
                value={status}
                onChange={(e) =>
                  updateBookStatus(e.target.value, book.pageCount)
                }
                className="select select-bordered w-auto max-w-xs"
              >
                <option value="To Read">{t("reading_status1")}</option>
                <option value="Reading">{t("reading_status2")}</option>
                <option value="Finished">{t("reading_status3")}</option>
                <option value="DNF">{t("reading_status4")}</option>
              </select>
              <div className="grid grid-cols-2 mt-5 ml-auto">
                <div className="justify-end md:flex">
                  <BookSharebutton
                    isbn={
                      book.industryIdentifiers?.find(
                        (id) => id.type === "ISBN_13"
                      )?.identifier
                    }
                  />
                </div>{" "}
                <div className="justify-end md:flex">
                  <ViewSellers title={book.title} />
                </div>
              </div>
            </div>
          </div>
          <p>
            <b>{t("author_label")}:</b>{" "}
            {book.authors?.join(", ") || t("unknown_label")}
          </p>
          <p>
            <b>{t("page_label")}:</b> {book.pageCount || t("unknown_label")}
          </p>
          <div className="description-container max-w-lg">
            <b>{t("description_label")}:</b>{" "}
            <div className="description-text md:text-justify">
              {isExpanded ? description : truncatedDescription}
              {description && description.length > MAX_LENGTH && (
                <button
                  onClick={handleToggleExpand}
                  className="text-blue-500 ml-2"
                >
                  {isExpanded ? t("readless_label") : t("readmore_label")}
                </button>
              )}
              {!description && t("nodescription_label")}
            </div>
          </div>
          <div className="grid card-actions justify-start gap-y-4 max-w-2xl">
            {status === "Finished" && (
              <>
                {renderRatingInput()}
                {renderReviewInput()}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 grid-rows-1">
            <div>
              <p className="mb-2">
                <b>{t("tags_label")}:</b>{" "}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="badge badge-secondary gap-2 p02 h-auto"
                  >
                    {tag}
                    <button
                      onClick={() => onRemoveTag(tag)}
                      className="btn btn-xs btn-circle btn-ghost"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="badge badge-outline gap-2 h-auto flex">
                  <div className="inline-flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          onAddTag(newTag);
                          setNewTag("");
                        }
                      }}
                      placeholder={t("addtags_label")}
                      className="bg-transparent border-none outline-none w-20"
                    />
                    <button
                      onClick={() => {
                        onAddTag(newTag);
                        setNewTag("");
                      }}
                      className="btn btn-xs btn-circle btn-ghost"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-min ml-auto mt-auto">
              <button
                className="btn btn-primary my-5 md:my-0 flex max-w-min"
                onClick={removeBook}
              >
                {t("remove_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CongratulationsModal
        isOpen={showModal}
        onClose={handleModalClose}
        messageType={messageType}
        bookTitle={book?.title || t("untitled_label")}
      />
    </>
  );
}
