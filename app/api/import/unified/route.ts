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

  // Check for scientific notation in ISBN columns
  const hasScientificNotation = parsedData.data.some((row: any) => {
    const isbn13 = importType === "goodreads" ? row["ISBN13"] : row["ISBN/UID"];
    return isbn13 && isbn13.toString().includes("E+");
  });

  if (hasScientificNotation) {
    return NextResponse.json(
      {
        error: "Invalid file format",
        message:
          "The CSV file appears to have been opened and saved in a spreadsheet program, which has corrupted the ISBN numbers. Please use the original export file.",
      },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });

  const failedRecords: any[] = [];
  const missingIsbnRecords: any[] = [];
  const processedISBNs = new Set<string>();
  let successCount = 0;
  let verifiedCount = 0;
  let duplicateCount = 0;

  // Get initial count
  const { count: initialCount } = await supabase
    .from("reading_list")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  console.log(
    `Starting import of ${parsedData.data.length} records for user ${userId}`
  );
  console.log(`Initial database count: ${initialCount}`);

  // Start a transaction
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Session error:", sessionError);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 401 }
    );
  }

  for (const row of parsedData.data) {
    const bookData = parseBookData(row, importType);
    // Skip records with invalid or missing status
    if (bookData.isbn) {
      if (processedISBNs.has(bookData.isbn)) {
        duplicateCount++;
        continue;
      }
      processedISBNs.add(bookData.isbn);

      const { error } = await supabase.from("reading_list").upsert(
        {
          user_id: userId,
          book_id: bookData.isbn,
          status: mapStatus(bookData.read_status || "to-read"),
          rating: bookData.rating ? bookData.rating : null,
          review: bookData.review,
          tags: bookData.tags ? [] : null,
          reading_at: bookData.date_started
            ? new Date(bookData.date_started)
            : null,
          finished_at: bookData.date_finished
            ? new Date(bookData.date_finished)
            : null,
        },
        {
          onConflict: "user_id,book_id",
        }
      );
      if (error) {
        console.error(`Import error for ${bookData.title}:`, error);
        failedRecords.push({
          title: bookData.title,
          isbn: bookData.isbn,
          author: bookData.author,
          error: error.message,
          details: error.details,
          hint: error.hint,
        });
      } else {
        // Verify the record was actually inserted/updated
        const { data: verifyData, error: verifyError } = await supabase
          .from("reading_list")
          .select()
          .eq("user_id", userId)
          .eq("book_id", bookData.isbn)
          .single();

        if (verifyError) {
          console.error(
            `Verification error for ${bookData.title}:`,
            verifyError
          );
          failedRecords.push({
            title: bookData.title,
            isbn: bookData.isbn,
            author: bookData.author,
            error: "Failed to verify import",
            details: verifyError.message,
          });
        } else if (!verifyData) {
          console.error(`Record not found after import for ${bookData.title}`);
          failedRecords.push({
            title: bookData.title,
            isbn: bookData.isbn,
            author: bookData.author,
            error: "Failed to verify import",
            details: "Record not found after import",
          });
        } else {
          verifiedCount++;
          successCount++;
        }
      }
    } else {
      // Create custom ID and book data for books without ISBN
      if (row["Title"]) {
        const bookData = parseBookData(row, importType);
        
        // First insert into books table
        const { error: booksError } = await supabase
          .from("books")
          .upsert({
            isbn_13: bookData.isbn,
            data: {
              id: bookData.isbn,
              volumeInfo: {
                title: bookData.title,
                authors: [bookData.author],
                language: "en",
                subtitle: null,
                pageCount: null,
                publisher: null,
                categories: [],
                imageLinks: {
                  thumbnail: null,
                },
                description: null,
                publishedDate: null,
                industryIdentifiers: [
                  {
                    type: "CUSTOM_ID",
                    identifier: bookData.isbn,
                  },
                ],
              },
            },
          });

        if (booksError) {
          console.error(
            `Error creating custom book entry for ${title}:`,
            booksError
          );
          failedRecords.push({
            title: title,
            author: author,
            error: "Failed to create custom book entry",
            details: booksError.message,
          });
          continue;
        }
        console.log(bookData.read_status);
        // Then insert into reading_list
        const { error: readingListError } = await supabase
          .from("reading_list")
          .upsert({
            user_id: userId,
            book_id: customId,
            status: mapStatus(bookData.read_status || "to-read"),
            rating: bookData.rating ? bookData.rating : null,
            review: bookData.review,
            tags: bookData.tags ? bookData.tags : [],
            reading_at: bookData.date_started
              ? new Date(bookData.date_started)
              : null,
            finished_at: bookData.date_finished
              ? new Date(bookData.date_finished)
              : null,
            toread_at: new Date(),
            pointsAwardedFinished: false,
            pointsAwardedRating: false,
            pointsAwardedTextReview: false,
            reviewPublic: false,
            pages_read: 0,
            format: bookData.format,
          });

        if (readingListError) {
          console.error(
            `Error adding custom book to reading list ${title}:`,
            readingListError
          );
          failedRecords.push({
            title: title,
            author: author,
            error: "Failed to add to reading list",
            details: readingListError.message,
          });
        } else {
          successCount++;
          verifiedCount++;
        }
      } else {
        failedRecords.push(row);
      }
    }
  }

  // Final verification of total count
  const { count: finalCount, error: countError } = await supabase
    .from("reading_list")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const response = {
    message: `Successfully imported and verified ${verifiedCount} books.`,
    failedRecords,
    missingIsbnRecords,
    summary: {
      total: parsedData.data.length,
      success: successCount,
      verified: verifiedCount,
      missingIsbn: missingIsbnRecords.length,
      failed: failedRecords.length,
      duplicates: duplicateCount,
      initialCount,
      finalDatabaseCount: finalCount,
      uniqueISBNs: processedISBNs.size,
      countError: countError?.message,
    },
    debug: {
      importType,
      userId,
      timestamp: new Date().toISOString(),
    },
  };

  console.log("Import summary:", response.summary);
  if (failedRecords.length > 0) {
    console.log("Failed records:", failedRecords);
  }

  return NextResponse.json(response);
}

function mapFormat(format: string): string {
  const formatLower = format?.toLowerCase() || "";

  if (formatLower.includes("audio") || formatLower.includes("audiobook")) {
    return "audio";
  }
  if (
    formatLower.includes("ebook") ||
    formatLower.includes("kindle") ||
    formatLower.includes("digital")
  ) {
    return "digital";
  }
  return "physical";
}

function parseBookData(row: any, importType: "goodreads" | "storygraph") {
  const customId = `CUSTOM-${Date.now()}`;
  if (importType === "goodreads") {
    const isbn13 = row["ISBN13"] ? row["ISBN13"].replace(/[="]/g, "") : customId;
    return {
      isbn: isbn13,
      title: row["Title"],
      author: row["Author"],
      format: mapFormat(row["Binding"]),
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
      isbn: row["ISBN/UID"] || customId,
      title: row["Title"],
      author: row["Authors"],
      format: mapFormat(row["Format"]),
      read_status: mapStatus(row["Read Status"]), // Map status to match the constraint
      date_started: row["Date Started"],
      date_finished: row["Date Finished"],
      rating: row["Star Rating"]
        ? roundToHalf(parseFloat(row["Star Rating"]))
        : null, // Round rating to nearest 0.5
      review: row["Review"].replace("<div>", "").replace("</div>", ""),
      tags:
        row["tags"] && row["tags"].length > 0
          ? row["tags"].split(",").map((x: any) => x.trim())
          : null,
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
