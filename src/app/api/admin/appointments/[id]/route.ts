import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getAdminAuthConfig, isAdminRequest } from "@/lib/admin-auth";
import { isCalendarDate, isSundayDate } from "@/lib/appointment-dates";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

const services = ["Klasik Kesim", "Saç + Sakal", "Sakal Tasarımı"] as const;
const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

function currentIstanbulDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function PUT(request: Request, context: RouteContext<"/api/admin/appointments/[id]">) {
  const config = getAdminAuthConfig();
  if (!config) {
    console.error("Admin authentication is not configured.");
    return NextResponse.json({ code: "notConfigured" }, { status: 503 });
  }
  if (!isAdminRequest(request, config)) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ code: "invalidOrigin" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return NextResponse.json({ code: "notFound" }, { status: 404 });
  }

  let payload: { name?: unknown; phone?: unknown; service?: unknown; date?: unknown; time?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const { service, date, time } = payload;
  if (typeof date === "string" && isSundayDate(date)) {
    return NextResponse.json({ code: "closed" }, { status: 400 });
  }
  if (
    name.length < 2 || name.length > 80 ||
    !/^[+\d\s()\-]{7,20}$/.test(phone) ||
    typeof service !== "string" || !services.includes(service as (typeof services)[number]) ||
    typeof date !== "string" || !isCalendarDate(date) || date < currentIstanbulDate() ||
    typeof time !== "string" || !timeSlots.includes(time) ||
    new Date(`${date}T${time}:00+03:00`).getTime() <= Date.now()
  ) {
    return NextResponse.json({ code: "invalid" }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const result = await client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection("appointments")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, phone, service, date, time } },
      );
    if (!result.matchedCount) {
      return NextResponse.json({ code: "notFound" }, { status: 404 });
    }

    return NextResponse.json({ updated: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ code: "conflict" }, { status: 409 });
    }
    console.error("Admin appointment could not be updated:", error);
    return NextResponse.json({ code: "unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/admin/appointments/[id]">) {
  const config = getAdminAuthConfig();
  if (!config) {
    console.error("Admin authentication is not configured.");
    return NextResponse.json({ code: "notConfigured" }, { status: 503 });
  }
  if (!isAdminRequest(request, config)) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ code: "invalidOrigin" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return NextResponse.json({ code: "notFound" }, { status: 404 });
  }

  try {
    const client = await connectToDatabase();
    const result = await client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection("appointments")
      .deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) {
      return NextResponse.json({ code: "notFound" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin appointment could not be cancelled:", error);
    return NextResponse.json({ code: "unavailable" }, { status: 503 });
  }
}
