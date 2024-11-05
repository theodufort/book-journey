"use server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";

// Initialize OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the handler for POST requests
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const autoFormat = formData.get('autoFormat') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'Missing audio file in request.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file
    const tempFilePath = `temp-${Date.now()}.mp3`;
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Call OpenAI's transcription API
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        response_format: autoFormat ? "verbose_json" : "text",
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return NextResponse.json({ 
        text: response,
        autoFormatted: autoFormat 
      });
    } catch (error) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }

    // Create a ReadableStream to return to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Iterate over the streamed response from OpenAI
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    // Return the streamed response to the client
    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error in OpenAI API route:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// Optionally, define the handler for other HTTP methods
export async function GET(request: Request) {
  return NextResponse.json({ message: "OpenAI API route is working." });
}
