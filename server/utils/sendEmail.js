import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, htmlBody) {
  try {
    const result = await transporter.sendMail({
      from: `"Pakistan Mock Test Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    });
    return result;
  } catch (err) {
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
