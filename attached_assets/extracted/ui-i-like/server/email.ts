import nodemailer from "nodemailer";
import { randomInt } from "crypto";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function generateOTP(): string {
  return String(randomInt(100000, 999999));
}

export async function sendOTPEmail(to: string, otp: string, purpose: string = "verify"): Promise<boolean> {
  const subject = purpose === "login"
    ? "Sai Rolotech - Login OTP"
    : "Sai Rolotech - Email Verification";

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #6366f1; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">S</div>
        <h2 style="margin: 12px 0 4px; color: #111;">Sai Rolotech</h2>
        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Industrial Ecosystem</p>
      </div>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
        <p style="color: #333; margin-bottom: 16px; font-size: 14px;">
          ${purpose === "login" ? "Your login verification code is:" : "Your email verification code is:"}
        </p>
        <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; margin: 16px 0;">${otp}</div>
        <p style="color: #999; font-size: 12px;">This code expires in 10 minutes</p>
      </div>
      <p style="color: #999; font-size: 11px; text-align: center;">
        If you didn't request this code, please ignore this email.<br>
        M/S Sai Rolotech, Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi 110041
      </p>
    </div>
  `;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL-OTP] To: ${to} | Code: ${otp} | Purpose: ${purpose}`);
    console.log("[EMAIL] SMTP not configured - OTP logged to console (test mode)");
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Sai Rolotech" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] OTP sent to ${to}`);
    return true;
  } catch (err: any) {
    console.error(`[EMAIL] Failed to send OTP to ${to}:`, err.message);
    console.log(`[EMAIL-OTP-FALLBACK] To: ${to} | Code: ${otp}`);
    return true;
  }
}

export async function sendApprovalNotification(to: string, isApproved: boolean): Promise<boolean> {
  const subject = isApproved
    ? "Sai Rolotech - Account Approved!"
    : "Sai Rolotech - Account Update";

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 48px; height: 48px; background: #6366f1; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">S</div>
        <h2 style="margin: 12px 0 4px; color: #111;">Sai Rolotech</h2>
      </div>
      <div style="background: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border-radius: 12px; padding: 24px; text-align: center;">
        <p style="font-size: 16px; font-weight: 600; color: ${isApproved ? '#059669' : '#dc2626'};">
          ${isApproved ? "Your account has been approved!" : "Your account status has been updated."}
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 12px;">
          ${isApproved ? "You can now login to the Sai Rolotech platform." : "Please contact support for more information."}
        </p>
      </div>
    </div>
  `;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL] Approval notification for ${to}: ${isApproved ? "APPROVED" : "PENDING"} (SMTP not configured)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"Sai Rolotech" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err: any) {
    console.error(`[EMAIL] Failed:`, err.message);
    return true;
  }
}
