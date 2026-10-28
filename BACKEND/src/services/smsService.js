import { ENV } from "../config/env.js";

/**
 * Base SMS Provider Interface
 */
class BaseSmsProvider {
  async sendSms({ to, message }) {
    throw new Error("sendSms must be implemented by provider");
  }
}

/**
 * Mock SMS Provider for local development & testing without cost
 */
class MockSmsProvider extends BaseSmsProvider {
  async sendSms({ to, message }) {
    console.log(`[SMS-SERVICE (MOCK)] Provider: mock | To: ${to} | Sender: ${ENV.SMS_SENDER_ID}`);
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      provider: "mock",
    };
  }
}

/**
 * Free2SMS Provider (https://free2sms.com)
 * API Docs: POST https://free2sms.com/api/v1/send
 */
class Free2SmsProvider extends BaseSmsProvider {
  async sendSms({ to, message }) {
    try {
      const apiKey = (ENV.SMS_API_KEY || "").trim();
      if (!apiKey || apiKey === "dummy_sms_api_key" || apiKey === "mock_sms_key") {
        console.warn("[Free2SMS] Missing valid SMS_API_KEY in .env");
        return { success: false, error: "Missing SMS_API_KEY" };
      }

      // 10-digit Indian mobile number
      const cleanPhone = to.replace(/[^0-9]/g, "").slice(-10);

      const payload = {
        numbers: cleanPhone,
        message,
        sender_id: ENV.SMS_SENDER_ID || "FSTSMS",
        route: ENV.SMS_ROUTE || "transactional",
      };

      if (ENV.SMS_TEMPLATE_ID) {
        payload.template_id = Number(ENV.SMS_TEMPLATE_ID);
      }

      const response = await fetch("https://free2sms.com/api/v1/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        console.log(`[Free2SMS] SMS sent to ${cleanPhone}:`, data.reference || data.sms_log_id);
        return { success: true, messageId: data.reference, provider: "free2sms" };
      } else {
        console.warn(`[Free2SMS Warning]: ${data.error || data.message}`);
        if (data.details?.code === "INVALID_SENDER") {
          console.warn(`[Free2SMS Tip]: Add Sender ID "${ENV.SMS_SENDER_ID}" under DLT Templates in your free2sms.com dashboard.`);
        }
        return { success: false, error: data.error || data.message, details: data.details };
      }
    } catch (err) {
      console.error(`[Free2SMS Exception]:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async checkBalance() {
    try {
      const apiKey = (ENV.SMS_API_KEY || "").trim();
      const response = await fetch("https://free2sms.com/api/v1/balance", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

/**
 * Fast2SMS Provider (India-friendly, No DLT required on Quick route, https://www.fast2sms.com)
 */
class Fast2SmsProvider extends BaseSmsProvider {
  async sendSms({ to, message }) {
    try {
      const apiKey = (ENV.SMS_API_KEY || "").trim();
      if (!apiKey || apiKey === "mock_sms_key" || apiKey === "dummy_sms_api_key") {
        console.warn("[Fast2SMS] Missing valid SMS_API_KEY in .env");
        return { success: false, error: "Missing SMS_API_KEY" };
      }

      // Fast2SMS takes 10-digit Indian phone numbers
      const cleanPhone = to.replace(/[^0-9]/g, "").slice(-10);

      if (!cleanPhone || cleanPhone.length !== 10) {
        console.warn(`[Fast2SMS] Phone number "${to}" is not a valid 10-digit Indian number.`);
        return { success: false, error: "Invalid 10-digit Indian mobile number" };
      }

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          route: "q", // Quick SMS: No DLT template approval needed!
          message,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[Fast2SMS Success]: Real mobile SMS dispatched to +91-${cleanPhone}!`);
        console.log(`[Fast2SMS Request ID]:`, data.request_id || "SUCCESS");
        return { success: true, messageId: data.request_id, provider: "fast2sms" };
      } else {
        const errorMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Unknown error");
        if (typeof errorMsg === "string" && (errorMsg.includes("100 INR") || errorMsg.includes("transaction"))) {
          console.warn(`[Fast2SMS Notice]: Fast2SMS requires a one-time ₹100 wallet recharge on fast2sms.com to activate automated API carrier delivery.`);
          console.log(`[SMS-STATUS]: Terminal log above captures the full SMS payload for college viva/demo evaluation.`);
        } else {
          console.error(`[Fast2SMS Error]:`, errorMsg);
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error(`[Fast2SMS Exception]:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async checkBalance() {
    try {
      const apiKey = (ENV.SMS_API_KEY || "").trim();
      const response = await fetch("https://www.fast2sms.com/dev/wallet", {
        headers: { authorization: apiKey },
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

/**
 * Twilio SMS Provider (Global, https://www.twilio.com)
 */
class TwilioSmsProvider extends BaseSmsProvider {
  async sendSms({ to, message }) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || ENV.SMS_API_KEY;
      const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || ENV.SMS_SENDER_ID;

      if (!accountSid || !authToken || !fromNumber) {
        console.warn("[Twilio] Missing Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)");
        return { success: false, error: "Missing Twilio credentials" };
      }

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const body = new URLSearchParams({
        To: to.startsWith("+") ? to : `+91${to.replace(/[^0-9]/g, "").slice(-10)}`,
        From: fromNumber,
        Body: message,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Twilio SMS] Sent to ${to}, SID: ${data.sid}`);
        return { success: true, messageId: data.sid, provider: "twilio" };
      } else {
        console.error(`[Twilio Error]:`, data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error(`[Twilio Exception]:`, err.message);
      return { success: false, error: err.message };
    }
  }
}

class SmsService {
  constructor() {
    this.provider = this.createProvider(ENV.SMS_PROVIDER);
  }

  createProvider(providerName) {
    switch (providerName?.toLowerCase()) {
      case "free2sms":
        return new Free2SmsProvider();
      case "fast2sms":
        return new Fast2SmsProvider();
      case "twilio":
        return new TwilioSmsProvider();
      case "mock":
      default:
        return new MockSmsProvider();
    }
  }

  async sendSms({ to, message }) {
    try {
      if (!to) {
        console.warn("[SmsService] Missing recipient phone number");
        return { success: false, error: "Missing recipient phone" };
      }

      // ALWAYS print the prominent formatted SMS console log so examiners & developers see the exact ticket SMS
      console.log("\n==================== [CINEMATIC SMS NOTIFICATION] ====================");
      console.log(`[SMS-RECIPIENT]: ${to}`);
      console.log(`[SMS-PROVIDER ]: ${ENV.SMS_PROVIDER || "mock"}`);
      console.log(`[SMS-MESSAGE]: ${message}`);
      console.log("======================================================================\n");

      return await this.provider.sendSms({ to, message });
    } catch (err) {
      console.error(`[SmsService Error]: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async checkBalance() {
    if (this.provider?.checkBalance) {
      return await this.provider.checkBalance();
    }
    return { success: true, message: "Mock provider active", wallet_balance: 9999 };
  }

  async sendBookingConfirmation(phone, bookingId, movieTitle, showTime) {
    const text = `CinePass: Booking ${bookingId} for ${movieTitle} at ${showTime} confirmed. Enjoy your movie!`;
    return this.sendSms({ to: phone, message: text });
  }
}

export const smsService = new SmsService();
