import { parse } from "csv-parse/sync";
import { NextRequest, NextResponse } from "next/server";

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

    const buffer = await file.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
    const csvEntry = zip
      .getEntries()
      .find((entry) => entry.entryName.endsWith(".csv"));

    if (!csvEntry) {
      return NextResponse.json(
        { error: "No CSV file found in the zip" },
        { status: 400 }
      );
    }

    const csvContent = csvEntry.getData().toString("utf8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    for (const record of records) {
    }

    return NextResponse.json({ message: "Import successful" }, { status: 200 });
  } catch (error) {
    console.error("Error importing Goodreads data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
