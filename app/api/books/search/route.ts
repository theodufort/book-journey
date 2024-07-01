// app/api/books/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=40` // Increased max results to ensure we get enough books with ISBNs
    );

    if (!response.ok) {
      throw new Error("Failed to fetch books from Google Books API");
    }

    const data = await response.json();

    // Filter books to only include those with ISBN identifiers
    const filteredItems = data.items.filter((item: any) =>
      item.volumeInfo.industryIdentifiers?.some((identifier: any) =>
        identifier.type.includes("ISBN_")
      )
    );

    // Return the filtered data
    return NextResponse.json({
      ...data,
      items: filteredItems,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for books" },
      { status: 500 }
    );
  }
}
