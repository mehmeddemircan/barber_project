import { NextResponse } from "next/server";
import { isCalendarDate, isSundayDate } from "@/lib/appointment-dates";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const services = ["Klasik Kesim", "Saç + Sakal", "Sakal Tasarımı"] as const;
const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const serviceNames = {
  "Klasik Kesim": { tr: "Klasik Kesim", en: "Classic Cut" },
  "Saç + Sakal": { tr: "Saç + Sakal", en: "Hair + Beard" },
  "Sakal Tasarımı": { tr: "Sakal Tasarımı", en: "Beard Shape" },
} as const;

function istanbulDateValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

type Appointment = {
  name: string;
  phone: string;
  service: (typeof services)[number];
  date: string;
  time: string;
  whatsappOptIn: boolean;
  createdAt: Date;
};

type AppointmentPayload = Partial<Appointment> & { language?: "tr" | "en" };

function whatsappRecipient(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = `90${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

async function sendWhatsAppConfirmation(appointment: Appointment, language: "tr" | "en") {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;
  const templateName = language === "en"
    ? process.env.WHATSAPP_CONFIRMATION_TEMPLATE_EN
    : process.env.WHATSAPP_CONFIRMATION_TEMPLATE_TR;
  const recipient = whatsappRecipient(appointment.phone);

  if (!accessToken || !phoneNumberId || !apiVersion || !templateName || !recipient || !/^v\d+\.\d+$/.test(apiVersion)) return false;

  const serviceName = serviceNames[appointment.service][language];
  const dateLabel = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
    dateStyle: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date(`${appointment.date}T12:00:00+03:00`));

  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: language === "en" ? "en_US" : "tr" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: serviceName },
              { type: "text", text: dateLabel },
              { type: "text", text: appointment.time },
            ],
          }],
        },
      }),
    });

    if (!response.ok) console.error("WhatsApp confirmation failed with status:", response.status);
    return response.ok;
  } catch {
    console.error("WhatsApp confirmation request failed.");
    return false;
  }
}

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  const today = istanbulDateValue(new Date());

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isCalendarDate(date) || date < today) {
    return NextResponse.json({ message: "Geçerli bir tarih seçin." }, { status: 400 });
  }
  if (isSundayDate(date)) {
    return NextResponse.json({ message: "Pazar günleri randevu alınamıyor." }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const appointments = await client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection<Pick<Appointment, "time">>("appointments")
      .find({ date }, { projection: { _id: 0, time: 1 } })
      .toArray();

    return NextResponse.json({ date, bookedSlots: appointments.map((appointment) => appointment.time) });
  } catch {
    console.error("Randevu müsaitliği alınamadı.");
    return NextResponse.json({ message: "Müsait saatler şu an alınamıyor." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let payload: AppointmentPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const name = payload.name?.trim();
  const phone = payload.phone?.trim();
  const date = payload.date;
  const time = payload.time;
  const service = payload.service;
  const whatsappOptIn = payload.whatsappOptIn === true;
  const language = payload.language === "en" ? "en" : "tr";
  const today = new Date();
  const todayIstanbul = istanbulDateValue(today);
  const requestedTime = date && time ? new Date(`${date}T${time}:00+03:00`) : null;

  if (date && isSundayDate(date)) {
    return NextResponse.json({ message: "Pazar günleri randevu alınamıyor." }, { status: 400 });
  }

  if (
    !name || name.length < 2 || name.length > 80 ||
    !phone || !/^[+\d\s()\-]{7,20}$/.test(phone) ||
    !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !isCalendarDate(date) || date < todayIstanbul ||
    !time || !timeSlots.includes(time) ||
    !requestedTime || requestedTime.getTime() <= today.getTime() ||
    !service || !services.includes(service as (typeof services)[number])
  ) {
    return NextResponse.json({ message: "Lütfen bilgileri kontrol edip tekrar deneyin." }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const collection = client.db(process.env.MONGODB_DB || "kok_barber").collection<Appointment>("appointments");
    await collection.createIndex({ date: 1, time: 1 }, { unique: true });
    const appointment: Appointment = { name, phone, service: service as Appointment["service"], date, time, whatsappOptIn, createdAt: new Date() };
    await collection.insertOne(appointment);
    const whatsappSent = whatsappOptIn ? await sendWhatsAppConfirmation(appointment, language) : false;

    return NextResponse.json({ message: "Randevunuz alındı. Sizi bekliyoruz!", whatsappSent }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "Bu saat az önce doldu. Lütfen başka bir saat seçin." }, { status: 409 });
    }

    console.error("Randevu kaydedilemedi:", error);
    return NextResponse.json({ message: "Şu an randevu oluşturulamıyor. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  }
}