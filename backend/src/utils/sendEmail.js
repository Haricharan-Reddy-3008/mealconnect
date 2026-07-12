import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.warn(`[EMAIL] SMTP not configured. Skipping email to ${to}`);
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email error:", error.message);
  }
};
