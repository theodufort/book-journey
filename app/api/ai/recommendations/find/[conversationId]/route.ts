import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;

  try {
    // Fetch the conversation from Supabase by ID
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }

    // Return the messages in the conversation
    return NextResponse.json({ messages: data.messages });
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation." },
      { status: 500 }
    );
  }
}
