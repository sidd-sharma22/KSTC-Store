import nodemailer from "nodemailer";

interface SendOtpResult {
  success: boolean;
  devMode: boolean;
  devOtp?: string;
  error?: string;
}

/**
 * Internal Email Dispatcher
 * Sends verification OTPs using standard SMTP (nodemailer) with a developer fallback mode.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<SendOtpResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || (user ? `"Khatu Shyam Trading Co." <${user}>` : `"Khatu Shyam Trading Co." <noreply@khatushyamtrading.com>`);

  // Dev / Fallback mode when SMTP credentials are not yet configured in .env
  if (!host || !user || !pass) {
    console.log("\n========================================");
    console.log(`🔑 [KSTC INTERNAL AUTH - DEV OTP]`);
    console.log(`📧 Target Email : ${email}`);
    console.log(`🔢 OTP Code     : ${otp}`);
    console.log(`⏱️  Validity     : 10 Minutes`);
    console.log("========================================\n");

    return {
      success: true,
      devMode: true,
      devOtp: otp,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF8F2; margin: 0; padding: 20px; color: #1F2937; }
            .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5EEE8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: #18231F; padding: 28px; text-align: center; color: #FFFFFF; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
            .header p { margin: 4px 0 0; font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px; }
            .body { padding: 32px 24px; text-align: center; }
            .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #18231F; }
            .subtitle { font-size: 14px; color: #64748B; margin-bottom: 24px; }
            .otp-box { background: #DCF5E9; border: 2px dashed #0F8A63; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 0 auto 24px; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F8A63; font-family: monospace; }
            .expiry-note { font-size: 13px; color: #64748B; margin-bottom: 24px; line-height: 1.5; }
            .footer { background: #FAF8F2; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E5EEE8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Khatu Shyam Trading Co.</h1>
              <p>Authorized Wholesale Distributor</p>
            </div>
            <div class="body">
              <div class="title">Verification Code</div>
              <div class="subtitle">Use the following One-Time Password (OTP) to complete your sign in.</div>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <div class="expiry-note">
                ⏱️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </div>
            </div>
            <div class="footer">
              If you did not request this OTP, you can safely ignore this email.<br>
              © ${new Date().getFullYear()} Khatu Shyam Trading Co. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: `Your KSTC Verification Code: ${otp}`,
      text: `Your KSTC verification code is: ${otp}. It is valid for 10 minutes.`,
      html: htmlContent,
    });

    return {
      success: true,
      devMode: false,
    };
  } catch (error: unknown) {
    console.error("Failed to send OTP email via SMTP:", error);
    const message = error instanceof Error ? error.message : "Failed to dispatch email";
    return {
      success: false,
      devMode: false,
      error: message,
    };
  }
}
