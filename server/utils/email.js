import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a verification email with a 6-digit code.
 * @param {string} to       - Recipient email address
 * @param {string} code     - Raw 6-digit code (NEVER log this)
 * @param {string} name     - Admin's full name for personalisation
 */
export async function sendVerificationEmail(to, code, name = "Admin") {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your Verification Code</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

              <!-- Header -->
              <tr>
                <td style="background:#1e3a5f;padding:28px 40px;text-align:center;">
                  <p style="margin:0;color:#93c5fd;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">
                    Admin Portal
                  </p>
                  <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">
                    Pakistan Mock Test Platform
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px 32px;">
                  <p style="margin:0 0 8px;color:#374151;font-size:15px;">
                    Hi <strong>${name}</strong>,
                  </p>
                  <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                    Use the code below to verify your admin account.
                    It expires in <strong>10 minutes</strong>.
                  </p>

                  <!-- Code box -->
                  <div style="background:#f0f4ff;border:2px solid #dbeafe;border-radius:10px;
                              padding:28px;text-align:center;margin-bottom:28px;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;letter-spacing:2px;
                               text-transform:uppercase;font-weight:600;">
                      Verification Code
                    </p>
                    <span style="font-size:42px;font-weight:800;letter-spacing:12px;
                                 color:#1e3a5f;font-family:monospace;">
                      ${code}
                    </span>
                  </div>

                  <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                    If you did not request this code, you can safely ignore this email.
                    Do <strong>not</strong> share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                            padding:18px 40px;text-align:center;">
                  <p style="margin:0;color:#d1d5db;font-size:11px;">
                    © ${new Date().getFullYear()} Pakistan Mock Test Platform &nbsp;·&nbsp;
                    Authorised access only
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Pakistan Mock Test Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Admin Verification Code",
    html,
  });
}
