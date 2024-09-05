import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import axios, { AxiosRequestConfig } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import https from 'https';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const useProxy = request.nextUrl.searchParams.get("useProxy") === "true";

  if (!id) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Check if the book exists in the cache
  const { data: cachedBook, error: cacheError } = await supabase
    .from("books")
    .select("data")
    .eq("isbn_13", id)
    .single();

  if (cacheError && cacheError.code !== "PGRST116") {
    console.error("Error checking cache:", cacheError);
  }

  if (cachedBook) {
    return NextResponse.json(cachedBook.data);
  }

  // If not in cache, fetch from Google Books API
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const apiUrl = useProxy
    ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${id}&langRestrict=en`
    : `https://www.googleapis.com/books/v1/volumes?q=isbn:${id}&langRestrict=en&key=${process.env.GOOGLE_API_KEY}`;

  try {
    const axiosConfig: AxiosRequestConfig = {};
    if (useProxy) {
      axiosConfig.proxy = {
        protocol: "https",
        host: "brd.superproxy.io",
        port: 22225,
        auth: {
          username: "brd-customer-hl_20908051-zone-data_center",
          password: "l9e3hvk0822v",
        },
      };
      // Disable SSL certificate verification when using proxy
      axiosConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    const response = await axios.get<BookVolumes>(apiUrl, axiosConfig);

    if (
      response.status !== 200 ||
      !response.data.items ||
      response.data.items.length === 0
    ) {
      throw new Error("Failed to fetch book details");
    }

    const bookData = response.data.items[0];

    // Cache the book data
    const { error: insertError } = await supabase
      .from("books")
      .insert({ isbn_13: id, data: bookData as any });

    if (insertError) {
      console.error("Error caching book data:", insertError);
    }

    return NextResponse.json(bookData);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 }
    );
  }
}
