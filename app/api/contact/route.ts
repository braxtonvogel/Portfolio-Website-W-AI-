import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>", // temporary dev sender
      to: CONTACT_EMAIL, // YOUR email from contact.ts
      subject: `New message from ${name}`,
      replyTo: email,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}

Message:
${message}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
console.log("CONTACT ROUTE HIT");