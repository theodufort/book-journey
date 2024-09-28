import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import axios from "axios";

async function getAuthorDetails(authorKey: string) {
  try {
    const response = await axios.get(`https://openlibrary.org${authorKey}.json`);
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
  return null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

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
      .eq("isbn_13", `search:v2:${query}`)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Error checking cache:", cacheError);
    }

    if (cachedResults) {
      return NextResponse.json(cachedResults.data);
    }

    // If not in cache, fetch from Open Library API
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=40&language=eng`
    );

    if (response.status !== 200) {
      throw new Error(
        `Open Library API responded with status ${response.status}`
      );
    }

    const data = response.data;
    if (!data.docs || data.docs.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Transform the Open Library results to match the structure of our previous API
    const transformedItems = await Promise.all(data.docs.map(async (book: any) => {
      const authors = book.author_key
        ? await Promise.all(book.author_key.map((key: string) => getAuthorDetails(`/authors/${key}`)))
        : book.author_name?.map((name: string) => ({ name })) || [{ name: "Unknown Author" }];

      return {
        id: book.key,
        volumeInfo: {
          title: book.title,
          subtitle: book.subtitle || null,
          authors: authors.filter(Boolean),
          publishedDate: book.first_publish_year?.toString() || "Unknown",
          description: book.description || "No description available",
          industryIdentifiers: [
            ...(book.isbn ? [{ type: "ISBN_13", identifier: book.isbn[0] }] : []),
            ...(book.isbn ? [{ type: "ISBN_10", identifier: book.isbn[0].slice(-10) }] : []),
          ],
          imageLinks: {
            thumbnail: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null,
            small: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`
              : null,
            medium: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null,
            large: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
              : null,
          },
          pageCount: book.number_of_pages_median || 0,
          categories: book.subject || [],
          language: book.language?.[0] || "und",
          publisher: book.publisher?.[0] || "Unknown Publisher",
          publishPlace: book.publish_place?.[0] || "Unknown",
        },
      };
    }));

    const result = {
      items: transformedItems,
      totalItems: data.numFound,
    };

    // Cache the search results
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: `search:v2:${query}`, data: result });

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
