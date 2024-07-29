import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1";
const GOOGLE_BOOKS_API_KEY = "YOUR_GOOGLE_BOOKS_API_KEY"; // Replace with your actual API key

async function getReadBooks(supabase, userId: string) {
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
  const response = await fetch(
    `${GOOGLE_BOOKS_API_BASE}/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
  );
  if (!response.ok) {
    console.error(`Error fetching book details for ${bookId}`);
    return null;
  }
  const data = await response.json();
  return {
    id: data.id,
    title: data.volumeInfo.title,
    authors: data.volumeInfo.authors,
    categories: data.volumeInfo.categories,
    description: data.volumeInfo.description,
  };
}

async function getUserPreferences(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("preferred_categories")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user preferences:", error);
    return [];
  }

  return data?.preferred_categories || [];
}

async function getRecommendations(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const readBooks = await getReadBooks(supabase, userId);
  const bookDetails = await Promise.all(
    readBooks.map((book) => getBookDetails(book.book_id))
  );
  const userPreferences = await getUserPreferences(supabase, userId);

  const categories = new Set<string>();

  bookDetails.forEach((book) => {
    if (book && book.categories) {
      book.categories.forEach((category: string) => categories.add(category));
    }
  });

  // Add user preferences to the categories
  userPreferences.forEach((category: string) => categories.add(category));

  const searchQuery = Array.from(categories).join("+subject:");
  const searchResponse = await fetch(
    `${GOOGLE_BOOKS_API_BASE}/volumes?q=subject:${searchQuery}&maxResults=40&key=${GOOGLE_BOOKS_API_KEY}`
  );

  if (!searchResponse.ok) {
    console.error("Error fetching recommendations");
    return [];
  }

  const searchData = await searchResponse.json();

  // Filter out books that the user has already read
  const readBookIds = new Set(readBooks.map((book) => book.book_id));
  const recommendations = searchData.items
    .filter((book: any) => !readBookIds.has(book.id))
    .map((book: any) => ({
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      description: book.volumeInfo.description,
    }));

  return recommendations.slice(0, 5); // Return top 5 recommendations
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
