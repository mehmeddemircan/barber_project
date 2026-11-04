import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type IncomingMessage = {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
};

type WebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: IncomingMessage[] };
    }>;
  }>;
};

function hasValidSignature(body: string, signature: string, appSecret: string) {
  if (!signature.startsWith("sha256=")) return false;

  const expected = Buffer.from(`sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`);
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function getAutoReply(message: string) {
  const english = /\b(hi|hello|hey|appointment|booking|price|service|thanks)\b/i.test(message);

  if (english) {
    return "Hi, welcome to KÖK. Barber Club! Our services are Classic Cut ₺650, Hair + Beard ₺950, and Beard Shape ₺450. Reply with the service and a day/time that works for you, and our team will get back to you shortly.";
  }

  return "Merhaba, KÖK. Berber Kulübü'ne hoş geldin! Hizmetlerimiz: Klasik kesim ₺650, Saç + Sakal ₺950, Sakal tasarımı ₺450. Randevu için istediğin hizmeti, gün ve saati yazabilirsin; ekibimiz en kısa sürede dönüş yapacak.";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json({ message: "WhatsApp webhook verification is not configured." }, { status: 503 });
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({ message: "Webhook verification failed." }, { status: 403 });
}

export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!appSecret || !accessToken || !phoneNumberId || !apiVersion || !process.env.MONGODB_URI) {
    return NextResponse.json({ message: "WhatsApp webhook is not configured." }, { status: 503 });
  }

  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    return NextResponse.json({ message: "WhatsApp Graph API version is invalid." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") || "";
  if (!hasValidSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ message: "Invalid webhook payload." }, { status: 400 });
  }

  const messages = payload.entry?.flatMap((entry) => entry.changes?.flatMap((change) => change.value?.messages || []) || []) || [];
  if (messages.length === 0) return NextResponse.json({ received: true });

  try {
    const client = await connectToDatabase();
    const processedMessages = client.db(process.env.MONGODB_DB || "kok_barber").collection("whatsapp_processed_messages");
    await processedMessages.createIndex({ messageId: 1 }, { unique: true });
    await processedMessages.createIndex({ receivedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

    for (const message of messages) {
      if (message.type !== "text" || !message.id || !message.from || !message.text?.body) continue;

      try {
        await processedMessages.insertOne({ messageId: message.id, receivedAt: new Date() });
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) continue;
        throw error;
      }

      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: message.from,
          type: "text",
          text: { body: getAutoReply(message.text.body) },
        }),
      });

      if (!response.ok) {
        await processedMessages.deleteOne({ messageId: message.id });
        console.error("WhatsApp reply request failed with status:", response.status);
        return NextResponse.json({ message: "WhatsApp reply could not be sent." }, { status: 502 });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    console.error("WhatsApp webhook processing failed.");
    return NextResponse.json({ message: "WhatsApp webhook processing failed." }, { status: 500 });
  }
}