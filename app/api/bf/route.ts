import { BookVolumes, Volume } from "@/interfaces/GoogleAPI";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

async function searchVolumes(
  searchQuery: string
): Promise<BookVolumes | string> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`
    );
    // Process the response
    if (response.status === 200) {
      var volumes: BookVolumes = await response.data;
      console.log(volumes.items.length);
      const volumesWithImages = await volumes.items.filter(
        (item) => item.volumeInfo.imageLinks
      );
      volumes.items = volumesWithImages;
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
  var query = "";
  if (genre != undefined) {
    query += "subject:" + genre + "+";
  }
  try {
    const result = await searchVolumes(query);
    return Response.json(result);
  } catch (err) {
    return new Response("Failed to load data!", { status: 500 });
  }
}
