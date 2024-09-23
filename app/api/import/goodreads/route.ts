import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { parse } from "csv-parse/sync";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  if (!req.body) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json(
        { error: "No userId specified" },
        { status: 400 }
      );
    }
    const csvContent = await file.text();
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    var imported = [];
    var cant_import = [];
    for (const record of records) {
      if (record.ISBN13) {
        const book = {
          title: record.Title,
          author: record.Author,
          isbn: record.ISBN13 || record.ISBN,
          publishYear: parseInt(record.Year_Published) || null,
          pageCount: parseInt(record.Number_of_Pages) || null,
          goodreadsId: record.Book_Id,
          goodreadsRating: parseFloat(record.Average_Rating) || null,
          userRating: parseInt(record.My_Rating) || null,
          dateRead: record.Date_Read ? new Date(record.Date_Read) : null,
          dateAdded: new Date(record.Date_Added),
          shelves: record.Bookshelves,
          review: record.My_Review || null,
        };
        imported.push(book);
        const { data: importData, error: importError } = await supabase
          .from("reading_list")
          .upsert({
            user_id: userId,
            book_id: record.ISBN13,
            toread_at: new Date(record.Date_Added),
            reading_at: record.Date_Read ? new Date(record.Date_Read) : null,
            finished_at: record.Date_Read ? new Date(record.Date_Read) : null,
            review: record.My_Review || null,
            rating: record.My_Rating
              ? Math.round(parseFloat(record.My_Rating) * 2) / 2
              : null,
            tags: record.Bookshelves
              ? record.Bookshelves.split(",").filter((x: any) => {
                  return (
                    x != "read" && x != "to-read" && x != "currently-reading"
                  );
                })
              : null,
          })
          .eq("user_id", userId);
        //convert bookshelves to tags
      } else {
        cant_import.push(record);
      }
    }
    if (cant_import.length == 0) {
      return NextResponse.json(
        {
          message: `Successfully imported ${imported.length} books`,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: `Successfully imported ${imported.length} books. ${cant_import.length} books couldn't be imported.`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error importing Goodreads data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
