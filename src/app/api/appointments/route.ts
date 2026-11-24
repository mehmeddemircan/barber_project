import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { HOME_VISIT_SERVICE, isAppointmentService, type AppointmentService } from "@/lib/appointment-services";
import { isCalendarDate, isSundayDate } from "@/lib/appointment-dates";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00",
];
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
  service: AppointmentService;
  date: string;
  time: string;
  address?: string;
  createdAt: Date;
  cancellationTokenHash: string;
};

type AppointmentPayload = {
  name?: string;
  phone?: string;
  service?: unknown;
  date?: string;
  time?: string;
  address?: unknown;
};

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
  const address = typeof payload.address === "string" ? payload.address.trim() : "";
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
    !isAppointmentService(service) ||
    (service === HOME_VISIT_SERVICE && (address.length < 8 || address.length > 200))
  ) {
    return NextResponse.json({ message: "Lütfen bilgileri kontrol edip tekrar deneyin." }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const collection = client.db(process.env.MONGODB_DB || "kok_barber").collection<Appointment>("appointments");
    await collection.createIndex({ date: 1, time: 1 }, { unique: true });
    await collection.createIndex({ cancellationTokenHash: 1 }, { unique: true, sparse: true });
    const cancellationToken = randomBytes(32).toString("base64url");
    const appointment: Appointment = {
      name,
      phone,
      service,
      date,
      time,
      ...(service === HOME_VISIT_SERVICE ? { address } : {}),
      createdAt: new Date(),
      cancellationTokenHash: createHash("sha256").update(cancellationToken).digest("hex"),
    };
    await collection.insertOne(appointment);
    return NextResponse.json(
      { message: "Randevunuz alındı. Sizi bekliyoruz!", cancellationToken },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "Bu saat az önce doldu. Lütfen başka bir saat seçin." }, { status: 409 });
    }

    console.error("Randevu kaydedilemedi:", error);
    return NextResponse.json({ message: "Şu an randevu oluşturulamıyor. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  }
}