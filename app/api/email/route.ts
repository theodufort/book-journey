import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import FirstBookTemplate from "./templates/FirstBookTemplate";
import WeeklyUpdateTemplate from "./templates/WeeklyUpdateTemplate";
import MonthlyDigestTemplate from "./templates/MonthlyDigestTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { user, emailType } = await request.json();

    let subject: string;
    let Template: React.FC;

    switch (emailType) {
      case "firstBook":
        subject = "Congrats on adding your first book!";
        Template = FirstBookTemplate;
        break;
      case "weeklyUpdate":
        subject = "Your weekly reading update";
        Template = WeeklyUpdateTemplate;
        break;
      case "monthlyDigest":
        subject = "Monthly reading digest";
        Template = MonthlyDigestTemplate;
        break;
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "welcome@mybookquest.com",
      to: user?.email || "theodufort05@gmail.com",
      subject: subject,
      react: Template(),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
