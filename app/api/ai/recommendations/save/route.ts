"use server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to save or update the conversation
async function saveOrUpdateConversation(
  conversation: any,
  conversationId?: string,
  replace: boolean = false
) {
  if (conversationId) {
    // Check if conversation with the given ID exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from("ai_conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error("Error checking existing conversation");
    }

    if (existingConversation) {
      // Update the existing conversation
      const updatedMessages = replace ? conversation : [...existingConversation.messages, ...conversation];
      const { error: updateError } = await supabase
        .from("ai_conversations")
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (updateError) {
        throw new Error("Failed to update conversation");
      }

      return conversationId; // Return the same conversation ID after updating
    }
  }

  // If conversationId is not provided or conversation does not exist, insert a new conversation
  const { data, error: insertError } = await supabase
    .from("ai_conversations")
    .insert([{ messages: conversation }])
    .select();

  if (insertError) {
    throw new Error("Failed to save new conversation");
  }

  return data[0].id; // Return the UUID of the newly created conversation
}

// The POST handler for saving or updating a conversation
export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { conversation, conversationId, replace } = await request.json();

    // Validate that the conversation data is present
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Missing or invalid conversation data" },
        { status: 400 }
      );
    }

    // Save or update the conversation in Supabase
    const finalConversationId = await saveOrUpdateConversation(
      conversation,
      conversationId,
      replace
    );

    // Respond with the UUID of the saved/updated conversation
    return NextResponse.json(
      { conversationId: finalConversationId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in saving/updating conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
