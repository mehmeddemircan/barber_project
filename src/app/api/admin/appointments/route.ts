import { NextResponse } from "next/server";
import { getAdminAuthConfig, isAdminRequest } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const config = getAdminAuthConfig();
  if (!config) {
    console.error("Admin authentication is not configured.");
    return NextResponse.json({ message: "Admin access is not configured." }, { status: 503 });
  }
  if (!isAdminRequest(request, config)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  try {
    const client = await connectToDatabase();
    const records = await client
      .db(process.env.MONGODB_DB || "kok_barber")
      .collection("appointments")
      .find(
        { date: { $gte: today } },
        { projection: { name: 1, phone: 1, service: 1, date: 1, time: 1 } },
      )
      .sort({ date: 1, time: 1 })
      .limit(250)
      .toArray();
    const appointments = records.map(({ _id, ...appointment }) => ({ ...appointment, id: _id.toString() }));

    return NextResponse.json(
      { appointments },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin appointments could not be loaded:", error);
    return NextResponse.json({ message: "Appointments are temporarily unavailable." }, { status: 503 });
  }
}
