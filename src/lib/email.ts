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
  const host = process.env.SMTP_HOST?.trim().replace(/[\r\n]/g, "");
  const port = Number(process.env.SMTP_PORT?.trim().replace(/[\r\n]/g, "")) || 465;
  const user = process.env.SMTP_USER?.trim().replace(/[\r\n]/g, "");
  const pass = process.env.SMTP_PASS?.trim().replace(/[\r\n]/g, "");
  const rawFrom = process.env.SMTP_FROM?.trim().replace(/[\r\n]/g, "");
  const from = rawFrom || (user ? `"Khatu Shyam Trading Co." <${user}>` : `"Khatu Shyam Trading Co." <noreply@khatushyamtrading.com>`);

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
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
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

export interface ContactEmailParams {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Dispatches contact inquiry messages to official administrator email (kstradingco88@gmail.com)
 */
export async function sendContactEmail(
  params: ContactEmailParams
): Promise<{ success: boolean; devMode: boolean; error?: string }> {
  const host = process.env.SMTP_HOST?.trim().replace(/[\r\n]/g, "");
  const port = Number(process.env.SMTP_PORT?.trim().replace(/[\r\n]/g, "")) || 465;
  const user = process.env.SMTP_USER?.trim().replace(/[\r\n]/g, "");
  const pass = process.env.SMTP_PASS?.trim().replace(/[\r\n]/g, "");
  const rawFrom = process.env.SMTP_FROM?.trim().replace(/[\r\n]/g, "");
  const from =
    rawFrom ||
    (user
      ? `"KSTC Website Inquiries" <${user}>`
      : `"KSTC Website Inquiries" <noreply@khatushyamtrading.com>`);
  const adminEmail = "kstradingco88@gmail.com";

  if (!host || !user || !pass) {
    console.log("\n========================================");
    console.log(`📩 [KSTC CONTACT INQUIRY - DEV LOG]`);
    console.log(`👤 Name   : ${params.name}`);
    console.log(`📧 Email  : ${params.email}`);
    console.log(`📞 Phone  : ${params.phone}`);
    console.log(`💬 Message: ${params.message}`);
    console.log("========================================\n");
    return { success: true, devMode: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5EEE8; border-radius: 12px;">
        <h2 style="color: #0F8A63; border-bottom: 2px solid #0F8A63; padding-bottom: 8px;">New Customer Inquiry &bull; KSTC Web Store</h2>
        <p><strong>Name:</strong> ${params.name}</p>
        <p><strong>Email:</strong> ${params.email}</p>
        <p><strong>Phone:</strong> ${params.phone}</p>
        <p><strong>Message / Product Requirements:</strong></p>
        <div style="background-color: #FAF8F2; padding: 15px; border-radius: 8px; border-left: 4px solid #0F8A63;">
          ${params.message.replace(/\n/g, "<br>")}
        </div>
        <p style="font-size: 11px; color: #888; margin-top: 24px;">Sent from Khatu Shyam Trading Co. Website Contact Form</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: adminEmail,
      replyTo: params.email,
      subject: `New Inquiry from ${params.name} (${params.phone})`,
      text: `Inquiry from ${params.name}\nEmail: ${params.email}\nPhone: ${params.phone}\n\nMessage:\n${params.message}`,
      html,
    });

    return { success: true, devMode: false };
  } catch (error: unknown) {
    console.error("Failed to send contact inquiry email:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to dispatch email";
    return { success: false, devMode: false, error: errMessage };
  }
}

export interface TemporaryBillEmailParams {
  email: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  temporaryBillUrl: string;
}

/**
 * Dispatches order confirmation with the mandatory temporary bill notice
 */
export async function sendTemporaryBillEmail(
  params: TemporaryBillEmailParams
): Promise<{ success: boolean; devMode: boolean; error?: string }> {
  const host = process.env.SMTP_HOST?.trim().replace(/[\r\n]/g, "");
  const port = Number(process.env.SMTP_PORT?.trim().replace(/[\r\n]/g, "")) || 465;
  const user = process.env.SMTP_USER?.trim().replace(/[\r\n]/g, "");
  const pass = process.env.SMTP_PASS?.trim().replace(/[\r\n]/g, "");
  const rawFrom = process.env.SMTP_FROM?.trim().replace(/[\r\n]/g, "");
  const from =
    rawFrom ||
    (user
      ? `"Khatu Shyam Trading Co." <${user}>`
      : `"Khatu Shyam Trading Co." <billing@khatushyamtrading.com>`);

  const formatPrice = (amt: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

  if (!host || !user || !pass) {
    console.log("\n========================================");
    console.log(`🧾 [TEMPORARY BILL DISPATCH - DEV LOG]`);
    console.log(`👤 Customer    : ${params.customerName} (${params.email})`);
    console.log(`📦 Order Ref    : ${params.orderNumber}`);
    console.log(`💰 Total Paid   : ${formatPrice(params.totalAmount)}`);
    console.log(`🔗 Temp Bill URL: ${params.temporaryBillUrl}`);
    console.log(
      `⚠️  Notice       : "This bill is system generated and temporary, your real bill will be sent to your provided email-id or mobile number soon."`
    );
    console.log("========================================\n");
    return { success: true, devMode: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5EEE8; border-radius: 16px; background: #FFFFFF;">
        <div style="background: #0F8A63; padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Khatu Shyam Trading Co.</h2>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Authorized Wholesale Distributor</p>
        </div>

        <div style="padding: 24px 8px;">
          <h3 style="color: #18231F; margin-top: 0;">Thank you for your order, ${params.customerName}!</h3>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            We have successfully received your order <strong>#${params.orderNumber}</strong> for the amount of <strong>${formatPrice(params.totalAmount)}</strong>.
          </p>

          <div style="background: #FEF3C7; border: 2px dashed #D97706; color: #92400E; padding: 14px; border-radius: 12px; margin: 20px 0; font-size: 12px; font-weight: bold; line-height: 1.5;">
            ⚠️ Notice: This bill is system generated and temporary, your real bill will be sent to your provided email-id or mobile number soon.
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${params.temporaryBillUrl}" target="_blank" style="background: #0F8A63; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              View &amp; Download Temporary Bill &rarr;
            </a>
          </div>

          <p style="color: #666; font-size: 12px; line-height: 1.5;">
            Our billing team in Central Warehouse is currently reviewing your order. Once dispatch begins, the official finalized GST Tax Invoice will be uploaded and sent directly to you.
          </p>
        </div>

        <div style="border-top: 1px solid #E5EEE8; padding-top: 16px; text-align: center; font-size: 11px; color: #888;">
          Khatu Shyam Trading Co. &bull; Vaibhav Enclave, Maharajpura, Gwalior &bull; +91 93404 86840
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: params.email,
      subject: `Order Confirmed & Temporary Bill #${params.orderNumber} - Khatu Shyam Trading Co.`,
      text: `Thank you for your order #${params.orderNumber} of ${formatPrice(params.totalAmount)}!\n\nThis bill is system generated and temporary, your real bill will be sent to your provided email-id or mobile number soon.\n\nView temporary bill: ${params.temporaryBillUrl}`,
      html,
    });

    return { success: true, devMode: false };
  } catch (err: unknown) {
    console.error("sendTemporaryBillEmail error:", err);
    return { success: false, devMode: false, error: err instanceof Error ? err.message : "Email error" };
  }
}

export interface RealBillEmailParams {
  email: string;
  customerName: string;
  orderNumber: string;
  realBillUrl: string;
  filename?: string;
}

/**
 * Dispatches official real tax invoice uploaded by the business owner / admin
 */
export async function sendRealBillEmail(
  params: RealBillEmailParams
): Promise<{ success: boolean; devMode: boolean; error?: string }> {
  const host = process.env.SMTP_HOST?.trim().replace(/[\r\n]/g, "");
  const port = Number(process.env.SMTP_PORT?.trim().replace(/[\r\n]/g, "")) || 465;
  const user = process.env.SMTP_USER?.trim().replace(/[\r\n]/g, "");
  const pass = process.env.SMTP_PASS?.trim().replace(/[\r\n]/g, "");
  const rawFrom = process.env.SMTP_FROM?.trim().replace(/[\r\n]/g, "");
  const from =
    rawFrom ||
    (user
      ? `"KSTC Billing Department" <${user}>`
      : `"KSTC Billing Department" <billing@khatushyamtrading.com>`);

  if (!host || !user || !pass) {
    console.log("\n========================================");
    console.log(`📄 [REAL OFFICIAL BILL DISPATCH - DEV LOG]`);
    console.log(`👤 Customer    : ${params.customerName} (${params.email})`);
    console.log(`📦 Order Ref    : ${params.orderNumber}`);
    console.log(`📎 Real Bill Doc: ${params.realBillUrl}`);
    console.log(`✨ Status       : Real official bill dispatched to customer successfully`);
    console.log("========================================\n");
    return { success: true, devMode: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5EEE8; border-radius: 16px; background: #FFFFFF;">
        <div style="background: #18231F; padding: 20px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px; color: #34D399;">Khatu Shyam Trading Co.</h2>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #E5EEE8;">Official Real Tax Invoice</p>
        </div>

        <div style="padding: 24px 8px;">
          <h3 style="color: #18231F; margin-top: 0;">Dear ${params.customerName},</h3>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Thank you for purchasing with Khatu Shyam Trading Co.! Your official finalized GST Tax Invoice for order <strong>#${params.orderNumber}</strong> has been prepared and released by our central billing team.
          </p>

          <div style="background: #DCF5E9; border: 1px solid #0F8A63; color: #0F8A63; padding: 14px; border-radius: 12px; margin: 20px 0; font-size: 13px; font-weight: bold; text-align: center;">
            ✅ Official Final Real Bill Available for Download
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${params.realBillUrl}" target="_blank" style="background: #0F8A63; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Download Official Real Bill (PDF/Image) &rarr;
            </a>
          </div>

          <p style="color: #666; font-size: 12px; line-height: 1.5;">
            You can also log in to your account at any time on our website to view all historical tax invoices.
          </p>
        </div>

        <div style="border-top: 1px solid #E5EEE8; padding-top: 16px; text-align: center; font-size: 11px; color: #888;">
          Khatu Shyam Trading Co. &bull; Vaibhav Enclave, Maharajpura, Gwalior &bull; +91 93404 86840
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: params.email,
      subject: `Official Real Tax Invoice - Order #${params.orderNumber} | Khatu Shyam Trading Co.`,
      text: `Dear ${params.customerName},\n\nThank you for purchasing with Khatu Shyam Trading Co.! Your official finalized GST Tax Invoice for order #${params.orderNumber} has been uploaded.\n\nDownload official bill: ${params.realBillUrl}`,
      html,
    });

    return { success: true, devMode: false };
  } catch (err: unknown) {
    console.error("sendRealBillEmail error:", err);
    return { success: false, devMode: false, error: err instanceof Error ? err.message : "Email error" };
  }
}
