"use server";

import axios from "axios";

export async function POST(request: any) {
  try {
    // Parse the incoming request body
    const { first_name, email_address } = await request.json();

    // Ensure both first_name and email_address are provided
    if (!first_name || !email_address) {
      return new Response(
        JSON.stringify({ error: "first_name and email_address are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Predefined subscriber data
    const subscriberData = {
      first_name,
      email_address,
      state: "active",
    };

    // Set up the headers with your ConvertKit access token
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Kit-Api-Key": process.env.CONVERTKIT_API_KEY,
    };

    // Send a POST request to ConvertKit's API to add a new subscriber
    const response = await axios.post(
      "https://api.kit.com/v4/subscribers",
      subscriberData,
      { headers }
    );

    // Return the response from ConvertKit's API
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors and return an appropriate response
    console.error(error);
    const status = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data
      : { error: error.message };
    return new Response(JSON.stringify(errorMessage), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
