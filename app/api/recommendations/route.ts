import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabase = createRouteHandlerClient({ cookies });

async function getReadBooks(userId: string) {
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
  const response = await fetch(`/api/books/${bookId}`);
  if (!response.ok) {
    console.error(`Error fetching book details for ${bookId}`);
    return null;
  }
  return await response.json();
}

async function getRecommendations(userId: string) {
  const readBooks = await getReadBooks(userId);
  const bookDetails = await Promise.all(
    readBooks.map((book) => getBookDetails(book.book_id))
  );

  const genres = new Set<string>();
  const categories = new Set<string>();

  bookDetails.forEach((book) => {
    if (book) {
      if (book.genre) genres.add(book.genre);
      if (book.category) categories.add(book.category);
    }
  });

  const searchQuery = [...genres, ...categories].join(" OR ");
  const searchResponse = await fetch(`/api/books/search?q=${searchQuery}&limit=10`);
  
  if (!searchResponse.ok) {
    console.error("Error fetching recommendations");
    return [];
  }

  const searchData = await searchResponse.json();
  
  // Filter out books that the user has already read
  const readBookIds = new Set(readBooks.map(book => book.book_id));
  const recommendations = searchData.filter((book: any) => !readBookIds.has(book.id));

  return recommendations.slice(0, 5);  // Return top 5 recommendations
}

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recommendations = await getRecommendations(user.id);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
