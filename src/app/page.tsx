"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, BadgePercent, Check, ChevronLeft, ChevronRight, Clock3, Gift, GraduationCap, MapPin, Menu, Moon, Quote, Scissors, ShieldCheck, Sun } from "lucide-react";

const services = [
  { key: "Klasik Kesim", name: { tr: "Klasik Kesim", en: "Classic Cut" }, detail: { tr: "Yıkama, kesim ve şekillendirme", en: "Wash, cut and styling" }, price: "₺650", duration: { tr: "40 dk", en: "40 min" } },
  { key: "Saç + Sakal", name: { tr: "Saç + Sakal", en: "Hair + Beard" }, detail: { tr: "Tam bakım, tek koltukta", en: "The complete chair experience" }, price: "₺950", duration: { tr: "60 dk", en: "60 min" } },
  { key: "Sakal Tasarımı", name: { tr: "Sakal Tasarımı", en: "Beard Shape" }, detail: { tr: "Sıcak havlu ve ustura dokunuşu", en: "Hot towel and straight-razor finish" }, price: "₺450", duration: { tr: "25 dk", en: "25 min" } },
];

const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
type Language = "tr" | "en";
type Theme = "light" | "dark";
type BookingField = "name" | "phone" | "date" | "time";
type FieldErrorCode = "nameRequired" | "nameTooShort" | "nameTooLong" | "phoneRequired" | "phoneInvalid" | "dateRequired" | "dateInvalid" | "datePast" | "timeRequired" | "timeInvalid" | "timePast" | "timeTaken";
type FieldErrors = Partial<Record<BookingField, FieldErrorCode>>;

const campaigns = [
  { icon: BadgePercent, label: { tr: "PAKET FİYATI", en: "BUNDLE PRICE" }, title: { tr: "İkili ritüel", en: "The two-part ritual" }, description: { tr: "Saç ve sakalı ayrı ayrı almak yerine tek randevuda tamamla.", en: "Book hair and beard together in one unhurried appointment." }, price: "₺950", oldPrice: "₺1.100", service: "Saç + Sakal" },
  { icon: Gift, label: { tr: "İLK RANDEVU", en: "FIRST VISIT" }, title: { tr: "Tanışma, bizden.", en: "A proper introduction." }, description: { tr: "İlk gelişinde kesim öncesi 10 dakikalık stil danışmanlığı ücretsiz.", en: "Enjoy a complimentary 10-minute style consultation before your first cut." }, service: "Klasik Kesim" },
  { icon: GraduationCap, label: { tr: "ÖĞRENCİ AVANTAJI", en: "STUDENT OFFER" }, title: { tr: "%10 öğrenci indirimi", en: "10% off for students" }, description: { tr: "Geçerli öğrenci kartını dükkânda göster; indirim ödemede uygulansın.", en: "Show a valid student ID in-store to receive your discount at checkout." }, service: "Klasik Kesim" },
];

const reviews = [
  { service: "Klasik Kesim", quote: { tr: "Koltuğa oturunca acele yok. Kesim tam istediğim gibi oldu.", en: "No rush once you sit down. The cut was exactly what I wanted." } },
  { service: "Sakal Tasarımı", quote: { tr: "Sıcak havlu ve ustura, sakal bakımı küçük bir ritüele dönüştü.", en: "The hot towel and straight razor made a beard trim feel like a ritual." } },
  { service: "Klasik Kesim", quote: { tr: "Ne istediğimi dinleyip yüzüme uygun bir kesim önerdiler.", en: "They listened and suggested a cut that works with my face shape." } },
  { service: "Saç + Sakal", quote: { tr: "Saç ve sakalı aynı koltukta halletmek büyük rahatlık.", en: "Getting my hair and beard done in one chair is a real treat." } },
  { service: "Klasik Kesim", quote: { tr: "Detaylara gösterdikleri özen her gelişimde fark yaratıyor.", en: "The attention to detail makes every visit feel considered." } },
  { service: "Sakal Tasarımı", quote: { tr: "Randevu saatinde alındım, sonuç da tertemizdi.", en: "I was seen on time, and the finish was spot on." } },
  { service: "Saç + Sakal", quote: { tr: "İyi müzik, güzel sohbet, daha da iyi bir kesim.", en: "Good music, easy conversation, and an even better cut." } },
  { service: "Klasik Kesim", quote: { tr: "Mekân ferah, ekip samimi; insan tekrar gelmek istiyor.", en: "A calm space and a welcoming team. You want to come back." } },
  { service: "Sakal Tasarımı", quote: { tr: "Karaköy'de kendime ayırdığım en iyi saatlerden biri.", en: "One of the best hours I set aside for myself in Karaköy." } },
  { service: "Saç + Sakal", quote: { tr: "Her gelişimde aynı özen, aynı iyi his.", en: "The same care and the same good feeling every time." } },
];

const content = {
  tr: {
    nav: ["Hikâyemiz", "Kampanyalar", "Hizmetler", "Yorumlar", "Randevu"], book: "Yerini ayırt", menuOpen: "Menüyü aç", menuClose: "Menüyü kapat",
    location: "KARAKÖY, İSTANBUL · 2018'DEN BERİ", heroTitle: ["İYİ KESİM.", "İYİ HİS."], heroCopy: "Her şeyin hızlandığı bir şehirde, kendine ayırdığın iyi bir saat.", bookNow: "Randevunu oluştur", scroll: "AŞAĞI İN",
    who: "BİZ KİMİZ?", introTitle: ["Berberlik bir", "ritüeldir."], introCopy: "İyi bir kesimden fazlası. Kapıdan girdiğin andan son dokunuşa kadar, her şey yerli yerinde. Mahallenin ustaları, eski usul özen ve sana ayrılmış bir koltuk.", learn: "KÖK'Ü TANI", stamp: ["İYİ İŞ", "ZAMAN ALIR"],
    filmKicker: "KÖK'ÜN İÇİNDEN", filmTitle: ["USTALIK", "YAKINDAN."], filmCopy: "Makasın sesi, sıcak havlu, tanıdık bir koltuk. KÖK'te iyi bir kesim böyle başlar.", filmLabel: "KÖK. KISA FİLM · 00:08", filmCredit: "Video: Pexels / RDNE Stock project",
    galleryKicker: "KOLTUKTAN KARELER", galleryTitle: ["İŞİMİZ", "KONUŞSUN."], galleryCopy: "Her kesim başka, özen hep aynı.", galleryLabels: ["USTALIK", "DETAY", "SON DOKUNUŞ"],
    campaignKicker: "KÖK'TE BU ARA", campaignTitle: ["KÜÇÜK BİR", "İYİLİK."], campaignCopy: "Koltukta sana iyi gelecek birkaç neden.", campaignAction: "KAMPANYAYI SEÇ", campaignTerms: "Kampanya koşulları randevu sırasında dükkânda teyit edilir.",
    reviewKicker: "KOLTUKTAN SONRA", reviewTitle: ["SÖZÜ", "SİZDE."], reviewCopy: "Bu alandaki metinler taslak yorum örnekleridir; yayına almadan gerçek müşteri geri bildirimleriyle değiştirin.", reviewSample: "ÖRNEK YORUM", reviewPrevious: "Önceki yorumlar", reviewNext: "Sonraki yorumlar",
    serviceKicker: "KÖK'TEN UCA", serviceTitle: ["USTANIN", "ELİNDEN."], serviceAside: ["Ne lazımsa, özenle.", "Gerisi koltuğunda."], serviceNote: "* Fiyatlara KDV dahildir. Öğrenci indirimi için ustana danış.",
    bookingKicker: "KOLTUĞUN HAZIR", bookingTitle: ["TAKVİMİNDE", "YER AÇ."], bookingCopy: ["İyi bir saat kendiliğinden gelmez.", "Senin için ayıralım."], address: ["Bereketzade Mah. Büyük Hendek Cd.", "No: 14, Beyoğlu / İstanbul"], trust: "Bilgilerin güvende. Ödeme dükkânda.",
    yourDetails: "01 — BİLGİLERİN", required: "* Zorunlu alanlar", fullName: "AD SOYAD *", namePlaceholder: "Adın soyadın", phone: "TELEFON *", phonePlaceholder: "05__ ___ __ __", yourService: "HİZMETİN", chooseDate: "02 — GÜNÜNÜ SEÇ", hours: "09:30 — 19:00", date: "TARİH", time: "SAAT", pickDate: "— önce tarih seç", submit: "RANDEVUMU OLUŞTUR", submitting: "RANDEVUN OLUŞTURULUYOR...", privacy: "Randevu talebin onaylandığında seni telefonla arayacağız.", validationSummary: "Lütfen işaretli alanları kontrol et.", nameRequired: "Ad soyad alanı zorunludur.", nameTooShort: "Ad soyad en az 2 karakter olmalı.", nameTooLong: "Ad soyad en fazla 80 karakter olabilir.", phoneRequired: "Telefon numarası zorunludur.", phoneInvalid: "7–20 karakterli, geçerli bir telefon numarası gir.", dateRequired: "Lütfen bir tarih seç.", dateInvalid: "Geçerli bir tarih seç.", datePast: "Geçmiş bir tarih seçilemez.", timeRequired: "Lütfen uygun bir saat seç.", timeInvalid: "Listeden geçerli bir saat seç.", timePast: "Geçmiş bir saat seçilemez.", timeTaken: "Bu saat doldu; lütfen başka bir saat seç.",
    success: "Randevunuz alındı. Sizi bekliyoruz!", invalid: "Lütfen bilgileri kontrol edip tekrar deneyin.", conflict: "Bu saat az önce doldu. Lütfen başka bir saat seçin.", unavailable: "Şu an randevu oluşturulamıyor. Lütfen daha sonra tekrar deneyin.", network: "Bağlantı kurulamadı. Lütfen tekrar deneyin.", genericError: "Bir hata oluştu.",
    footerLine: ["İYİ KESİM, İYİ MUHABBET.", "KARAKÖY'DE BULUŞALIM."], directions: "YOL TARİFİ", themeLight: "Açık temaya geç", themeDark: "Koyu temaya geç", languageLabel: "Dili seç",
  },
  en: {
    nav: ["Our Story", "Offers", "Services", "Reviews", "Book"], book: "Book a chair", menuOpen: "Open menu", menuClose: "Close menu",
    location: "KARAKÖY, ISTANBUL · SINCE 2018", heroTitle: ["A GOOD CUT.", "A GOOD FEEL."], heroCopy: "In a city that never slows down, take one good hour for yourself.", bookNow: "Book your appointment", scroll: "SCROLL TO EXPLORE",
    who: "WHO WE ARE", introTitle: ["A barber visit", "is a ritual."], introCopy: "More than a good cut. From the moment you walk in to the final touch, everything is in its place. Neighbourhood craft, old-school care, and a chair that is yours.", learn: "MEET KÖK", stamp: ["GOOD WORK", "TAKES TIME"],
    filmKicker: "INSIDE KÖK", filmTitle: ["CRAFT,", "UP CLOSE."], filmCopy: "The sound of shears, a warm towel, a familiar chair. This is where a good cut begins.", filmLabel: "KÖK. SHORT FILM · 00:08", filmCredit: "Video: Pexels / RDNE Stock project",
    galleryKicker: "FRAMES FROM THE CHAIR", galleryTitle: ["LET THE", "CRAFT SPEAK."], galleryCopy: "Every cut is different. The care is always the same.", galleryLabels: ["THE CRAFT", "THE DETAIL", "THE FINISH"],
    campaignKicker: "CURRENT OFFERS", campaignTitle: ["A LITTLE", "EXTRA CARE."], campaignCopy: "A few more reasons to take your place in the chair.", campaignAction: "CHOOSE THIS OFFER", campaignTerms: "Offer details are confirmed in-store when you book.",
    reviewKicker: "AFTER THE CHAIR", reviewTitle: ["OVER TO", "YOU."], reviewCopy: "These are sample review drafts; replace them with genuine customer feedback before publishing.", reviewSample: "SAMPLE REVIEW", reviewPrevious: "Previous reviews", reviewNext: "Next reviews",
    serviceKicker: "FROM ROOT TO TIP", serviceTitle: ["IN GOOD", "HANDS."], serviceAside: ["Whatever you need, done with care.", "The rest is in the chair."], serviceNote: "* Prices include VAT. Ask your barber about student pricing.",
    bookingKicker: "YOUR CHAIR IS READY", bookingTitle: ["MAKE ROOM", "IN YOUR DAY."], bookingCopy: ["A good hour doesn't just happen.", "Let's save one for you."], address: ["Bereketzade Mah. Büyük Hendek Cd.", "No: 14, Beyoğlu / Istanbul"], trust: "Your details stay private. Pay in-store.",
    yourDetails: "01 — YOUR DETAILS", required: "* Required fields", fullName: "FULL NAME *", namePlaceholder: "Your full name", phone: "PHONE *", phonePlaceholder: "+90 ___ ___ __ __", yourService: "YOUR SERVICE", chooseDate: "02 — PICK A DAY", hours: "09:30 — 19:00", date: "DATE", time: "TIME", pickDate: "— choose a date first", submit: "BOOK MY APPOINTMENT", submitting: "BOOKING YOUR CHAIR...", privacy: "We'll call to confirm your appointment request.", validationSummary: "Please check the highlighted fields.", nameRequired: "Please enter your full name.", nameTooShort: "Your name must be at least 2 characters.", nameTooLong: "Your name must be 80 characters or fewer.", phoneRequired: "Please enter your phone number.", phoneInvalid: "Enter a valid phone number using 7–20 characters.", dateRequired: "Please choose a date.", dateInvalid: "Choose a valid date.", datePast: "Past dates are not available.", timeRequired: "Please choose an available time.", timeInvalid: "Choose a time from the list.", timePast: "Past times are not available.", timeTaken: "That time just filled up. Please choose another.",
    success: "Your appointment is booked. See you soon!", invalid: "Please check your details and try again.", conflict: "That time just filled up. Please choose another.", unavailable: "We can't book right now. Please try again later.", network: "Connection failed. Please try again.", genericError: "Something went wrong.",
    footerLine: ["GOOD CUTS. GOOD CONVERSATION.", "SEE YOU IN KARAKÖY."], directions: "GET DIRECTIONS", themeLight: "Switch to light theme", themeDark: "Switch to dark theme", languageLabel: "Choose language",
  },
} as const;

const gallery = [
  { image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1100&q=85", position: "center 42%" },
  { image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=85", position: "center 40%" },
  { image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=85", position: "center 45%" },
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

export default function Home() {
  const [language, setLanguage] = useState<Language>("tr");
  const [service, setService] = useState(services[0].key);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [theme, setTheme] = useState<Theme>("light");
  const [reviewIndex, setReviewIndex] = useState(0);
  const t = content[language];
  const minDate = istanbulDateValue(new Date());
  const fieldErrorText: Record<FieldErrorCode, string> = {
    nameRequired: t.nameRequired,
    nameTooShort: t.nameTooShort,
    nameTooLong: t.nameTooLong,
    phoneRequired: t.phoneRequired,
    phoneInvalid: t.phoneInvalid,
    dateRequired: t.dateRequired,
    dateInvalid: t.dateInvalid,
    datePast: t.datePast,
    timeRequired: t.timeRequired,
    timeInvalid: t.timeInvalid,
    timePast: t.timePast,
    timeTaken: t.timeTaken,
  };

  useEffect(() => {
    const initialUpdate = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    const preferenceUpdate = window.setTimeout(() => {
      const storedLanguage = window.localStorage.getItem("kok-language");
      const storedTheme = window.localStorage.getItem("kok-theme");
      if (storedLanguage === "tr" || storedLanguage === "en") setLanguage(storedLanguage);
      if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
    }, 0);
    return () => {
      window.clearTimeout(initialUpdate);
      window.clearTimeout(preferenceUpdate);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const shell = document.querySelector(".site-shell");
    if (!shell) return;

    const revealTargets = shell.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    shell.classList.add("motion-ready");
    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "tr" ? "KÖK. | Berber Kulübü" : "KÖK. | Barber Club";
    window.localStorage.setItem("kok-language", language);
    window.localStorage.setItem("kok-theme", theme);
  }, [language, theme]);

  function getFieldError(field: BookingField, value: string, selectedDate = date): FieldErrorCode | undefined {
    if (field === "name") {
      const name = value.trim();
      if (!name) return "nameRequired";
      if (name.length < 2) return "nameTooShort";
      if (name.length > 80) return "nameTooLong";
    }

    if (field === "phone") {
      const phone = value.trim();
      if (!phone) return "phoneRequired";
      if (!/^[+\d\s()\-]{7,20}$/.test(phone)) return "phoneInvalid";
    }

    if (field === "date") {
      if (!value) return "dateRequired";
      const parsedDate = new Date(`${value}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) return "dateInvalid";
      if (value < minDate) return "datePast";
    }

    if (field === "time") {
      if (!value) return "timeRequired";
      if (!timeSlots.includes(value)) return "timeInvalid";
      if (!selectedDate) return "dateRequired";
      if (selectedDate === minDate && new Date(`${selectedDate}T${value}:00+03:00`).getTime() <= Date.now()) return "timePast";
    }

    return undefined;
  }

  function updateFieldError(field: BookingField, value: string, selectedDate = date) {
    const error = getFieldError(field, value, selectedDate);
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
    if (status) {
      setStatus("");
      setStatusIsSuccess(false);
    }
  }

  function validateField(field: BookingField, value: string, selectedDate = date) {
    const error = getFieldError(field, value, selectedDate);
    setFieldErrors((current) => ({ ...current, [field]: error }));
  }

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const phone = String(formData.get("phone") || "");
    const errors: FieldErrors = {
      name: getFieldError("name", name),
      phone: getFieldError("phone", phone),
      date: getFieldError("date", date),
      time: getFieldError("time", time),
    };
    setFieldErrors(errors);

    const firstInvalid = (Object.keys(errors) as BookingField[]).find((field) => errors[field]);
    if (firstInvalid) {
      setStatus(t.validationSummary);
      setStatusIsSuccess(false);
      if (firstInvalid === "time") form.querySelector<HTMLButtonElement>(".time-grid button:not(:disabled)")?.focus();
      else form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus("");
    setIsSubmitting(true);

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
      setStatusIsSuccess(response.ok);
      setStatus(response.ok ? t.success : response.status === 409 ? t.timeTaken : response.status === 400 ? t.invalid : t.unavailable);
      if (response.status === 409) setFieldErrors((current) => ({ ...current, time: "timeTaken" }));
      if (response.ok) {
        form.reset();
        setDate("");
        setTime("");
        setFieldErrors({});
      }
    } catch {
      setStatusIsSuccess(false);
      setStatus(t.network);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell min-h-screen bg-paper text-ink antialiased" data-theme={theme}>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="KÖK. home"><span>KÖK.</span><small>BARBER CLUB</small></a>
        <nav className={`desktop-nav ${isMenuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {t.nav.map((label, index) => <a href={["#hikaye", "#kampanyalar", "#hizmetler", "#yorumlar", "#randevu"][index]} key={label} onClick={() => setIsMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-tools">
          <div className="language-switch" role="group" aria-label={t.languageLabel}>
            <button type="button" aria-pressed={language === "tr"} onClick={() => setLanguage("tr")}>TR</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          </div>
          <button className="theme-toggle" type="button" title={theme === "dark" ? t.themeLight : t.themeDark} aria-label={theme === "dark" ? t.themeLight : t.themeDark} aria-pressed={theme === "dark"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a className="header-cta" href="#randevu">{t.book} <ArrowRight size={15} /></a>
          <button className="mobile-menu" type="button" aria-label={isMenuOpen ? t.menuClose : t.menuOpen} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={22} /></button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-image" role="img" aria-label={t.galleryLabels[0]} />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> {t.location}</p>
          <h1>{t.heroTitle[0]}<br /><em>{t.heroTitle[1]}</em></h1>
          <p className="hero-copy">{t.heroCopy}</p>
          <a className="hero-button" href="#randevu">{t.bookNow} <ArrowRight size={17} /></a>
        </div>
        <div className="hero-side-note">CRAFT · KARAKÖY · ISTANBUL</div>
        <a className="scroll-cue" href="#hikaye" aria-label={t.nav[0]}><ArrowDown size={16} /><span>{t.scroll}</span></a>
        <div className="hero-index"><span>01</span><i /> 03</div>
      </section>

      <section className="intro section-wrap" id="hikaye" data-reveal>
        <div className="intro-label"><span className="eyebrow">{t.who}</span><span className="label-rule" /></div>
        <div className="intro-copy">
          <h2>{t.introTitle[0]}<br /><span>{t.introTitle[1]}</span></h2>
          <div className="intro-bottom">
            <p>{t.introCopy}</p>
            <a className="text-link" href="#film">{t.learn} <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="intro-stamp"><Scissors size={19} /><span>{t.stamp[0]}<br />{t.stamp[1]}</span></div>
      </section>

      <section className="film-section bg-olive text-paper" id="film">
        <div className="film-inner section-wrap">
          <div className="film-copy" data-reveal="left">
            <p className="eyebrow">{t.filmKicker}</p>
            <h2>{t.filmTitle[0]}<br /><em>{t.filmTitle[1]}</em></h2>
            <p>{t.filmCopy}</p>
            <span className="film-label"><span />{t.filmLabel}</span>
          </div>
          <div className="film-frame" data-reveal="right">
            <video controls playsInline preload="none" poster="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=85" aria-label={t.filmLabel}>
              <source src="https://videos.pexels.com/video-files/7697084/7697084-hd_1080_1920_30fps.mp4" type="video/mp4" />
              {t.filmCopy}
            </video>
            <span className="film-credit"><a href="https://www.pexels.com/video/haircut-at-barber-shop-7697084/" target="_blank" rel="noreferrer">{t.filmCredit}</a></span>
          </div>
        </div>
      </section>

      <section className="gallery-section section-wrap" aria-labelledby="gallery-title">
        <div className="gallery-heading">
          <div data-reveal><p className="eyebrow">{t.galleryKicker}</p><h2 id="gallery-title">{t.galleryTitle[0]}<br /><em>{t.galleryTitle[1]}</em></h2></div>
          <p>{t.galleryCopy}</p>
        </div>
        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <figure className={`gallery-tile gallery-tile-${index + 1}`} key={item.image} data-reveal>
              <div className="gallery-photo" role="img" aria-label={t.galleryLabels[index]} style={{ backgroundImage: `url("${item.image}")`, backgroundPosition: item.position }} />
              <figcaption><span>0{index + 1}</span><strong>{t.galleryLabels[index]}</strong><ArrowRight size={16} /></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="campaigns-section section-wrap" id="kampanyalar">
        <div className="campaigns-heading">
          <div data-reveal><p className="eyebrow">{t.campaignKicker}</p><h2>{t.campaignTitle[0]}<br /><em>{t.campaignTitle[1]}</em></h2></div>
          <p>{t.campaignCopy}</p>
        </div>
        <div className="campaign-grid grid grid-cols-1 gap-3 md:grid-cols-3">
          {campaigns.map((campaign, index) => {
            const CampaignIcon = campaign.icon;
            return (
              <article className={`campaign-card campaign-card-${index + 1}`} key={campaign.label.tr} data-reveal>
                <div className="campaign-card-top"><span>0{index + 1} / 03</span><CampaignIcon size={20} strokeWidth={1.6} /></div>
                <span className="campaign-label">{campaign.label[language]}</span>
                <h3>{campaign.title[language]}</h3>
                <p>{campaign.description[language]}</p>
                {campaign.price && <div className="campaign-price"><del>{campaign.oldPrice}</del><strong>{campaign.price}</strong></div>}
                <button className="campaign-action" type="button" onClick={() => { setService(campaign.service); document.querySelector("#randevu")?.scrollIntoView({ behavior: "smooth" }); }}>
                  {t.campaignAction}<ArrowRight size={15} />
                </button>
              </article>
            );
          })}
        </div>
        <p className="campaign-terms">{t.campaignTerms}</p>
      </section>

      <section className="services bg-ink text-paper" id="hizmetler">
        <div className="section-wrap services-inner">
          <div className="section-heading">
            <div data-reveal><p className="eyebrow">{t.serviceKicker}</p><h2>{t.serviceTitle[0]}<br /><em>{t.serviceTitle[1]}</em></h2></div>
            <p className="section-aside">{t.serviceAside[0]}<br />{t.serviceAside[1]}</p>
          </div>
          <div className="service-list">
            {services.map((item, index) => (
              <button className={`service-row ${service === item.key ? "is-selected" : ""}`} key={item.key} type="button" data-reveal onClick={() => { setService(item.key); document.querySelector("#randevu")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span className="service-number">0{index + 1}</span>
                <span className="service-info"><strong>{item.name[language]}</strong><small>{item.detail[language]}</small></span>
                <span className="service-duration"><Clock3 size={14} />{item.duration[language]}</span>
                <span className="service-price">{item.price}</span>
                <ArrowRight className="service-arrow" size={18} />
              </button>
            ))}
          </div>
          <p className="service-footnote">{t.serviceNote}</p>
        </div>
      </section>

      <section className="reviews-section" id="yorumlar">
        <div className="section-wrap">
          <div className="reviews-heading">
            <div data-reveal><p className="eyebrow">{t.reviewKicker}</p><h2>{t.reviewTitle[0]}<br /><em>{t.reviewTitle[1]}</em></h2></div>
            <div className="review-controls">
              <span>{String(reviewIndex + 1).padStart(2, "0")} / {String(reviews.length).padStart(2, "0")}</span>
              <button type="button" aria-label={t.reviewPrevious} onClick={() => setReviewIndex((index) => (index + reviews.length - 1) % reviews.length)}><ChevronLeft size={18} /></button>
              <button type="button" aria-label={t.reviewNext} onClick={() => setReviewIndex((index) => (index + 1) % reviews.length)}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="review-grid grid grid-cols-1 gap-3 md:grid-cols-3" aria-live="polite">
            {[0, 1, 2].map((offset) => {
              const review = reviews[(reviewIndex + offset) % reviews.length];
              const serviceName = services.find((item) => item.key === review.service)?.name[language];
              return (
                <article className="review-bubble review-arrive" key={`${(reviewIndex + offset) % reviews.length}`}>
                  <div className="review-bubble-top"><Quote size={21} /><span>{t.reviewSample}</span></div>
                  <blockquote>{review.quote[language]}</blockquote>
                  <div className="review-meta"><span>{serviceName}</span><span>0{(reviewIndex + offset) % reviews.length + 1}</span></div>
                </article>
              );
            })}
          </div>
          <p className="review-note">{t.reviewCopy}</p>
        </div>
      </section>

      <section className="booking section-wrap" id="randevu">
        <div className="booking-intro" data-reveal="left">
          <p className="eyebrow">{t.bookingKicker}</p>
          <h2>{t.bookingTitle[0]}<br /><em>{t.bookingTitle[1]}</em></h2>
          <p className="booking-description">{t.bookingCopy[0]}<br />{t.bookingCopy[1]}</p>
          <div className="booking-address"><MapPin size={17} /><span>{t.address[0]}<br />{t.address[1]}</span></div>
          <div className="booking-trust"><ShieldCheck size={18} /><span>{t.trust}</span></div>
        </div>
        <form className="booking-form" data-reveal="right" noValidate onSubmit={submitAppointment}>
          <div className="form-heading"><span>{t.yourDetails}</span><span>{t.required}</span></div>
          <div className="field-grid grid gap-3 sm:grid-cols-2">
            <label className={`field ${fieldErrors.name ? "has-error" : ""}`} htmlFor="booking-name">
              <span>{t.fullName}</span>
              <input id="booking-name" name="name" type="text" placeholder={t.namePlaceholder} minLength={2} maxLength={80} autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "booking-name-error" : undefined} required onBlur={(event) => validateField("name", event.currentTarget.value)} onChange={(event) => updateFieldError("name", event.currentTarget.value)} />
              {fieldErrors.name && <small className="field-error" id="booking-name-error">{fieldErrorText[fieldErrors.name]}</small>}
            </label>
            <label className={`field ${fieldErrors.phone ? "has-error" : ""}`} htmlFor="booking-phone">
              <span>{t.phone}</span>
              <input id="booking-phone" name="phone" type="tel" inputMode="tel" placeholder={t.phonePlaceholder} autoComplete="tel" minLength={7} maxLength={20} pattern="[+0-9 ()-]{7,20}" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "booking-phone-error" : undefined} required onBlur={(event) => validateField("phone", event.currentTarget.value)} onChange={(event) => updateFieldError("phone", event.currentTarget.value)} />
              {fieldErrors.phone && <small className="field-error" id="booking-phone-error">{fieldErrorText[fieldErrors.phone]}</small>}
            </label>
          </div>
          <label className="field service-select"><span>{t.yourService}</span><select value={service} onChange={(event) => setService(event.target.value)}>{services.map((item) => <option key={item.key} value={item.key}>{item.name[language]}</option>)}</select></label>
          <div className="form-heading date-heading"><span>{t.chooseDate}</span><span>{t.hours}</span></div>
          <label className={`field date-field ${fieldErrors.date ? "has-error" : ""}`} htmlFor="booking-date">
            <span>{t.date}</span>
            <input id="booking-date" type="date" min={minDate} value={date} aria-invalid={Boolean(fieldErrors.date)} aria-describedby={fieldErrors.date ? "booking-date-error" : undefined} required onBlur={(event) => validateField("date", event.currentTarget.value)} onChange={(event) => { const nextDate = event.currentTarget.value; setDate(nextDate); setTime(""); updateFieldError("date", nextDate, nextDate); setFieldErrors((current) => ({ ...current, time: undefined })); }} />
            {fieldErrors.date && <small className="field-error" id="booking-date-error">{fieldErrorText[fieldErrors.date]}</small>}
          </label>
          <fieldset className={`time-fieldset ${fieldErrors.time ? "has-error" : ""}`} disabled={!date} aria-invalid={Boolean(fieldErrors.time)} aria-describedby={fieldErrors.time ? "booking-time-error" : undefined}>
            <legend>{t.time} {!date && <span>{t.pickDate}</span>}</legend>
            <div className="time-grid">
              {timeSlots.map((slot) => {
                const isPast = date === minDate && currentTime > 0 && new Date(`${date}T${slot}:00+03:00`).getTime() <= currentTime;
                return <button className={time === slot ? "is-active" : ""} key={slot} type="button" onClick={() => { setTime(slot); updateFieldError("time", slot, date); }} aria-pressed={time === slot} disabled={isPast}>{slot}</button>;
              })}
            </div>
            {fieldErrors.time && <small className="field-error" id="booking-time-error">{fieldErrorText[fieldErrors.time]}</small>}
          </fieldset>
          <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? t.submitting : t.submit}<ArrowRight size={17} /></button>
          {status && <p className={`form-status ${statusIsSuccess ? "success" : "error"}`} role={statusIsSuccess ? "status" : "alert"}>{statusIsSuccess && <Check size={16} />}{status}</p>}
          <p className="form-privacy">{t.privacy}</p>
        </form>
      </section>

      <footer className="site-footer">
        <a className="wordmark footer-mark" href="#home"><span>KÖK.</span><small>BARBER CLUB</small></a>
        <p>{t.footerLine[0]}<br />{t.footerLine[1]}</p>
        <a href="https://maps.google.com/?q=Bereketzade+Mahallesi+B%C3%BCy%C3%BCk+Hendek+Caddesi+Istanbul" target="_blank" rel="noreferrer">{t.directions} <ArrowRight size={14} /></a>
        <span className="footer-copy">© 2026 KÖK. BARBER CLUB</span>
      </footer>
    </main>
  );
}