import { createTransport, type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || "587"),
      secure: smtpPort === "465",
      auth: { user: smtpUser, pass: smtpPass },
    });
    return transporter;
  }

  return null;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@sairolotech.com";
const COMPANY_NAME = "Sai Rolotech";

export async function sendOTPEmail(to: string, otp: string, username: string): Promise<boolean> {
  const subject = `${COMPANY_NAME} - Your Login OTP Code`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">${COMPANY_NAME} - Login Verification</h2>
      <p>Hello ${username},</p>
      <p>Your 2FA verification code is:</p>
      <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${otp}</span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p style="color: #6B7280; font-size: 12px;">If you did not request this code, please ignore this email or contact support.</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

export async function sendSuspiciousLoginAlert(to: string, username: string, details: { ip?: string; reason: string; timestamp: string }): Promise<boolean> {
  const subject = `${COMPANY_NAME} - Suspicious Login Alert`;
  const reasonText = details.reason === "new_device"
    ? "A login from a new/different device was detected on your account."
    : "A login at an unusual hour was detected on your account.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #DC2626;">${COMPANY_NAME} - Security Alert</h2>
      <p>Hello ${username},</p>
      <p>${reasonText}</p>
      <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
        <p style="margin: 4px 0;"><strong>Time:</strong> ${details.timestamp}</p>
        <p style="margin: 4px 0;"><strong>IP Address:</strong> ${details.ip || "Unknown"}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${details.reason === "new_device" ? "New device detected" : "Unusual login hour"}</p>
      </div>
      <p>If this was you, no action is needed. If you did not perform this login, please change your password immediately and contact support.</p>
      <p style="color: #6B7280; font-size: 12px;">This is an automated security alert from ${COMPANY_NAME}.</p>
    </div>
  `;

  return sendEmail(to, subject, html);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL-DEV] To: ${to}`);
    console.log(`[EMAIL-DEV] Subject: ${subject}`);
    console.log(`[EMAIL-DEV] (No SMTP configured - email not sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars to enable.)`);
    return false;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err);
    return false;
  }
}
