import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));
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

    return NextResponse.json({ message: 'Import successful' }, { status: 200 });
  } catch (error) {
    console.error('Error importing Goodreads data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
