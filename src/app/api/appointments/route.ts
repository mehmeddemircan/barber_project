import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const services = ["Klasik Kesim", "Saç + Sakal", "Sakal Tasarımı"] as const;
const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

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

function isCalendarDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

type Appointment = {
  name: string;
  phone: string;
  service: (typeof services)[number];
  date: string;
  time: string;
  createdAt: Date;
};

export async function POST(request: Request) {
  let payload: Partial<Appointment>;

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
  const today = new Date();
  const todayIstanbul = istanbulDateValue(today);
  const requestedTime = date && time ? new Date(`${date}T${time}:00+03:00`) : null;

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
    await collection.insertOne({ name, phone, service: service as Appointment["service"], date, time, createdAt: new Date() });

    return NextResponse.json({ message: "Randevunuz alındı. Sizi bekliyoruz!" }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "Bu saat az önce doldu. Lütfen başka bir saat seçin." }, { status: 409 });
    }

    console.error("Randevu kaydedilemedi:", error);
    return NextResponse.json({ message: "Şu an randevu oluşturulamıyor. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  }
}