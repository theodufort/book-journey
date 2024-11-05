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
    const { inputSpeech } = await request.json();

    if (!inputSpeech) {
      return NextResponse.json(
        { error: 'Missing "message" in request body.' },
        { status: 400 }
      );
    }

    // Call OpenAI's ChatCompletion API
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream("audio.mp3"),
      model: "whisper-1",
      response_format: "verbose_json",
    });

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
