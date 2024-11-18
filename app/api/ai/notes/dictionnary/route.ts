"use server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the handler for POST requests
export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Missing "message" in request body.' },
        { status: 400 }
      );
    }

    // Prepare the messages for OpenAI
    const messages: any = [
      {
        role: "system",
        content:
          "You are a dictionary assistant. For any word provided, give its definition, pronunciation, part of speech, etymology, and example usage. Format your response in markdown with clear headings for each section.",
      },
      {
        role: "system",
        content: "You return your data in markdown format as a listicle.",
      },
      { role: "user", content: message },
    ];

    // Call OpenAI's ChatCompletion API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
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
