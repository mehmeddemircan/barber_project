"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, Clock3, MapPin, Menu, Scissors, ShieldCheck } from "lucide-react";

const services = [
  { name: "Klasik Kesim", detail: "Yıkama, kesim ve şekillendirme", price: "₺650", duration: "40 dk" },
  { name: "Saç + Sakal", detail: "Tam bakım, tek koltukta", price: "₺950", duration: "60 dk" },
  { name: "Sakal Tasarımı", detail: "Sıcak havlu ve ustura dokunuşu", price: "₺450", duration: "25 dk" },
];

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

export default function Home() {
  const [service, setService] = useState(services[0].name);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const initialUpdate = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(interval);
    };
  }, []);

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          service,
          date,
          time,
        }),
      });
      const result = await response.json();
      setStatus(result.message || "Bir hata oluştu.");
      if (response.ok) {
        form.reset();
        setDate("");
        setTime("");
      }
    } catch {
      setStatus("Bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const minDate = istanbulDateValue(new Date());

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="KÖK ana sayfa"><span>KÖK.</span><small>BERBER KULÜBÜ</small></a>
        <nav className={`desktop-nav ${isMenuOpen ? "is-open" : ""}`} aria-label="Ana menü">
          <a href="#hikaye" onClick={() => setIsMenuOpen(false)}>Hikâyemiz</a>
          <a href="#hizmetler" onClick={() => setIsMenuOpen(false)}>Hizmetler</a>
          <a href="#randevu" onClick={() => setIsMenuOpen(false)}>Randevu</a>
        </nav>
        <a className="header-cta" href="#randevu">Yerini ayırt <ArrowRight size={15} /></a>
        <button className="mobile-menu" type="button" aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={22} /></button>
      </header>

      <section className="hero" id="home">
        <div className="hero-image" role="img" aria-label="Geleneksel berber koltuğunda saç kesimi" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> KARAKÖY, İSTANBUL · 2018&apos;DEN BERİ</p>
          <h1>İYİ KESİM.<br /><em>İYİ HİS.</em></h1>
          <p className="hero-copy">Her şeyin hızlandığı bir şehirde,<br />kendine ayırdığın iyi bir saat.</p>
          <a className="hero-button" href="#randevu">Randevunu oluştur <ArrowRight size={17} /></a>
        </div>
        <div className="hero-side-note">USTALIK · KARAKÖY · İSTANBUL</div>
        <a className="scroll-cue" href="#hikaye" aria-label="Hikâyemize göz at"><ArrowDown size={16} /><span>AŞAĞI İN</span></a>
        <div className="hero-index"><span>01</span><i /> 03</div>
      </section>

      <section className="intro section-wrap" id="hikaye">
        <div className="intro-label"><span className="eyebrow">BİZ KİMİZ?</span><span className="label-rule" /></div>
        <div className="intro-copy">
          <h2>Berberlik bir<br /><span>ritüeldir.</span></h2>
          <div className="intro-bottom">
            <p>İyi bir kesimden fazlası. Kapıdan girdiğin andan son dokunuşa kadar, her şey yerli yerinde. Mahallenin ustaları, eski usul özen ve sana ayrılmış bir koltuk.</p>
            <a className="text-link" href="#hizmetler">KÖK&apos;Ü TANI <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="intro-stamp"><Scissors size={19} /><span>İYİ İŞ<br />ZAMAN ALIR</span></div>
      </section>

      <section className="services" id="hizmetler">
        <div className="section-wrap services-inner">
          <div className="section-heading">
            <div><p className="eyebrow">KÖK&apos;TEN UCA</p><h2>USTANIN<br /><em>ELİNDEN.</em></h2></div>
            <p className="section-aside">Ne lazımsa, özenle.<br />Gerisi koltuğunda.</p>
          </div>
          <div className="service-list">
            {services.map((item, index) => (
              <button className={`service-row ${service === item.name ? "is-selected" : ""}`} key={item.name} type="button" onClick={() => { setService(item.name); document.querySelector("#randevu")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span className="service-number">0{index + 1}</span>
                <span className="service-info"><strong>{item.name}</strong><small>{item.detail}</small></span>
                <span className="service-duration"><Clock3 size={14} />{item.duration}</span>
                <span className="service-price">{item.price}</span>
                <ArrowRight className="service-arrow" size={18} />
              </button>
            ))}
          </div>
          <p className="service-footnote">* Fiyatlara KDV dahildir. Öğrenci indirimi için ustana danış.</p>
        </div>
      </section>

      <section className="booking section-wrap" id="randevu">
        <div className="booking-intro">
          <p className="eyebrow">KOLTUĞUN HAZIR</p>
          <h2>TAKVİMİNDE<br /><em>YER AÇ.</em></h2>
          <p className="booking-description">İyi bir saat kendiliğinden gelmez.<br />Senin için ayıralım.</p>
          <div className="booking-address"><MapPin size={17} /><span>Bereketzade Mah. Büyük Hendek Cd.<br />No: 14, Beyoğlu / İstanbul</span></div>
          <div className="booking-trust"><ShieldCheck size={18} /><span>Bilgilerin güvende. Ödeme dükkânda.</span></div>
        </div>
        <form className="booking-form" onSubmit={submitAppointment}>
          <div className="form-heading"><span>01 — BİLGİLERİN</span><span>* Zorunlu alanlar</span></div>
          <div className="field-grid">
            <label className="field"><span>AD SOYAD *</span><input name="name" type="text" placeholder="Adın soyadın" minLength={2} maxLength={80} autoComplete="name" required /></label>
            <label className="field"><span>TELEFON *</span><input name="phone" type="tel" placeholder="05__ ___ __ __" autoComplete="tel" required /></label>
          </div>
          <label className="field service-select"><span>HİZMETİN</span><select value={service} onChange={(event) => setService(event.target.value)}>{services.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <div className="form-heading date-heading"><span>02 — GÜNÜNÜ SEÇ</span><span>09:30 — 19:00</span></div>
          <label className="field date-field"><span>TARİH</span><input type="date" min={minDate} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} required /></label>
          <fieldset className="time-fieldset" disabled={!date}>
            <legend>SAAT {!date && <span>— önce tarih seç</span>}</legend>
            <div className="time-grid">
              {timeSlots.map((slot) => {
                const isPast = date === minDate && currentTime > 0 && new Date(`${date}T${slot}:00+03:00`).getTime() <= currentTime;
                return <button className={time === slot ? "is-active" : ""} key={slot} type="button" onClick={() => setTime(slot)} aria-pressed={time === slot} disabled={isPast}>{slot}</button>;
              })}
            </div>
          </fieldset>
          <button className="submit-button" type="submit" disabled={isSubmitting || !date || !time}>{isSubmitting ? "RANDEVUN OLUŞTURULUYOR..." : "RANDEVUMU OLUŞTUR"}<ArrowRight size={17} /></button>
          {status && <p className={`form-status ${status.includes("alındı") ? "success" : "error"}`} role="status">{status.includes("alındı") && <Check size={16} />}{status}</p>}
          <p className="form-privacy">Randevu talebin onaylandığında seni telefonla arayacağız.</p>
        </form>
      </section>

      <footer className="site-footer">
        <a className="wordmark footer-mark" href="#home"><span>KÖK.</span><small>BERBER KULÜBÜ</small></a>
        <p>İYİ KESİM, İYİ MUHABBET.<br />KARAKÖY&apos;DE BULUŞALIM.</p>
        <a href="https://maps.google.com/?q=Bereketzade+Mahallesi+B%C3%BCy%C3%BCk+Hendek+Caddesi+Istanbul" target="_blank" rel="noreferrer">YOL TARİFİ <ArrowRight size={14} /></a>
        <span className="footer-copy">© 2026 KÖK. BERBER KULÜBÜ</span>
      </footer>
    </main>
  );
}