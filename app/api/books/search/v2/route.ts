import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getAuthorDetails(authorKey: string) {
  try {
    const response = await axios.get(
      `https://openlibrary.org${authorKey}.json`
    );
    if (response.status === 200) {
      const authorData = response.data;
      return {
        key: authorData.key,
        name: authorData.name,
        birth_date: authorData.birth_date,
        death_date: authorData.death_date,
        bio: authorData.bio?.value || authorData.bio,
      };
    }
  } catch (error) {
    console.error(`Error fetching author details for ${authorKey}:`, error);
  }
  // Return an object with at least a name property, even if the API call fails
  return { name: authorKey.split("/").pop() || "Unknown Author" };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const version = searchParams.get("v") || "2";

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    // Check if the search results exist in the cache
    const { data: cachedResults, error: cacheError } = await supabase
      .from("books")
      .select("data")
      .eq("isbn_13", `search:v${version}:${query}`)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }

    // If not in cache, fetch from Open Library API
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        query
      )}&limit=40&language=eng`
    );

    if (response.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${response.status}`
      );
    }

    const data = response.data;
    if (!data.docs || data.docs.length === 0) {
      return NextResponse.json(version === "3" ? { total: 0, books: [] } : { items: [] });
    }

    // Transform the Open Library results to match the structure of our previous API
    const transformedItems = await Promise.all(
      data.docs.map(async (book: any) => {
        const authors = book.author_key
          ? await Promise.all(
              book.author_key.map((key: string) =>
                getAuthorDetails(`/authors/${key}`)
              )
            )
          : book.author_name?.map((name: string) => ({ name })) || [
              { name: "Unknown Author" },
            ];

        const commonData = {
          title: book.title,
          authors: authors.filter(Boolean).map((author: any) => author.name),
          publishedDate: book.first_publish_year?.toString() || "Unknown",
          description:
            book.description ||
            book.first_sentence ||
            "No description available",
          isbn13: book.isbn?.[0] || "",
          isbn10: book.isbn?.[0]?.slice(-10) || "",
          language: book.language?.[0] || "und",
          pageCount: book.number_of_pages_median || 0,
          publisher: book.publisher?.[0] || "Unknown Publisher",
          image: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : null,
        };

        if (version === "3") {
          return {
            ...commonData,
            title_long: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
            date_published: commonData.publishedDate,
            synopsis: commonData.description,
            subjects: book.subject || ["Subjects"],
            binding: book.physical_format || "Unknown",
            isbn: commonData.isbn13,
            pages: commonData.pageCount,
          };
        } else {
          return {
            id: book.key,
            volumeInfo: {
              ...commonData,
              subtitle: book.subtitle || null,
              industryIdentifiers: [
                ...(commonData.isbn13 ? [{ type: "ISBN_13", identifier: commonData.isbn13 }] : []),
                ...(commonData.isbn10 ? [{ type: "ISBN_10", identifier: commonData.isbn10 }] : []),
              ],
              imageLinks: {
                thumbnail: commonData.image,
                small: book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`
                  : null,
                medium: commonData.image,
                large: book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                  : null,
              },
              categories: book.subject || [],
              publishPlace: book.publish_place?.[0] || "Unknown",
            },
          };
        }
      })
    );

    const result = version === "3"
      ? {
          total: data.numFound,
          books: transformedItems,
        }
      : {
          items: transformedItems,
          totalItems: data.numFound,
        };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `search:v${version}:${query}`, data: result });

    if (insertError) {
      console.error("Error caching search results:", insertError);
    }

    // Return the transformed data
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for books" },
      { status: 500 }
    );
  }
}
