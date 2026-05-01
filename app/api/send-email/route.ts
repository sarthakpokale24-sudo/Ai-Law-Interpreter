import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, report, pdfBase64 } = await req.json();

    if (!email || !report) {
      return NextResponse.json({ error: 'Missing email or report data' }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not found in .env.local.");
      return NextResponse.json({ success: true, message: 'Simulated email send' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions: any = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Legal Analysis Report: ${report.title}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4c1d95;">AI Law Interpreter</h2>
          <h3 style="color: #111827;">${report.title}</h3>
          <p>Please find your official, beautifully formatted PDF report attached to this email.</p>
        </div>
      `
    };

    // Attach the PDF if provided
    if (pdfBase64) {
      const base64Data = pdfBase64.split(',')[1] || pdfBase64;
      mailOptions.attachments = [
        {
          filename: `Analysis_Report_${new Date().getTime()}.pdf`,
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'application/pdf'
        }
      ];
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
