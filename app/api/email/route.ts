import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FirstBookTemplate } from "./templates/FirstBookTemplate";
import { WelcomeEmail } from "./templates/WelcomeTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { user, emailType } = await request.json();

    switch (emailType) {
      case "firstBook":
        const { data: fbData, error: dbError } = await resend.emails.send({
          from: "MyBookQuest Progress <info@mybookquest.com>",
          to: user?.email || "theodufort05@gmail.com",
          subject: "Congrats on adding your first book!",
          react: FirstBookTemplate() as React.ReactElement,
        });

        if (dbError) {
          return NextResponse.json({ dbError }, { status: 400 });
        }

        return NextResponse.json({ fbData });
      case "welcome":
        const { data: wData, error: wError } = await resend.emails.send({
          from: "Welcome to MybookQuest! <info@mybookquest.com>",
          to: user?.email || "theodufort05@gmail.com",
          subject: "Welcome to MyBookQuest!",
          react: WelcomeEmail() as React.ReactElement,
        });

        if (wError) {
          return NextResponse.json({ wError }, { status: 400 });
        }

        return NextResponse.json({ wData });
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
