"use server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";

// Initialize OpenAI Configuration
const openai = new OpenAI({
  baseURL: "https://whisper.tedqc.cfd/v1/",
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the handler for POST requests
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const autoFormat = formData.get("autoFormat") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Missing audio file in request." },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer: any = Buffer.from(bytes);

    // Create temporary file
    const tempFilePath = `temp-${Date.now()}.mp3`;
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Call OpenAI's transcription API
      const transcriptionResponse: any =
        await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          // model: "whisper-1",
          model: "deepdml/faster-whisper-large-v3-turbo-ct2",
          response_format: "text",
        });

      // Convert the text response to string if needed
      const transcriptionText = (await transcriptionResponse)
        ? await transcriptionResponse.text
        : "";
      console.log(transcriptionResponse);
      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (autoFormat && transcriptionText) {
        // Format the transcription using ChatGPT
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "Format this transcribed text into clean markdown with proper paragraphs, punctuation, capitalization and standard markdown format. Preserve the original meaning and content, but make it more readable.",
            },
            {
              role: "user",
              content: transcriptionText,
            },
          ],
        });

        return NextResponse.json({
          text: completion.choices[0].message.content,
          autoFormatted: true,
        });
      }

      return NextResponse.json({
        // text: transcriptionText,
        text: transcriptionResponse,
        autoFormatted: false,
      });
    } catch (error) {
      // Clean up temp file in case of error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
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
