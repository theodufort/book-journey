import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
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
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${id}&langRestrict=en&key=${process.env.GOOGLE_API_KEY}`
  );
  if (response.status != 200) {
    throw new Error("Failed to fetch book details");
  }

  const data = await response.data.items[0];

  return NextResponse.json(data);
}
