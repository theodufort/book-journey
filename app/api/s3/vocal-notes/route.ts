import { NextResponse } from "next/server";
import { R2 } from "node-cloudflare-r2";

const r2 = new R2({
  accountId: process.env.CLOUDFLARE_ACCOUNT,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY,
  secretAccessKey: process.env.CLOUDFLARE_ACCESS_SECRET,
});
// Initialize bucket instance
const bucket = r2.bucket("vocalnotes");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const id = formData.get("id") as string;

    if (!file || !id) {
      return NextResponse.json(
        { error: "File and ID are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await bucket.upload(buffer, `${id}.mp3`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
