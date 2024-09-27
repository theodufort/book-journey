import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const InactivityTemplate = () => {
  return (
    <div className="container">
      <p>Hi,</p>
      <p>
        It looks like it's been a while since your last sign-in! We wanted to
        check in and see if everything is okay.
      </p>
      <p>
        If you have any questions or need help discovering more books that match
        your tastes, feel free to reach out or schedule a{" "}
        <strong>15-minute call</strong> with us. We’d be happy to walk you
        through the platform or suggest new books for your library.
      </p>
      <p>Click the link below to schedule a time:</p>
      <a href="https://calendly.com/expoweb/15-minutes-onboarding">
        Schedule a 15-Minute Call
      </a>
      <p>
        As always, you can reach me directly at{" "}
        <a href="mailto:info@mybookquest.com">info@mybookquest.com</a> with any
        immediate questions.
      </p>
      <p>
        Keep adding to your collection, and let’s explore even more exciting
        books together!
      </p>
      <p>
        Best regards,
        <br />
        Theo Dufort
        <br />
        Founder, MyBookQuest
      </p>
      <p>
        MyBookQuest | <a href="https://mybookquest.com">Visit our website</a>
      </p>
    </div>
  );
};

// Supabase credentials (use environment variables)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to check inactive users who haven't logged in within `days` days
async function checkInactiveUsers(days) {
  const threeDaysAgo = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString(); // Calculate the date `days` ago

  const { data, error } = await supabase
    .from("profiles") // Querying the 'profiles' table
    .select("id, email, created_at, last_sign_in_at")
    .lte("created_at", threeDaysAgo) // Signed up more than `days` ago
    .or("last_sign_in_at.is.null,last_sign_in_at.lte." + threeDaysAgo)
    .eq("inactivity_email_sent", false); // Either no login (null) or last login more than `days` ago

  if (error) {
    console.error("Error fetching inactive users:", error);
  } else {
    console.log("Inactive users:", data);

    for (const x of data) {
      // Add a delay between sending emails to avoid hitting the rate limit
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms between emails

      // Update inactivity_email_sent to true
      await supabase
        .from("profiles")
        .update({ inactivity_email_sent: true })
        .eq("id", x.id);

      // Send email using Resend
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: "MyBookQuest Progress <info@mybookquest.com>",
        to: x?.email,
        subject: "It's been a while!",
        react: InactivityTemplate(),
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
      } else {
        console.log("Email sent to:", x.email, emailData);
      }
    }
  }
}

// Scheduler to run the check every hour
async function runScheduler() {
  const daysToCheck = 3; // Adjust this value if needed

  while (true) {
    await checkInactiveUsers(daysToCheck);
    console.log("Waiting for 1 hour...");
    await new Promise((resolve) => setTimeout(resolve, 60 * 60 * 1000)); // Wait for 1 hour
  }
}

// Start the scheduler
runScheduler();
