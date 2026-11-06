import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

type CancellableAppointment = {
  name: string;
  service: string;
  date: string;
  time: string;
  cancellationTokenHash: string;
};

function isValidToken(token: string | null): token is string {
  return Boolean(token && /^[\w-]{43}$/.test(token));
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function currentIstanbulDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  };
}

function appointmentIsUpcoming(appointment: Pick<CancellableAppointment, "date" | "time">) {
  return new Date(`${appointment.date}T${appointment.time}:00+03:00`).getTime() > Date.now();
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!isValidToken(token)) {
    return NextResponse.json({ code: "notFound" }, { status: 404, headers: noStoreHeaders() });
  }

  try {
    const client = await connectToDatabase();
    const appointment = await client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection<CancellableAppointment>("appointments")
      .findOne({
        cancellationTokenHash: hashToken(token),
        date: { $gte: currentIstanbulDate() },
      });

    if (!appointment || !appointmentIsUpcoming(appointment)) {
      return NextResponse.json({ code: "notFound" }, { status: 404, headers: noStoreHeaders() });
    }

    return NextResponse.json(
      { appointment: { name: appointment.name, service: appointment.service, date: appointment.date, time: appointment.time } },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    console.error("Customer appointment cancellation could not be loaded:", error);
    return NextResponse.json({ code: "unavailable" }, { status: 503, headers: noStoreHeaders() });
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ code: "invalidOrigin" }, { status: 403, headers: noStoreHeaders() });
  }

  let payload: { token?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid" }, { status: 400, headers: noStoreHeaders() });
  }

  const token = typeof payload.token === "string" ? payload.token : null;
  if (!isValidToken(token)) {
    return NextResponse.json({ code: "notFound" }, { status: 404, headers: noStoreHeaders() });
  }

  try {
    const client = await connectToDatabase();
    const collection = client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection<CancellableAppointment>("appointments");
    const appointment = await collection.findOne({
      cancellationTokenHash: hashToken(token),
      date: { $gte: currentIstanbulDate() },
    });

    if (!appointment || !appointmentIsUpcoming(appointment)) {
      return NextResponse.json({ code: "notFound" }, { status: 404, headers: noStoreHeaders() });
    }

    const result = await collection.deleteOne({ _id: appointment._id, cancellationTokenHash: hashToken(token) });
    if (!result.deletedCount) {
      return NextResponse.json({ code: "notFound" }, { status: 404, headers: noStoreHeaders() });
    }

    return NextResponse.json(
      { cancelled: true, appointment: { name: appointment.name, service: appointment.service, date: appointment.date, time: appointment.time } },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    console.error("Customer appointment could not be cancelled:", error);
    return NextResponse.json({ code: "unavailable" }, { status: 503, headers: noStoreHeaders() });
  }
}
