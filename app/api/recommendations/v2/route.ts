"use server";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import {
  SupabaseClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUserCategories(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("preferred_categories")
    .eq("user_id", userId);
  if (error) {
    console.error("Error fetching user categories:", error);
    return [];
  }
  return data?.[0]?.preferred_categories || [];
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

function getRandomCategories(categories: string[], count: number): string[] {
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function getRecommendations(
  supabase: SupabaseClient<any, "public", any>,
  userId: string
) {
  const readBooks = await getReadBooks(supabase, userId);
  const userCategories = await getUserCategories(supabase, userId);

  let subjects: string[];
  if (readBooks.length === 0 && userCategories.length > 0) {
    subjects = getRandomCategories(userCategories, 1);
  } else {
    // In a real scenario, you'd analyze read books to determine subjects
    // For this example, we'll just use a default subject
    subjects = ["fiction"];
  }
  const subjectsQuery = subjects.join(",");
  const url = `https://localhost:3000/api/books/search/v3?subjects=${encodeURIComponent(
    subjectsQuery
  )}`;

  const searchResponse = await fetch(url);
  console.log(searchResponse);
  console.log(searchResponse.status);
  if (!searchResponse.ok) {
    console.error("Error fetching recommendations");
    return [];
  }

  const searchData: BookVolumes = await searchResponse.json();
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
    return recommendations.slice(0, 20); // Return top 20 recommendations
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
    // console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}
