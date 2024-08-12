import { FormData } from "@/interfaces/BookFinder";
import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

async function searchVolumes(
  searchQuery: string,
  body: FormData
): Promise<BookVolumes | string> {
  const min_page_count = body.min_page_count;
  const max_page_count = body.max_page_count;
  const lang = body.language;
  try {
    console.log(searchQuery);
    console.log(
      `https://www.googleapis.com/books/v1/volumes?${
        searchQuery != "" ? "q=" + searchQuery + "&" : ""
      }maxResults=40&langRestrict=${lang}&key=${process.env.GOOGLE_API_KEY}`
    );
    const url = `https://www.googleapis.com/books/v1/volumes?${
      searchQuery != "" ? "q=" + searchQuery + "&" : "q="
    }maxResults=40&langRestrict=${lang}&key=${process.env.GOOGLE_API_KEY}`;
    const response = await axios.get(url);
    // Process the response
    if (response.status === 200) {
      var volumes: BookVolumes = await response.data;
      // Filter books that have images
      const volumesWithImages = volumes.items.filter(
        (item) => item.volumeInfo.imageLinks
      );
      volumes.items = volumesWithImages;
      // Filter books between min and max length
      const volumesBetweenPages = volumes.items.filter((item) => {
        const pageCount = item.volumeInfo.pageCount;
        // Ensure min_page_count and max_page_count are defined and valid
        const isMinValid =
          typeof min_page_count === "number" && min_page_count > 0;
        const isMaxValid =
          typeof max_page_count === "number" && max_page_count > 0;
        // Apply filtering logic based on validity of min_page_count and max_page_count
        if (isMinValid && isMaxValid) {
          return pageCount > min_page_count && pageCount < max_page_count;
        } else if (isMinValid) {
          return pageCount > min_page_count;
        } else if (isMaxValid) {
          return pageCount < max_page_count;
        } else {
          return true; // No page count filters applied
        }
      });
      volumes.items = volumesBetweenPages;
      // Filter books that have authors
      const volumesWithAuthors = volumes.items.filter(
        (item) => item.volumeInfo.authors
      );
      volumes.items = volumesWithAuthors;
      return volumes;
    } else {
      return "Failed to fetch search results";
    }
  } catch (error) {
    return error;
  }
}
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const genre = body.genre;
  const author = body.author;

  var query = "";
  if (genre != undefined && genre != "any") {
    query += "+" + "subject:" + genre;
  }
  if (author != undefined && author != "") {
    query += "+" + 'inauthor:"' + author + '"';
  }
  console.log(query);
  try {
    const result = await searchVolumes(query, body);
    return Response.json(result);
  } catch (err) {
    return new Response("Failed to load data!", { status: 500 });
  }
}
