import { parse } from "csv-parse/sync";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const csvContent = await file.text();
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    let importedCount = 0;

    for (const record of records) {
      const book = await prisma.book.create({
        data: {
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
          shelf: record.Exclusive_Shelf,
          review: record.My_Review || null,
        },
      });

      importedCount++;
    }

    return NextResponse.json({ message: `Successfully imported ${importedCount} books` }, { status: 200 });
  } catch (error) {
    console.error("Error importing Goodreads data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
