"use server";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1";
const GOOGLE_BOOKS_API_KEY = "YOUR_GOOGLE_BOOKS_API_KEY"; // Replace with your actual API key

async function getUserCategories(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("preferred_categories")
    .eq("user_id", userId);
  if (error) {
    console.error("Error fetching read books:", error);
    return [];
  }

  return data || [];
}

async function getReadBooks(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const { data, error } = await supabase
    .from("reading_list")
    .select("book_id, status")
    .eq("user_id", userId)
    .eq("status", "Finished");

  if (error) {
    console.error("Error fetching read books:", error);
    return [];
  }

  return data || [];
}

async function getBookDetails(bookId: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookId}&langRestrict=en&key=${process.env.GOOGLE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Error fetching book details for ${bookId}`);
    return null;
  }
  const data: BookVolumes = await response.json();
  const volume = data.items[0];
  return {
    id: volume.id,
    title: volume.volumeInfo.title,
    authors: volume.volumeInfo.authors,
    categories: volume.volumeInfo.categories,
    description: volume.volumeInfo.description,
  };
}

async function getRecommendations(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const readBooks = await getReadBooks(supabase, userId);
  const bookDetails = await Promise.all(
    readBooks.map((book) => getBookDetails(book.book_id))
  );

  const categories = new Set<string>();
  if (bookDetails.length == 0) {
    const userPrefs = await getUserCategories(supabase, userId);
    userPrefs.forEach((cat) => categories.add(cat.preferred_categories));
  }

  bookDetails.forEach((book, index) => {
    if (book && book.categories) {
      book.categories.forEach((category: string) => {
        if (index < 2) {
          categories.add(category);
        }
      });
    }
  });

  const searchQuery = encodeURIComponent(
    Array.from(categories).join("+subject:")
  );
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${searchQuery}&maxResults=40&langRestrict=en&key=${process.env.GOOGLE_API_KEY}&orderBy=newest`;
  const searchResponse = await fetch(url);
  if (!searchResponse.ok) {
    console.error("Error fetching recommendations");
    return [];
  }

  const searchData = await searchResponse.json();
  if (searchData.items) {
    // Filter out books that the user has already read
    const readBookIds = new Set(readBooks.map((book) => book.book_id));
    const recommendations = searchData.items.filter(
      (book: Volume) =>
        !readBookIds.has(
          book.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13"
          )?.identifier
        ) && book.volumeInfo.authors
    );
    return recommendations.slice(0, 20); // Return top x recommendations
  } else {
    return [];
  }
}

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recommendations = await getRecommendations(supabase, user.id);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
