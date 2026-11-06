import type { Metadata } from "next";
import { AppointmentCancellation } from "./appointment-cancellation";

export const metadata: Metadata = {
  title: "Randevu iptali | Mehmet İrşad Güder Barber Shop",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CancelAppointmentPage({
  searchParams,
}: PageProps<"/randevu/iptal">) {
  const { token, lang } = await searchParams;
  return (
    <AppointmentCancellation
      token={typeof token === "string" ? token : ""}
      initialLanguage={lang === "en" ? "en" : "tr"}
    />
  );
}
