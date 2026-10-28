import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

const emailUser = process.env.EMAIL_USER || ENV.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || ENV.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const sendEmail = async (email, subject, message) => {
  let to = email;
  let sub = subject;
  let html = message;

  if (typeof email === "object" && email !== null) {
    to = email.to;
    sub = email.subject;
    html = email.html || email.message || email.text;
  }

  const sender = process.env.EMAIL_USER || ENV.EMAIL_USER;

  if (!sender || !emailPass) {
    console.log(`[EmailService (MOCK)] Sending email to: ${to} | Subject: "${sub}"`);
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject: sub,
      html,
    });

    console.log("Email sent successfully");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const emailService = {
  sendEmail,
  transporter,

  async sendBookingConfirmation(user, booking, movie, theater, screen, show) {
    const seatList = booking.seats.map((s) => s.seatLabel).join(", ");
    const subject = `Booking Confirmed: ${movie.title} (${booking.bookingId})`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #4f46e5; color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 24px; }
          .ticket-card { background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #4f46e5; }
          .movie-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 600; text-align: right; }
          .total-box { background: #e0e7ff; padding: 14px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #3730a3; margin-top: 14px; }
          .qr-placeholder { text-align: center; margin: 24px 0 10px; padding: 16px; border: 2px dashed #cbd5e1; border-radius: 8px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CinePass Ticket Confirmation</h1>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Your booking is confirmed! Show this email at entry.</p>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for booking with CinePass! Here are your ticket details:</p>
            
            <div class="ticket-card">
              <div class="movie-title">${movie.title}</div>
              <div class="detail-row"><span class="label">Booking ID:</span> <span class="value">${booking.bookingId}</span></div>
              <div class="detail-row"><span class="label">Theater:</span> <span class="value">${theater.name}, ${theater.city}</span></div>
              <div class="detail-row"><span class="label">Screen:</span> <span class="value">${screen.name}</span></div>
              <div class="detail-row"><span class="label">Show Date & Time:</span> <span class="value">${show.showDate} at ${show.startTime}</span></div>
              <div class="detail-row"><span class="label">Seats:</span> <span class="value">${seatList} (${booking.ticketCount} tickets)</span></div>
              
              <div class="total-box">
                <span>Total Paid:</span>
                <span>$${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="qr-placeholder">
              <p style="margin: 0; font-size: 13px; color: #475569;">Booking Reference Barcode</p>
              <p style="margin: 6px 0 0; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #1e293b;">
                ${booking.bookingId}
              </p>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} CinePass Movie Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    return sendEmail(user.email, subject, html);
  },

  async sendPaymentReceipt(user, booking, amount) {
    const subject = `Payment Receipt - CinePass (${booking.bookingId})`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-top: 0;">Payment Successful</h2>
        <p>Dear ${user.name}, we received your payment of <strong>$${amount.toFixed(2)}</strong> for booking <strong>${booking.bookingId}</strong>.</p>
        <p>Your tickets have been issued and confirmed.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <small style="color: #64748b;">Transaction reference: ${booking.stripePaymentIntentId || "CARD-PROCESSED"}</small>
      </div>
    `;
    return sendEmail(user.email, subject, html);
  },
};

export { sendEmail, transporter };
export default sendEmail;
