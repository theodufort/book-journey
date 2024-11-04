import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Papa from "papaparse";
function roundToHalf(rating: number): number {
  return Math.round(rating * 2) / 2;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;
  const importType = formData.get("importType") as "goodreads" | "storygraph";

  if (!file || !userId || !importType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const fileContent = await file.text();
  const parsedData: any = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const supabase = createRouteHandlerClient({ cookies });

  const failedRecords: any[] = [];
  const missingIsbnRecords: any[] = [];
  let successCount = 0;

  for (const row of parsedData.data) {
    const bookData = parseBookData(row, importType);
    // Skip records with invalid or missing status
    if (bookData.isbn) {
      const { error } = await supabase.from("reading_list").upsert(
        {
          user_id: userId,
          book_id: bookData.isbn,
          status: bookData.read_status
            ? mapStatus(bookData.read_status)
            : mapStatus("to-read"),
          rating: bookData.rating ? bookData.rating : null,
          review: bookData.review,
          tags:
            bookData.tags && bookData.tags.length > 0
              ? bookData.tags.split(",").map((x: any) => x.trim())
              : null,
          reading_at: bookData.date_started
            ? new Date(bookData.date_started)
            : null,
          finished_at: bookData.date_finished
            ? new Date(bookData.date_finished)
            : null,
        },
        {
          onConflict: 'user_id,book_id',
        }
      );
      if (error) {
        console.error("Import error:", error);
        failedRecords.push(row);
      } else {
        successCount++;
      }
    } else {
      // If there's no ISBN but we have a title, track it separately
      if (row["Title"]) {
        missingIsbnRecords.push({
          title: row["Title"],
          author: importType === "goodreads" ? row["Author"] : row["Authors"],
          reason: "Missing ISBN",
        });
      } else {
        failedRecords.push(row);
      }
    }
  }

  return NextResponse.json({
    message: `Successfully imported ${successCount} books.`,
    failedRecords,
    missingIsbnRecords,
    summary: {
      success: successCount,
      missingIsbn: missingIsbnRecords.length,
      failed: failedRecords.length,
    },
  });
}

function parseBookData(row: any, importType: "goodreads" | "storygraph") {
  if (importType === "goodreads") {
    const isbn13 = row["ISBN13"] ? row["ISBN13"].replace(/[="]/g, "") : null;
    return {
      isbn: isbn13,
      title: row["Title"],
      author: row["Author"],
      format: row["Binding"],
      read_status: mapStatus(row["Exclusive Shelf"]), // Map status to match the constraint
      date_started: row["Date Started"],
      date_finished: row["Date Read"],
      rating: row["My Rating"]
        ? roundToHalf(parseFloat(row["My Rating"]))
        : null, // Round rating to nearest 0.5
      review: row["My Review"],
      tags: row["Bookshelves"]
        ? row["Bookshelves"]
            .split(",")
            .filter((x: string) => {
              return x != "read" && x != "to-read" && x != "currently-reading";
            })
            .map((x: string) => x.trim())
        : null,
    };
  } else {
    return {
      isbn: row["ISBN/UID"],
      title: row["Title"],
      author: row["Authors"],
      format: row["Format"],
      read_status: mapStatus(row["Read Status"]), // Map status to match the constraint
      date_started: row["Date Started"],
      date_finished: row["Date Finished"],
      rating: row["Star Rating"]
        ? roundToHalf(parseFloat(row["Star Rating"]))
        : null, // Round rating to nearest 0.5
      review: row["Review"].replace("<div>", "").replace("</div>", ""),
      tags: row["Tags"],
    };
  }
}

function mapStatus(status: string): string | null {
  // Define valid statuses based on your schema
  const validStatuses: any = {
    "to-read": "To Read",
    "currently-reading": "Reading",
    read: "Finished",
    DNF: "DNF", // Did Not Finish
  };

  // Map StoryGraph statuses to your valid statuses
  const mappedStatus = validStatuses[status];

  // Return valid status or null if it doesn't match
  return mappedStatus || null;
}
