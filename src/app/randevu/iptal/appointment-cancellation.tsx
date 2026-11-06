"use client";

import { ArrowLeft, ArrowRight, Check, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type AppointmentDetails = { name: string; service: string; date: string; time: string };
type CancellationState =
  | { status: "loading" }
  | { status: "ready"; appointment: AppointmentDetails }
  | { status: "cancelling"; appointment: AppointmentDetails }
  | { status: "cancelled"; appointment: AppointmentDetails; whatsappHref: string }
  | { status: "invalid" | "unavailable" };

const services: Record<string, { tr: string; en: string }> = {
  "Klasik Kesim": { tr: "Klasik Kesim", en: "Classic Cut" },
  "Saç + Sakal": { tr: "Saç + Sakal", en: "Hair + Beard" },
  "Sakal Tasarımı": { tr: "Sakal Tasarımı", en: "Beard Shape" },
};

function formatAppointmentDate(date: string, language: "tr" | "en") {
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
    dateStyle: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date(`${date}T12:00:00+03:00`));
}

export function AppointmentCancellation({
  token,
  initialLanguage,
}: {
  token: string;
  initialLanguage: "tr" | "en";
}) {
  const [language, setLanguage] = useState<"tr" | "en">(initialLanguage);
  const [state, setState] = useState<CancellationState>(() => token ? { status: "loading" } : { status: "invalid" });
  const barberNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const text = language === "tr"
    ? {
      title: "Randevu iptali",
      intro: "İptal etmek istediğin randevuyu kontrol et.",
      cancel: "Randevumu iptal et",
      cancelling: "Randevu iptal ediliyor...",
      cancelled: "Randevun iptal edildi.",
      whatsApp: "Berbere WhatsApp'tan haber ver",
      whatsAppHint: "Berbere gönderilmeye hazır bir mesaj açılacak. Bildirim için mesajı WhatsApp'tan göndermelisin.",
      invalid: "Bu iptal bağlantısı geçersiz, süresi dolmuş veya randevu daha önce iptal edilmiş.",
      unavailable: "İşlem şu anda tamamlanamadı. Lütfen tekrar dene.",
      back: "Ana sayfaya dön",
      confirm: "İptal işlemi geri alınamaz. Devam etmek istiyor musun?",
      service: "HİZMET",
      date: "TARİH VE SAAT",
      message: (appointment: AppointmentDetails) =>
        `Merhaba, ben ${appointment.name}. ${formatAppointmentDate(appointment.date, language)} saat ${appointment.time} için olan ${services[appointment.service]?.tr || appointment.service} randevumu iptal ettim.`,
    }
    : {
      title: "Cancel appointment",
      intro: "Review the appointment you want to cancel.",
      cancel: "Cancel my appointment",
      cancelling: "Cancelling appointment...",
      cancelled: "Your appointment has been cancelled.",
      whatsApp: "Notify the barber on WhatsApp",
      whatsAppHint: "A message draft will open. Send it in WhatsApp to notify the barber.",
      invalid: "This cancellation link is invalid, expired, or the appointment has already been cancelled.",
      unavailable: "We couldn't complete the request. Please try again.",
      back: "Back to home",
      confirm: "Cancellation cannot be undone. Do you want to continue?",
      service: "SERVICE",
      date: "DATE AND TIME",
      message: (appointment: AppointmentDetails) =>
        `Hi, this is ${appointment.name}. I cancelled my ${services[appointment.service]?.en || appointment.service} appointment for ${formatAppointmentDate(appointment.date, language)} at ${appointment.time}.`,
    };

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();
    fetch(`/api/appointments/cancel?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) {
          setState({ status: "invalid" });
          return;
        }
        if (!response.ok) throw new Error("Cancellation lookup failed");
        const result = await response.json() as { appointment: AppointmentDetails };
        setState({ status: "ready", appointment: result.appointment });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable" });
      });

    return () => controller.abort();
  }, [token]);

  async function cancelAppointment() {
    if (state.status !== "ready" || !window.confirm(text.confirm)) return;

    const appointment = state.appointment;
    const whatsappWindow = barberNumber ? window.open("about:blank", "_blank") : null;
    if (whatsappWindow) whatsappWindow.opener = null;
    setState({ status: "cancelling", appointment });

    try {
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (response.status === 404) {
        whatsappWindow?.close();
        setState({ status: "invalid" });
        return;
      }
      if (!response.ok) throw new Error("Cancellation failed");

      const result = await response.json() as { appointment: AppointmentDetails };
      const message = text.message(result.appointment);
      const whatsappHref = barberNumber
        ? `https://wa.me/${barberNumber}?text=${encodeURIComponent(message)}`
        : "";
      if (whatsappHref && whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappHref;
      } else {
        whatsappWindow?.close();
      }
      setState({ status: "cancelled", appointment: result.appointment, whatsappHref });
    } catch {
      whatsappWindow?.close();
      setState({ status: "unavailable" });
    }
  }

  const appointment = "appointment" in state ? state.appointment : null;

  return (
    <main className="cancellation-page">
      <section className="cancellation-card" aria-live="polite">
        <Link className="cancellation-brand" href="/" aria-label="Mehmet İrşad Güder Barber Shop">
          <Scissors size={20} aria-hidden="true" />
          <span>MEHMET İRŞAD GÜDER <small>BARBER SHOP · TALAS</small></span>
        </Link>
        <p className="eyebrow">RANDEVU YÖNETİMİ</p>
        <h1>{text.title}</h1>
        {state.status === "loading" && <p className="cancellation-message">{language === "tr" ? "Randevu bilgileri yükleniyor..." : "Loading appointment details..."}</p>}
        {state.status === "invalid" && <p className="cancellation-message cancellation-error" role="alert">{text.invalid}</p>}
        {state.status === "unavailable" && <p className="cancellation-message cancellation-error" role="alert">{text.unavailable}</p>}
        {appointment && state.status !== "cancelled" && (
          <>
            <p className="cancellation-message">{text.intro}</p>
            <dl className="cancellation-details">
              <div><dt>{text.service}</dt><dd>{services[appointment.service]?.[language] || appointment.service}</dd></div>
              <div><dt>{text.date}</dt><dd>{formatAppointmentDate(appointment.date, language)} · {appointment.time}</dd></div>
            </dl>
            <button className="cancellation-button" type="button" onClick={cancelAppointment} disabled={state.status === "cancelling"}>
              {state.status === "cancelling" ? text.cancelling : text.cancel}<ArrowRight size={17} />
            </button>
          </>
        )}
        {state.status === "cancelled" && (
          <div className="cancellation-success" role="status">
            <Check size={22} />
            <p>{text.cancelled}</p>
            {state.whatsappHref ? (
              <>
                <a className="cancellation-button" href={state.whatsappHref} target="_blank" rel="noreferrer">{text.whatsApp}<ArrowRight size={17} /></a>
                <small>{text.whatsAppHint}</small>
              </>
            ) : <small>{language === "tr" ? "Berberin WhatsApp numarası yapılandırılmamış." : "The barber's WhatsApp number is not configured."}</small>}
          </div>
        )}
        <Link className="cancellation-back" href="/"><ArrowLeft size={14} />{text.back}</Link>
        <button className="cancellation-language" type="button" onClick={() => setLanguage((current) => current === "tr" ? "en" : "tr")}>
          {language === "tr" ? "English" : "Türkçe"}
        </button>
      </section>
    </main>
  );
}
