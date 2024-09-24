import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;
  const importType = formData.get("importType") as "goodreads" | "storygraph";

  if (!file || !userId || !importType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fileContent = await file.text();
  const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

  const supabase = createRouteHandlerClient({ cookies });

  const failedRecords: any[] = [];
  let successCount = 0;

  for (const row of parsedData.data) {
    const bookData = parseBookData(row, importType);

    if (bookData.isbn) {
      const { error } = await supabase
        .from("reading_list")
        .upsert({
          user_id: userId,
          ...bookData,
        });

      if (error) {
        failedRecords.push(row);
      } else {
        successCount++;
      }
    } else {
      failedRecords.push(row);
    }
  }

  return NextResponse.json({
    message: `Successfully imported ${successCount} books.`,
    failedRecords,
  });
}

function parseBookData(row: any, importType: "goodreads" | "storygraph") {
  if (importType === "goodreads") {
    return {
      isbn: row["ISBN13"] || row["ISBN"],
      title: row["Title"],
      author: row["Author"],
      format: row["Binding"],
      read_status: row["Exclusive Shelf"],
      date_started: row["Date Started"],
      date_finished: row["Date Read"],
      rating: row["My Rating"],
      review: row["My Review"],
      tags: row["Bookshelves"],
    };
  } else {
    return {
      isbn: row["ISBN/UID"],
      title: row["Title"],
      author: row["Authors"],
      format: row["Format"],
      read_status: row["Read Status"],
      date_started: row["Date Started"],
      date_finished: row["Date Finished"],
      rating: row["Rating"],
      review: row["Review"],
      tags: row["Tags"],
    };
  }
}
