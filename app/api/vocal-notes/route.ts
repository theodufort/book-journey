import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { userId, startTime, endTime, textContent } = await request.json();

    // Insert into database and get the generated UUID
    const { data, error } = await supabase
      .from('vocal_notes')
      .insert({
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        endpoint_url: '',
        text_content: textContent
      })
      .select('id')
      .single();

    if (error) throw error;

    const id = data.id;
    
    // Update the endpoint_url with the generated UUID
    const { error: updateError } = await supabase
      .from('vocal_notes')
      .update({ endpoint_url: `${id}.mp3` })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating vocal note:', error);
    return NextResponse.json(
      { error: 'Failed to create vocal note' },
      { status: 500 }
    );
  }
}
