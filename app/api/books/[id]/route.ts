import { BookVolumes } from "@/interfaces/GoogleAPI";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  const response = await axios.get<BookVolumes>(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${id}`
  );
  if (response.status != 200) {
    throw new Error("Failed to fetch book details");
  }

  const data = await response.data.items[0];

  // Extract relevant information
  const bookDetails = {
    id: data.volumeInfo.industryIdentifiers[1].identifier,
    title: data.volumeInfo.title,
    authors: data.volumeInfo.authors[0],
    description: data.volumeInfo.description,
    categories: data.volumeInfo.categories,
    imageLinks: data.volumeInfo.imageLinks,
    pageCount: data.volumeInfo.pageCount,
    publishedDate: data.volumeInfo.publishedDate,
    averageRating: data.volumeInfo.averageRating,
  };

  return NextResponse.json(bookDetails);
}
