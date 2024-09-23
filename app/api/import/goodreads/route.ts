import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    if (!files.file || Array.isArray(files.file)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const file = files.file;
    const zip = new AdmZip(file.filepath);
    const csvEntry = zip.getEntries().find(entry => entry.entryName.endsWith('.csv'));

    if (!csvEntry) {
      return NextResponse.json({ error: 'No CSV file found in the zip' }, { status: 400 });
    }

    const csvContent = csvEntry.getData().toString('utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    for (const record of records) {
      await prisma.book.create({
        data: {
          title: record['Title'],
          author: record['Author'],
          isbn: record['ISBN13'],
          myRating: parseInt(record['My Rating']) || 0,
          averageRating: parseFloat(record['Average Rating']) || 0,
          dateRead: record['Date Read'] ? new Date(record['Date Read']) : null,
          dateAdded: record['Date Added'] ? new Date(record['Date Added']) : null,
          shelves: record['Bookshelves'],
          numberOfPages: parseInt(record['Number of Pages']) || 0,
        },
      });
    }

    await fs.unlink(file.filepath);

    return NextResponse.json({ message: 'Import successful' }, { status: 200 });
  } catch (error) {
    console.error('Error importing Goodreads data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
