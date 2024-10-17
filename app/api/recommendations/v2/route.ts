"use server";
import { BookSearchResult } from "@/interfaces/BookSearch";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import { Database } from "@/types/supabase";
import {
  createServerComponentClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const supabase = createServerComponentClient<Database>({ cookies });
function sortAuthors(
  authorsArray: {
    author: string;
    subjects: string;
  }[]
) {
  const authors = authorsArray.map((item) => item.author);

  // 3. Count the occurrences of each author
  const authorCounts = authors.reduce(
    (counts: Record<string, number>, author: string) => {
      counts[author] = (counts[author] || 0) + 1;
      return counts;
    },
    {}
  );

  // 4. Convert the authorCounts object into an array of [author, count] pairs
  const authorCountArray = Object.entries(authorCounts);

  // 5. Filter authors that appear more than once
  const repeatedAuthorsArray = authorCountArray.filter(
    ([author, count]) => count > 1
  );

  // 6. Sort the array by count in descending order
  repeatedAuthorsArray.sort((a, b) => b[1] - a[1]);

  // 7. Extract the authors from the sorted array
  const repeatedAuthors = repeatedAuthorsArray.map(([author, count]) => author);
  return repeatedAuthors;
}
function sortSubjects(
  subjectsArray: {
    author: string;
    subjects: string;
  }[]
) {
  const subjects = subjectsArray
    .flatMap((item) => item.subjects)
    .filter((subject) => subject); // Remove any undefined or null subjects

  // 3. Count the occurrences of each subject
  const subjectCounts = subjects.reduce(
    (counts: Record<string, number>, subject: string) => {
      counts[subject] = (counts[subject] || 0) + 1;
      return counts;
    },
    {}
  );

  // 4. Convert the subjectCounts object into an array of [subject, count] pairs
  const subjectCountArray = Object.entries(subjectCounts);

  // 5. Filter subjects that appear more than once
  const repeatedSubjectsArray = subjectCountArray.filter(
    ([subject, count]) => count > 1
  );

  // 6. Sort the array by count in descending order
  repeatedSubjectsArray.sort((a, b) => b[1] - a[1]);

  // 7. Extract the subjects from the sorted array
  const repeatedSubjects = repeatedSubjectsArray.map(
    ([subject, count]) => subject
  );
  return repeatedSubjects;
}
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
    .select("book_id, rating")
    .eq("user_id", userId)
    .eq("status", "Finished")
    .not("rating", "is", null)
    .neq("rating", 0.0)
    .order("rating", { ascending: false });

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
  const maxRetries = 5;
  const topRatedBooks = 50;
  let attempt = 0;
  let error = null;
  //priority 1
  const readBooks = await getReadBooks(supabase, userId);
  //priority 2
  const userCategories = await getUserCategories(supabase, userId);
  while (attempt < maxRetries) {
    try {
      let subjects: string[];
      if (readBooks.length != 0) {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const prioritizationData: any = await Promise.all(
          await readBooks.slice(0, topRatedBooks).map(async (book) => {
            let url = new URL(
              `/api/books/${encodeURIComponent(book.book_id)}/v3`,
              baseUrl
            );
            const response = await fetch(url.toString());
            if (!response.ok) {
              throw new Error("Failed to fetch books");
            }
            const data: BookSearchResult = await response.json();
            return {
              author: data.volumeInfo.authors?.[0] || "Unknown",
              subjects: data.volumeInfo.categories || [],
            };
          })
        );
        console.log(prioritizationData);
        // const prioritizedAuthors = sortAuthors(prioritizationData);
        const prioritizedSubjects = sortSubjects(prioritizationData);
        console.log(prioritizedSubjects);
        subjects = getRandomCategories(prioritizedSubjects, 2);
      } else {
        if (userCategories.length > 0) {
          subjects = getRandomCategories(userCategories, 1);
        } else {
          subjects = ["Fiction"]; // Default subject if no categories found
        }
      }

      const subjectsQuery = subjects.join(",");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://example.com";
      const url = new URL("/api/books/search/v3", baseUrl);
      url.searchParams.append("subjects", subjectsQuery);
      url.searchParams.append("column", "subjects");
      url.searchParams.append("page", "5");
      url.searchParams.append("pageSize", "20");
      url.searchParams.append("language", "en");

      console.log(`Attempt ${attempt + 1}: Fetching ${url}`);
      const searchResponse = await fetch(url.toString());

      if (searchResponse.ok) {
        const searchData: BookVolumes = await searchResponse.json();
        if (searchData.items) {
          const readBookIds = new Set(readBooks.map((book) => book.book_id));
          const recommendations = searchData.items.filter(
            (book: Volume) =>
              !readBookIds.has(
                book.volumeInfo.industryIdentifiers?.find(
                  (id) => id.type === "ISBN_13"
                )?.identifier
              ) && book.volumeInfo.description
          );
          return recommendations.slice(0, 20); // Return top 20 recommendations
        }
        return [];
      } else {
        throw new Error("Failed to fetch recommendations");
      }
    } catch (err) {
      error = err;
      attempt++;
      console.error(`Error on attempt ${attempt}: ${err}`);
    }
  }

  console.error("Max retries reached, returning error.");
  throw error; // Throw the last encountered error after all retries have failed
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

    const recommendations = await getRecommendations(supabase, user.id);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Unexpected error:", error);
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === "AuthError") {
        statusCode = 401;
      } else if (error.name === "DatabaseError") {
        statusCode = 503;
      } else if (
        error instanceof TypeError &&
        error.message.includes("Invalid URL")
      ) {
        errorMessage = "Invalid URL configuration";
        statusCode = 500;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
