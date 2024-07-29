"use server";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1";
const GOOGLE_BOOKS_API_KEY = "YOUR_GOOGLE_BOOKS_API_KEY"; // Replace with your actual API key

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
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookId}`;
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

  bookDetails.forEach((book) => {
    if (book && book.categories) {
      book.categories.forEach((category: string) => categories.add(category));
    }
  });

  const searchQuery = Array.from(categories).join("+subject:");
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${searchQuery}&maxResults=40`;
  const searchResponse = await fetch(url);

  if (!searchResponse.ok) {
    console.error("Error fetching recommendations");
    return [];
  }

  const searchData = await searchResponse.json();

  // Filter out books that the user has already read
  const readBookIds = new Set(readBooks.map((book) => book.book_id));
  const recommendations = searchData.items.filter(
    (book: Volume) =>
      !readBookIds.has(
        book.volumeInfo.industryIdentifiers?.find((id) => id.type === "ISBN_13")
          ?.identifier
      )
  );
  // .map((book: Volume) => ({
  //   id: book.volumeInfo.industryIdentifiers?.find(
  //     (id) => id.type === "ISBN_13"
  //   )?.identifier,
  //   title: book.volumeInfo.title,
  //   authors: book.volumeInfo.authors[0],
  //   description: book.volumeInfo.description,
  //   mainCategory: book.volumeInfo.mainCategory,
  //   category: book.volumeInfo.categories,
  // }));

  return recommendations.slice(0, 20); // Return top 5 recommendations
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
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
