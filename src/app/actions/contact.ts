"use server";

import { sendContactEmail, ContactEmailParams } from "@/lib/email";

export interface ContactActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitContactInquiryAction(params: ContactEmailParams): Promise<ContactActionResult> {
  try {
    if (!params.name || !params.name.trim()) {
      return { success: false, error: "Please enter your full name." };
    }
    if (!params.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!params.phone || !params.phone.trim()) {
      return { success: false, error: "Please provide a contact phone number." };
    }
    if (!params.message || !params.message.trim()) {
      return { success: false, error: "Please describe your product inquiry or requirements." };
    }

    const emailRes = await sendContactEmail(params);
    if (!emailRes.success) {
      return { success: false, error: emailRes.error || "Failed to deliver message." };
    }

    return {
      success: true,
      message: "Thank you! Your message has been sent to our commercial sales desk. We will respond promptly.",
    };
  } catch (error: unknown) {
    console.error("submitContactInquiryAction error:", error);
    const errMessage = error instanceof Error ? error.message : "Unexpected error";
    return { success: false, error: errMessage };
  }
}
