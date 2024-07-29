import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Book, Preferences } from "./interface";
const supabase = createRouteHandlerClient({ cookies });
// Global constants for attribute weights
const AUTHOR_WEIGHT = 1;
const MAIN_CATEGORY_WEIGHT = 3;
const SUBCATEGORY_WEIGHT = 2;

function getUserPreferencesBasedonBooks(booksRead: Book[]): Preferences {
  const preferences: Preferences = {
    Author: {},
    "Main Category": {},
    Subcategory: {},
  };
  let totalRatings = 0;

  for (const book of booksRead) {
    const rating = parseFloat(book["Personal Rating"] || "0");
    totalRatings += rating;
    preferences.Author[book.Author] =
      (preferences.Author[book.Author] || 0) + rating;
    preferences["Main Category"][book["Main Category"]] =
      (preferences["Main Category"][book["Main Category"]] || 0) + rating;
    preferences.Subcategory[book.Subcategory] =
      (preferences.Subcategory[book.Subcategory] || 0) + rating;
  }

  // Normalize preferences
  for (const category in preferences) {
    for (const key in preferences[category as keyof Preferences]) {
      preferences[category as keyof Preferences][key] /= totalRatings;
    }
  }

  return preferences;
}

function calculateBookScore(book: Book, preferences: Preferences): number {
  let score = 0;
  score += (preferences.Author[book.Author] || 0) * AUTHOR_WEIGHT;
  score +=
    (preferences["Main Category"][book["Main Category"]] || 0) *
    MAIN_CATEGORY_WEIGHT;
  score +=
    (preferences.Subcategory[book.Subcategory] || 0) * SUBCATEGORY_WEIGHT;
  return score;
}

function recommendBooks(
  booksRead: Book[],
  numRecommendations: number = 10
): Book[] {
  // Get user preferences
  const preferences = getUserPreferencesBasedonBooks(booksRead);

  // Calculate scores for unread books
  const unreadBooks = allBooks.filter(
    (book) =>
      !booksRead.some(
        (readBook) => readBook["Book Title"] === book["Book Title"]
      )
  );
  const scoredBooks = unreadBooks.map((book) => ({
    book,
    score: calculateBookScore(book, preferences),
  }));

  // Sort books by score in descending order
  scoredBooks.sort((a, b) => b.score - a.score);

  // Return top N recommendations
  return scoredBooks.slice(0, numRecommendations).map((item) => item.book);
}

async function getRecommendations() {
  const { data, error } = await supabase
    .from("reading_list")
    .select("*")
    .eq("status", "Finished")
    .maybeSingle();

  const booksRead = data;
  const searchResponse = await fetch(
    `/api/books/search?q=${}`
  );
  const searchData = await searchResponse.json();
  const recommendations = recommendBooks(booksRead, 5);

  return recommendations.map((book, index) => ({
    id: index + 1,
    title: book["Book Title"],
    author: book.Author,
    mainCategory: book["Main Category"],
    subcategory: book.Subcategory,
  }));
}
export async function GET() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;
    // Fetch user's reading history
    const { data: readingHistory, error: historyError } = await supabase
      .from("reading_list")
      .select("books(genre)")
      .eq("user_id", user.id);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
