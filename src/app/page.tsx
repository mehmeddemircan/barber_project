"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpDown, BadgePercent, Check, ChevronLeft, ChevronRight, Clock3, Download, Gift, GraduationCap, MapPin, Menu, MessageCircle, Moon, Quote, RefreshCw, Scissors, Search, ShieldCheck, Sun, X } from "lucide-react";
import { isSundayDate } from "@/lib/appointment-dates";

const services = [
  { key: "Klasik Kesim", name: { tr: "Klasik Kesim", en: "Classic Cut" }, detail: { tr: "Yıkama, kesim ve şekillendirme", en: "Wash, cut and styling" }, price: "₺650", duration: { tr: "40 dk", en: "40 min" } },
  { key: "Saç + Sakal", name: { tr: "Saç + Sakal", en: "Hair + Beard" }, detail: { tr: "Tam bakım, tek koltukta", en: "The complete chair experience" }, price: "₺950", duration: { tr: "60 dk", en: "60 min" } },
  { key: "Sakal Tasarımı", name: { tr: "Sakal Tasarımı", en: "Beard Shape" }, detail: { tr: "Sıcak havlu ve ustura dokunuşu", en: "Hot towel and straight-razor finish" }, price: "₺450", duration: { tr: "25 dk", en: "25 min" } },
];



const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
type Language = "tr" | "en";
type Theme = "light" | "dark";
type BookingField = "name" | "phone" | "date" | "time";
type FieldErrorCode = "nameRequired" | "nameTooShort" | "nameTooLong" | "phoneRequired" | "phoneInvalid" | "dateRequired" | "dateInvalid" | "datePast" | "dateClosed" | "timeRequired" | "timeInvalid" | "timePast" | "timeTaken";
type FieldErrors = Partial<Record<BookingField, FieldErrorCode>>;
type AvailabilityState = { date: string; bookedSlots: string[]; failed: boolean };
type AdminAppointment = { id: string; name: string; phone: string; service: string; date: string; time: string };
type AppointmentEdit = Pick<AdminAppointment, "name" | "phone" | "service" | "date" | "time">;
type AdminActionError = "invalid" | "closed" | "conflict" | "notFound" | "unavailable";

async function requestAdminAppointments(): Promise<AdminAppointment[] | null> {
  const response = await fetch("/api/admin/appointments", { cache: "no-store" });
  if (response.status === 401) return null;
  if (response.status === 503) throw new Error("notConfigured");
  if (!response.ok) throw new Error("loadError");
  const result = await response.json() as { appointments?: AdminAppointment[] };
  return result.appointments || [];
}

const adminContent = {
  tr: {
    entry: "Berber girişi",
    title: "Randevu yönetimi",
    description: "Yaklaşan randevular yalnızca yetkili berber tarafından görüntülenebilir.",
    password: "Yönetici parolası",
    login: "Giriş yap",
    loggingIn: "Kontrol ediliyor...",
    logout: "Çıkış yap",
    loading: "Randevular yükleniyor...",
    incorrect: "Parola hatalı.",
    notConfigured: "Yönetici girişi yapılandırılmamış. ADMIN_PASSWORD ve ADMIN_SESSION_SECRET ayarlarını ekleyin.",
    loadError: "Randevular yüklenemedi. Lütfen tekrar deneyin.",
    empty: "Yaklaşan randevu bulunmuyor.",
    date: "TARİH",
    time: "SAAT",
    name: "MÜŞTERİ",
    phone: "TELEFON",
    service: "HİZMET",
    count: "yaklaşan randevu",
    search: "Müşteri ara",
    searchPlaceholder: "İsim veya telefon numarası",
    filterDate: "Tarihe göre filtrele",
    allServices: "Tüm hizmetler",
    clearFilters: "Filtreleri temizle",
    showing: "gösteriliyor",
    previousPage: "Önceki sayfa",
    nextPage: "Sonraki sayfa",
    pageOf: " / ",
    rowsPerPage: "Sayfa başına",
    noResults: "Bu filtrelerle eşleşen randevu yok.",
    upcoming: "YAKLAŞAN",
    today: "BUGÜN",
    thisWeek: "BU HAFTA",
    sortDate: "Tarihe göre sırala",
    todayBadge: "BUGÜN",
    exportCsv: "CSV İNDİR",
    actions: "İŞLEM",
    edit: "DÜZENLE",
    cancel: "İPTAL ET",
    save: "KAYDET",
    discard: "VAZGEÇ",
    cancelConfirm: "Bu randevuyu iptal etmek istediğinizden emin misiniz?",
    invalid: "Bilgileri kontrol edin. Tarih geçmişte olamaz.",
    closed: "Berber pazar günleri kapalıdır.",
    conflict: "Seçilen saat başka bir randevuya ayrılmış.",
    notFound: "Randevu bulunamadı; listeyi yenileyin.",
    unavailable: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  },
  en: {
    entry: "Barber login",
    title: "Appointment management",
    description: "Upcoming appointments are visible to the authorized barber only.",
    password: "Admin password",
    login: "Log in",
    loggingIn: "Checking...",
    logout: "Log out",
    loading: "Loading appointments...",
    incorrect: "Incorrect password.",
    notConfigured: "Admin access is not configured. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
    loadError: "Appointments could not be loaded. Please try again.",
    empty: "There are no upcoming appointments.",
    date: "DATE",
    time: "TIME",
    name: "CUSTOMER",
    phone: "PHONE",
    service: "SERVICE",
    count: "upcoming appointments",
    search: "Search customers",
    searchPlaceholder: "Name or phone number",
    filterDate: "Filter by date",
    allServices: "All services",
    clearFilters: "Clear filters",
    showing: "shown",
    previousPage: "Previous page",
    nextPage: "Next page",
    pageOf: " of ",
    rowsPerPage: "Rows per page",
    noResults: "No appointments match these filters.",
    upcoming: "UPCOMING",
    today: "TODAY",
    thisWeek: "THIS WEEK",
    sortDate: "Sort by date",
    todayBadge: "TODAY",
    exportCsv: "EXPORT CSV",
    actions: "ACTIONS",
    edit: "EDIT",
    cancel: "CANCEL",
    save: "SAVE",
    discard: "DISCARD",
    cancelConfirm: "Are you sure you want to cancel this appointment?",
    invalid: "Check the details. The date cannot be in the past.",
    closed: "The barber is closed on Sundays.",
    conflict: "That time is already booked.",
    notFound: "Appointment not found; refresh the list.",
    unavailable: "The action failed. Please try again.",
  },
} as const;

const campaigns = [
  { icon: BadgePercent, label: { tr: "PAKET FİYATI", en: "BUNDLE PRICE" }, title: { tr: "İkili ritüel", en: "The two-part ritual" }, description: { tr: "Saç ve sakalı ayrı ayrı almak yerine tek randevuda tamamla.", en: "Book hair and beard together in one unhurried appointment." }, price: "₺950", oldPrice: "₺1.100", service: "Saç + Sakal" },
  { icon: Gift, label: { tr: "İLK RANDEVU", en: "FIRST VISIT" }, title: { tr: "Tanışma, bizden.", en: "A proper introduction." }, description: { tr: "İlk gelişinde kesim öncesi 10 dakikalık stil danışmanlığı ücretsiz.", en: "Enjoy a complimentary 10-minute style consultation before your first cut." }, service: "Klasik Kesim" },
  { icon: GraduationCap, label: { tr: "ÖĞRENCİ AVANTAJI", en: "STUDENT OFFER" }, title: { tr: "%10 öğrenci indirimi", en: "10% off for students" }, description: { tr: "Geçerli öğrenci kartını dükkânda göster; indirim ödemede uygulansın.", en: "Show a valid student ID in-store to receive your discount at checkout." }, service: "Klasik Kesim" },
];

const reviews = [
  { author: "Ali Yılmaz", service: "Klasik Kesim", quote: { tr: "Koltuğa oturunca acele yok. Kesim tam istediğim gibi oldu.", en: "No rush once you sit down. The cut was exactly what I wanted." } },
  { author: "Mert Kaya", service: "Sakal Tasarımı", quote: { tr: "Sıcak havlu ve ustura, sakal bakımı küçük bir ritüele dönüştü.", en: "The hot towel and straight razor made a beard trim feel like a ritual." } },
  { author: "Can Demir", service: "Klasik Kesim", quote: { tr: "Ne istediğimi dinleyip yüzüme uygun bir kesim önerdiler.", en: "They listened and suggested a cut that works with my face shape." } },
  { author: "Eren Çelik", service: "Saç + Sakal", quote: { tr: "Saç ve sakalı aynı koltukta halletmek büyük rahatlık.", en: "Getting my hair and beard done in one chair is a real treat." } },
  { author: "Burak Şahin", service: "Klasik Kesim", quote: { tr: "Detaylara gösterdikleri özen her gelişimde fark yaratıyor.", en: "The attention to detail makes every visit feel considered." } },
  { author: "Kaan Aydın", service: "Sakal Tasarımı", quote: { tr: "Randevu saatinde alındım, sonuç da tertemizdi.", en: "I was seen on time, and the finish was spot on." } },
  { author: "Emre Yıldız", service: "Saç + Sakal", quote: { tr: "İyi müzik, güzel sohbet, daha da iyi bir kesim.", en: "Good music, easy conversation, and an even better cut." } },
  { author: "Oğuz Arslan", service: "Klasik Kesim", quote: { tr: "Mekân ferah, ekip samimi; insan tekrar gelmek istiyor.", en: "A calm space and a welcoming team. You want to come back." } },
  { author: "Berk Koç", service: "Sakal Tasarımı", quote: { tr: "Talas'ta kendime ayırdığım en iyi saatlerden biri.", en: "One of the best hours I set aside for myself in Talas." } },
  { author: "Onur Özkan", service: "Saç + Sakal", quote: { tr: "Her gelişimde aynı özen, aynı iyi his.", en: "The same care and the same good feeling every time." } },
];

function maskReviewName(name: string) {
  return name.split(" ").map((part) => `${part.slice(0, 2)}${"*".repeat(Math.max(0, part.length - 2))}`).join(" ");
}

const content = {
  tr: {
    nav: ["Hikâyemiz", "Kampanyalar", "Hizmetler", "Yorumlar", "Randevu"], book: "Yerini ayırt", menuOpen: "Menüyü aç", menuClose: "Menüyü kapat", whatsappContact: "WhatsApp'tan yaz", whatsappSetup: "WhatsApp numarası yapılandırılmalı",
    whatsappMessage: "Merhaba, randevu ve hizmetler hakkında bilgi almak istiyorum.", cancellationLink: "Randevu iptal bağlantını sakla", cancellationLinkMessage: "Randevunu iptal etmen gerekirse kullanabileceğin bağlantı:",
    location: "TALAS, KAYSERİ", heroTitle: ["İYİ KESİM.", "İYİ HİS."], heroCopy: "Her şeyin hızlandığı bir şehirde, kendine ayırdığın iyi bir saat.", bookNow: "Randevunu oluştur", scroll: "AŞAĞI İN",
    who: "BİZ KİMİZ?", introTitle: ["Berberlik bir", "ritüeldir."], introCopy: "İyi bir kesimden fazlası. Kapıdan girdiğin andan son dokunuşa kadar, her şey yerli yerinde. Mahallenin ustaları, eski usul özen ve sana ayrılmış bir koltuk.", learn: "BERBERİMİZİ TANI", stamp: ["İYİ İŞ", "ZAMAN ALIR"],
    filmKicker: "DÜKKÂNIMIZDAN", filmTitle: ["USTALIK", "YAKINDAN."], filmCopy: "Makasın sesi, sıcak havlu, tanıdık bir koltuk. İyi bir kesim burada böyle başlar.", filmLabel: "BERBER SHOP · KISA FİLM · 00:08", filmCredit: "Video: Pexels / RDNE Stock project",
    galleryKicker: "KOLTUKTAN KARELER", galleryTitle: ["İŞİMİZ", "KONUŞSUN."], galleryCopy: "Her kesim başka, özen hep aynı.", galleryLabels: ["USTALIK", "DETAY", "SON DOKUNUŞ", "MAKASIN İZİ", "KOLTUKTA RİTÜEL", "TAMAMLANAN İŞ"], galleryOpen: "Fotoğrafı büyüt", galleryClose: "Galeriyi kapat", galleryPrevious: "Önceki fotoğraf", galleryNext: "Sonraki fotoğraf",
    campaignKicker: "BU ARA", campaignTitle: ["KÜÇÜK BİR", "İYİLİK."], campaignCopy: "Koltukta sana iyi gelecek birkaç neden.", campaignAction: "KAMPANYAYI SEÇ", campaignTerms: "Kampanya koşulları randevu sırasında dükkânda teyit edilir.",
    reviewKicker: "KOLTUKTAN SONRA", reviewTitle: ["SÖZÜ", "SİZDE."], reviewPrevious: "Önceki yorumlar", reviewNext: "Sonraki yorumlar",
    serviceKicker: "USTADAN UCA", serviceTitle: ["USTANIN", "ELİNDEN."], serviceAside: ["Ne lazımsa, özenle.", "Gerisi koltuğunda."], serviceNote: "* Fiyatlara KDV dahildir. Öğrenci indirimi için ustana danış.",
    bookingKicker: "KOLTUĞUN HAZIR", bookingTitle: ["TAKVİMİNDE", "YER AÇ."], bookingCopy: ["İyi bir saat kendiliğinden gelmez.", "Senin için ayıralım."], address: ["Mevlana Mah. Mehmet Timuçin Cad.", "Özkan Sok. No: 1 D:C, 38280 Talas / Kayseri"], trust: "Bilgilerin güvende. Ödeme dükkânda.", locationTitle: "DÜKKÂNDA BULUŞALIM.",
    yourDetails: "01 — BİLGİLERİN", required: "* Zorunlu alanlar", fullName: "AD SOYAD *", namePlaceholder: "Adın soyadın", phone: "TELEFON *", phonePlaceholder: "05__ ___ __ __", yourService: "HİZMETİN", chooseDate: "02 — GÜNÜNÜ SEÇ", hours: "09:30 — 19:00", date: "TARİH", time: "SAAT", pickDate: "— önce tarih seç", quickDates: "YAKIN TARİHLER", bookingSummary: "RANDEVU ÖZETİ", summaryChooseDate: "Tarih ve saatini seç", booked: "DOLU", availabilityLoading: "Saatler kontrol ediliyor...", availabilityUnavailable: "Müsait saatler yüklenemedi. Tekrar deneyin.", availableSlots: "Uygun saat", submit: "RANDEVUMU OLUŞTUR", submitting: "RANDEVUN OLUŞTURULUYOR...", privacy: "Randevu talebin onaylandığında seni telefonla arayacağız.", validationSummary: "Lütfen işaretli alanları kontrol et.", nameRequired: "Ad soyad alanı zorunludur.", nameTooShort: "Ad soyad en az 2 karakter olmalı.", nameTooLong: "Ad soyad en fazla 80 karakter olabilir.", phoneRequired: "Telefon numarası zorunludur.", phoneInvalid: "7–20 karakterli, geçerli bir telefon numarası gir.", dateRequired: "Lütfen bir tarih seç.", dateInvalid: "Geçerli bir tarih seç.", datePast: "Geçmiş bir tarih seçilemez.", timeRequired: "Lütfen uygun bir saat seç.", timeInvalid: "Listeden geçerli bir saat seç.", timePast: "Geçmiş bir saat seçilemez.", timeTaken: "Bu saat doldu; lütfen başka bir saat seç.",
    dateClosed: "Berber pazar günleri kapalıdır. Lütfen başka bir gün seçin.",
    success: "Randevunuz alındı. Sizi bekliyoruz!", invalid: "Lütfen bilgileri kontrol edip tekrar deneyin.", conflict: "Bu saat az önce doldu. Lütfen başka bir saat seçin.", unavailable: "Şu an randevu oluşturulamıyor. Lütfen daha sonra tekrar deneyin.", network: "Bağlantı kurulamadı. Lütfen tekrar deneyin.", genericError: "Bir hata oluştu.",
    footerLine: ["İYİ KESİM, İYİ MUHABBET.", "TALAS'TA BULUŞALIM."], directions: "YOL TARİFİ", themeLight: "Açık temaya geç", themeDark: "Koyu temaya geç", languageLabel: "Dili seç",
  },
  en: {
    nav: ["Our Story", "Offers", "Services", "Reviews", "Book"], book: "Book a chair", menuOpen: "Open menu", menuClose: "Close menu", whatsappContact: "Chat on WhatsApp", whatsappSetup: "Set the WhatsApp number first",
    whatsappMessage: "Hi, I'd like to ask about appointments and services.", cancellationLink: "Save your cancellation link", cancellationLinkMessage: "Use this link if you need to cancel your appointment:",
    location: "TALAS, KAYSERİ", heroTitle: ["A GOOD CUT.", "A GOOD FEEL."], heroCopy: "In a city that never slows down, take one good hour for yourself.", bookNow: "Book your appointment", scroll: "SCROLL TO EXPLORE",
    who: "WHO WE ARE", introTitle: ["A barber visit", "is a ritual."], introCopy: "More than a good cut. From the moment you walk in to the final touch, everything is in its place. Neighbourhood craft, old-school care, and a chair that is yours.", learn: "MEET YOUR BARBER", stamp: ["GOOD WORK", "TAKES TIME"],
    filmKicker: "INSIDE THE SHOP", filmTitle: ["CRAFT,", "UP CLOSE."], filmCopy: "The sound of shears, a warm towel, a familiar chair. This is where a good cut begins.", filmLabel: "BARBER SHOP · SHORT FILM · 00:08", filmCredit: "Video: Pexels / RDNE Stock project",
    galleryKicker: "FRAMES FROM THE CHAIR", galleryTitle: ["LET THE", "CRAFT SPEAK."], galleryCopy: "Every cut is different. The care is always the same.", galleryLabels: ["THE CRAFT", "THE DETAIL", "THE FINISH", "THE ART OF THE CUT", "THE CHAIR RITUAL", "A FINISHED LOOK"], galleryOpen: "Enlarge photo", galleryClose: "Close gallery", galleryPrevious: "Previous photo", galleryNext: "Next photo",
    campaignKicker: "CURRENT OFFERS", campaignTitle: ["A LITTLE", "EXTRA CARE."], campaignCopy: "A few more reasons to take your place in the chair.", campaignAction: "CHOOSE THIS OFFER", campaignTerms: "Offer details are confirmed in-store when you book.",
    reviewKicker: "AFTER THE CHAIR", reviewTitle: ["OVER TO", "YOU."], reviewPrevious: "Previous reviews", reviewNext: "Next reviews",
    serviceKicker: "FROM ROOT TO TIP", serviceTitle: ["IN GOOD", "HANDS."], serviceAside: ["Whatever you need, done with care.", "The rest is in the chair."], serviceNote: "* Prices include VAT. Ask your barber about student pricing.",
    bookingKicker: "YOUR CHAIR IS READY", bookingTitle: ["MAKE ROOM", "IN YOUR DAY."], bookingCopy: ["A good hour doesn't just happen.", "Let's save one for you."], address: ["Mevlana Mah. Mehmet Timuçin Cad.", "Özkan Sok. No: 1 D:C, 38280 Talas / Kayseri"], trust: "Your details stay private. Pay in-store.", locationTitle: "MEET US IN TALAS.",
    yourDetails: "01 — YOUR DETAILS", required: "* Required fields", fullName: "FULL NAME *", namePlaceholder: "Your full name", phone: "PHONE *", phonePlaceholder: "+90 ___ ___ __ __", yourService: "YOUR SERVICE", chooseDate: "02 — PICK A DAY", hours: "09:30 — 19:00", date: "DATE", time: "TIME", pickDate: "— choose a date first", quickDates: "UPCOMING DAYS", bookingSummary: "APPOINTMENT SUMMARY", summaryChooseDate: "Choose a date and time", booked: "FULL", availabilityLoading: "Checking available times...", availabilityUnavailable: "Available times couldn't be loaded. Please try again.", availableSlots: "Available times", submit: "BOOK MY APPOINTMENT", submitting: "BOOKING YOUR CHAIR...", privacy: "We'll call to confirm your appointment request.", validationSummary: "Please check the highlighted fields.", nameRequired: "Please enter your full name.", nameTooShort: "Your name must be at least 2 characters.", nameTooLong: "Your name must be 80 characters or fewer.", phoneRequired: "Please enter your phone number.", phoneInvalid: "Enter a valid phone number using 7–20 characters.", dateRequired: "Please choose a date.", dateInvalid: "Choose a valid date.", datePast: "Past dates are not available.", timeRequired: "Please choose an available time.", timeInvalid: "Choose a time from the list.", timePast: "Past times are not available.", timeTaken: "That time just filled up. Please choose another.",
    dateClosed: "The barber is closed on Sundays. Please choose another day.",
    success: "Your appointment is booked. See you soon!", invalid: "Please check your details and try again.", conflict: "That time just filled up. Please choose another.", unavailable: "We can't book right now. Please try again later.", network: "Connection failed. Please try again.", genericError: "Something went wrong.",
    footerLine: ["GOOD CUTS. GOOD CONVERSATION.", "SEE YOU IN TALAS."], directions: "GET DIRECTIONS", themeLight: "Switch to light theme", themeDark: "Switch to dark theme", languageLabel: "Choose language",
  },
} as const;

const gallery = [
  { image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1100&q=85", position: "center 42%" },
  { image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=85", position: "center 40%" },
  { image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=85", position: "center 45%" },
  { image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85", position: "center 50%" },
  { image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85", position: "center 45%" },
  { image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=85", position: "center 50%" },
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

function getSuggestedDates(startDate: string) {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  const suggestedDates = [startDate];

  while (suggestedDates.length < 3) {
    date.setUTCDate(date.getUTCDate() + 1);
    const value = date.toISOString().slice(0, 10);
    if (!isSundayDate(value)) suggestedDates.push(value);
  }

  return suggestedDates;
}

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`wordmark ${footer ? "footer-mark" : ""}`} href="#home" aria-label="Mehmet İrşad Güder Barber Shop — ana sayfa">
      <svg className="brand-symbol" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="3" y="3" width="58" height="58" rx="14" fill="#172420" />
        <rect x="5" y="5" width="54" height="54" rx="12" fill="none" stroke="#e5b02e" strokeWidth="2" />
        <path d="M17 45V19h6l9 12 9-12h6v26h-7V30l-8 10-8-10v15z" fill="#e5b02e" />
        <path d="M13 51h38" stroke="#f7f9f6" strokeLinecap="round" strokeWidth="2" />
      </svg>
      <span className="brand-type">
        <strong>MEHMET İRŞAD</strong>
        <strong>GÜDER</strong>
        <small>BARBER SHOP</small>
      </span>
    </a>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("tr");
  const [service, setService] = useState(services[0].key);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);
  const [whatsappDraftHref, setWhatsappDraftHref] = useState("");
  const [bookingCancellationHref, setBookingCancellationHref] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [availability, setAvailability] = useState<AvailabilityState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [theme, setTheme] = useState<Theme>("light");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminAppointments, setAdminAppointments] = useState<AdminAppointment[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState<"incorrect" | "notConfigured" | "loadError" | "">("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [editingAppointmentId, setEditingAppointmentId] = useState("");
  const [appointmentEdit, setAppointmentEdit] = useState<AppointmentEdit | null>(null);
  const [adminActionError, setAdminActionError] = useState<AdminActionError | "">("");
  const [adminBusyId, setAdminBusyId] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminDateFilter, setAdminDateFilter] = useState("");
  const [adminServiceFilter, setAdminServiceFilter] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(10);
  const [adminSortDescending, setAdminSortDescending] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const galleryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const galleryDialogRef = useRef<HTMLDivElement | null>(null);
  const galleryCloseRef = useRef<HTMLButtonElement | null>(null);
  const t = content[language];
  const adminText = adminContent[language];
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t.whatsappMessage)}` : "";
  const minDate = istanbulDateValue(new Date());
  const weekEnd = new Date(`${minDate}T00:00:00.000Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const weekEndDate = weekEnd.toISOString().slice(0, 10);
  const filteredAdminAppointments = adminAppointments
    .filter((appointment) => {
      const query = adminSearch.trim().toLocaleLowerCase(language === "tr" ? "tr-TR" : "en-GB");
      const matchesSearch = !query || `${appointment.name} ${appointment.phone}`.toLocaleLowerCase(language === "tr" ? "tr-TR" : "en-GB").includes(query);
      return matchesSearch
        && (!adminDateFilter || appointment.date === adminDateFilter)
        && (!adminServiceFilter || appointment.service === adminServiceFilter);
    })
    .sort((first, second) => {
      const order = first.date.localeCompare(second.date) || first.time.localeCompare(second.time);
      return adminSortDescending ? -order : order;
    });
  const adminPageCount = Math.max(1, Math.ceil(filteredAdminAppointments.length / adminPageSize));
  const visibleAdminPage = Math.min(adminPage, adminPageCount);
  const adminPageStart = (visibleAdminPage - 1) * adminPageSize;
  const pagedAdminAppointments = filteredAdminAppointments.slice(adminPageStart, adminPageStart + adminPageSize);
  const todayAppointments = adminAppointments.filter((appointment) => appointment.date === minDate).length;
  const weekAppointments = adminAppointments.filter((appointment) => appointment.date >= minDate && appointment.date < weekEndDate).length;
  const hasAdminFilters = Boolean(adminSearch || adminDateFilter || adminServiceFilter);
  const suggestedDates = getSuggestedDates(minDate);
  const selectedService = services.find((item) => item.key === service) || services[0];
  const currentAvailability = availability?.date === date ? availability : null;
  const bookedSlots = currentAvailability?.bookedSlots ?? [];
  const availabilityLoading = Boolean(date && !isSundayDate(date) && !currentAvailability);
  const fieldErrorText: Record<FieldErrorCode, string> = {
    nameRequired: t.nameRequired,
    nameTooShort: t.nameTooShort,
    nameTooLong: t.nameTooLong,
    phoneRequired: t.phoneRequired,
    phoneInvalid: t.phoneInvalid,
    dateRequired: t.dateRequired,
    dateInvalid: t.dateInvalid,
    datePast: t.datePast,
    dateClosed: t.dateClosed,
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
    if (!date || isSundayDate(date)) return;

    const controller = new AbortController();
    fetch(`/api/appointments?date=${encodeURIComponent(date)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Availability request failed");
        return response.json() as Promise<{ bookedSlots?: string[] }>;
      })
      .then((result) => setAvailability({ date, bookedSlots: result.bookedSlots || [], failed: false }))
      .catch(() => {
        if (!controller.signal.aborted) setAvailability({ date, bookedSlots: [], failed: true });
      });

    return () => controller.abort();
  }, [date]);

  useEffect(() => {
    if (!isAdminOpen) return;

    let active = true;
    requestAdminAppointments()
      .then((appointments) => {
        if (!active) return;
        setAdminAuthenticated(appointments !== null);
        setAdminAppointments(appointments || []);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAdminError(error instanceof Error && error.message === "notConfigured" ? "notConfigured" : "loadError");
      })
      .finally(() => {
        if (active) setAdminLoading(false);
      });

    return () => { active = false; };
  }, [isAdminOpen, adminRefreshKey]);

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
    document.title = language === "tr"
      ? "Mehmet İrşad Güder Barber Shop | Talas, Kayseri"
      : "Mehmet İrşad Güder Barber Shop | Talas, Kayseri";
    window.localStorage.setItem("kok-language", language);
    window.localStorage.setItem("kok-theme", theme);
  }, [language, theme]);

  useEffect(() => {
    if (activeGalleryIndex === null) {
      galleryTriggerRef.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    galleryCloseRef.current?.focus();

    function handleGalleryKeys(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveGalleryIndex(null);
      if (event.key === "ArrowRight") setActiveGalleryIndex((index) => index === null ? null : (index + 1) % gallery.length);
      if (event.key === "ArrowLeft") setActiveGalleryIndex((index) => index === null ? null : (index + gallery.length - 1) % gallery.length);
      if (event.key === "Tab") {
        const focusable = galleryDialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleGalleryKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleGalleryKeys);
    };
  }, [activeGalleryIndex]);

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
      if (isSundayDate(value)) return "dateClosed";
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

  function selectBookingDate(nextDate: string) {
    setDate(nextDate);
    setTime("");
    updateFieldError("date", nextDate, nextDate);
    setFieldErrors((current) => ({ ...current, time: undefined }));
  }

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWhatsappDraftHref("");
    setBookingCancellationHref("");
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
    const whatsappDraftWindow = whatsappNumber ? window.open("about:blank", "_blank") : null;
    if (whatsappDraftWindow) whatsappDraftWindow.opener = null;

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
      const result = await response.json() as { cancellationToken?: string };
      if (response.ok) {
        if (!result.cancellationToken) throw new Error("Cancellation token was not returned");
        const cancellationUrl = new URL("/randevu/iptal", window.location.origin);
        cancellationUrl.searchParams.set("token", result.cancellationToken);
        cancellationUrl.searchParams.set("lang", language);
        const cancellationHref = cancellationUrl.toString();
        setBookingCancellationHref(cancellationHref);
        const serviceName = services.find((item) => item.key === service)?.name[language] || service;
        const dateLabel = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
          dateStyle: "long",
          timeZone: "Europe/Istanbul",
        }).format(new Date(`${date}T12:00:00+03:00`));
        const message = language === "tr"
          ? `Merhaba, ben ${name}. ${dateLabel} tarihinde saat ${time} için ${serviceName} randevusu aldım.\n\n${t.cancellationLinkMessage}\n${cancellationHref}`
          : `Hi, this is ${name}. I booked a ${serviceName} appointment for ${dateLabel} at ${time}.\n\n${t.cancellationLinkMessage}\n${cancellationHref}`;
        const draftHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}` : "";
        if (draftHref) {
          setWhatsappDraftHref(draftHref);
          if (whatsappDraftWindow && !whatsappDraftWindow.closed) whatsappDraftWindow.location.href = draftHref;
        } else {
          whatsappDraftWindow?.close();
        }
        setStatusIsSuccess(true);
        setStatus(whatsappNumber ? language === "tr" ? "Randevun alındı. Taslağı WhatsApp'tan berbere gönderebilirsin." : "Your booking is saved. Send the WhatsApp draft to the barber." : t.success);
      } else {
        whatsappDraftWindow?.close();
        setStatusIsSuccess(false);
        setStatus(response.status === 409 ? t.timeTaken : response.status === 400 ? t.invalid : t.unavailable);
      }
      if (response.status === 409) {
        setFieldErrors((current) => ({ ...current, time: "timeTaken" }));
        setAvailability((current) => current?.date === date ? { ...current, bookedSlots: [...new Set([...current.bookedSlots, time])] } : current);
      }
      if (response.ok) {
        form.reset();
        setDate("");
        setTime("");
        setFieldErrors({});
      }
    } catch {
      whatsappDraftWindow?.close();
      setStatusIsSuccess(false);
      setStatus(t.network);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminSubmitting(true);
    setAdminError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (response.status === 401) {
        setAdminError("incorrect");
        return;
      }
      if (response.status === 503) {
        setAdminError("notConfigured");
        return;
      }
      if (!response.ok) throw new Error("Admin login failed");

      setAdminPassword("");
      setAdminError("");
      setAdminAuthenticated(true);
      setAdminLoading(true);
      try {
        const appointments = await requestAdminAppointments();
        if (appointments === null) {
          setAdminAuthenticated(false);
          setAdminError("loadError");
          return;
        }
        setAdminAppointments(appointments);
      } finally {
        setAdminLoading(false);
      }
    } catch {
      setAdminError("loadError");
    } finally {
      setAdminSubmitting(false);
    }
  }

  async function logoutAdmin() {
    setAdminError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Admin logout failed");
      setAdminAuthenticated(false);
      setAdminAppointments([]);
      setAdminPassword("");
    } catch {
      setAdminError("loadError");
    }
  }

  function beginAppointmentEdit(appointment: AdminAppointment) {
    setEditingAppointmentId(appointment.id);
    setAppointmentEdit({
      name: appointment.name,
      phone: appointment.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
    });
    setAdminActionError("");
  }

  function discardAppointmentEdit() {
    setEditingAppointmentId("");
    setAppointmentEdit(null);
    setAdminActionError("");
  }

  async function saveAppointmentEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAppointmentId || !appointmentEdit) return;

    setAdminBusyId(editingAppointmentId);
    setAdminActionError("");
    try {
      const response = await fetch(`/api/admin/appointments/${encodeURIComponent(editingAppointmentId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentEdit),
      });
      if (!response.ok) {
        const result = await response.json() as { code?: AdminActionError };
        if (result.code === "closed" || result.code === "conflict" || result.code === "invalid" || result.code === "notFound") {
          setAdminActionError(result.code);
        } else {
          setAdminActionError("unavailable");
        }
        return;
      }

      setAdminAppointments((appointments) => appointments.map((appointment) =>
        appointment.id === editingAppointmentId ? { ...appointment, ...appointmentEdit } : appointment,
      ).sort((first, second) => first.date.localeCompare(second.date) || first.time.localeCompare(second.time)));
      discardAppointmentEdit();
    } catch {
      setAdminActionError("unavailable");
    } finally {
      setAdminBusyId("");
    }
  }

  async function cancelAppointment(appointment: AdminAppointment) {
    if (!window.confirm(adminText.cancelConfirm)) return;

    setAdminBusyId(appointment.id);
    setAdminActionError("");
    try {
      const response = await fetch(`/api/admin/appointments/${encodeURIComponent(appointment.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json() as { code?: AdminActionError };
        if (result.code === "notFound") setAdminActionError("notFound");
        else setAdminActionError("unavailable");
        return;
      }
      setAdminAppointments((appointments) => appointments.filter((item) => item.id !== appointment.id));
      if (editingAppointmentId === appointment.id) discardAppointmentEdit();
    } catch {
      setAdminActionError("unavailable");
    } finally {
      setAdminBusyId("");
    }
  }

  function toggleAdminPanel() {
    if (!isAdminOpen) {
      setAdminLoading(true);
      setAdminError("");
    }
    setIsAdminOpen(!isAdminOpen);
  }

  function refreshAdminAppointments() {
    setAdminLoading(true);
    setAdminError("");
    setAdminRefreshKey((key) => key + 1);
  }

  function clearAdminFilters() {
    setAdminSearch("");
    setAdminDateFilter("");
    setAdminServiceFilter("");
    setAdminPage(1);
  }

  function exportAdminAppointments() {
    const rows = [
      [adminText.date, adminText.time, adminText.name, adminText.phone, adminText.service],
      ...filteredAdminAppointments.map((appointment) => [
        appointment.date,
        appointment.time,
        appointment.name,
        appointment.phone,
        services.find((item) => item.key === appointment.service)?.name[language] || appointment.service,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((value) => {
      const safeValue = String(value).replace(/^[\t\r ]*[=+\-@]/, (match) => `'${match}`);
      return `"${safeValue.replace(/"/g, '""')}"`;
    }).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mehmet-irsad-guder-randevular-${minDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <main className="site-shell min-h-screen bg-paper text-ink antialiased" data-theme={theme}>
      <header className="site-header">
        <BrandLogo />
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
        <div className="hero-side-note">CRAFT · TALAS · KAYSERİ</div>
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
              <button
                className="gallery-open"
                type="button"
                aria-label={`${t.galleryOpen}: ${t.galleryLabels[index]}`}
                onClick={(event) => {
                  galleryTriggerRef.current = event.currentTarget;
                  setActiveGalleryIndex(index);
                }}
              >
                <span className="gallery-photo" role="img" aria-label={t.galleryLabels[index]} style={{ backgroundImage: `url("${item.image}")`, backgroundPosition: item.position }} />
              </button>
              <figcaption><span>0{index + 1}</span><strong>{t.galleryLabels[index]}</strong><ArrowRight size={16} /></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {activeGalleryIndex !== null && (
        <div className="gallery-lightbox" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveGalleryIndex(null); }}>
          <div className="gallery-lightbox-panel" ref={galleryDialogRef} role="dialog" aria-modal="true" aria-label={t.galleryLabels[activeGalleryIndex]}>
            <button className="gallery-lightbox-close" type="button" ref={galleryCloseRef} aria-label={t.galleryClose} onClick={() => setActiveGalleryIndex(null)}><X size={21} /></button>
            <div className="gallery-lightbox-image" role="img" aria-label={t.galleryLabels[activeGalleryIndex]} style={{ backgroundImage: `url("${gallery[activeGalleryIndex].image}")`, backgroundPosition: gallery[activeGalleryIndex].position }} />
            <div className="gallery-lightbox-caption">
              <span>0{activeGalleryIndex + 1} / 0{gallery.length}</span>
              <strong>{t.galleryLabels[activeGalleryIndex]}</strong>
              <div>
                  <button type="button" aria-label={t.galleryPrevious} onClick={() => setActiveGalleryIndex((activeGalleryIndex + gallery.length - 1) % gallery.length)}><ChevronLeft size={20} /></button>
                  <button type="button" aria-label={t.galleryNext} onClick={() => setActiveGalleryIndex((activeGalleryIndex + 1) % gallery.length)}><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="review-bubble-top"><Quote size={21} /></div>
                  <blockquote>{review.quote[language]}</blockquote>
                  <div className="review-meta"><span>{maskReviewName(review.author)}</span><span>{serviceName}</span></div>
                </article>
              );
            })}
          </div>
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
            <input id="booking-date" type="date" min={minDate} value={date} aria-invalid={Boolean(fieldErrors.date)} aria-describedby={fieldErrors.date ? "booking-date-error" : undefined} required onBlur={(event) => validateField("date", event.currentTarget.value)} onChange={(event) => selectBookingDate(event.currentTarget.value)} />
            {fieldErrors.date && <small className="field-error" id="booking-date-error">{fieldErrorText[fieldErrors.date]}</small>}
          </label>
          <div className="quick-dates" aria-label={t.quickDates}>
            <span>{t.quickDates}</span>
            <div>
              {suggestedDates.map((suggestedDate) => {
                const isToday = suggestedDate === minDate;
                const label = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: "Europe/Istanbul",
                }).format(new Date(`${suggestedDate}T12:00:00+03:00`));
                return <button className={date === suggestedDate ? "is-selected" : ""} type="button" key={suggestedDate} aria-pressed={date === suggestedDate} disabled={isSundayDate(suggestedDate)} onClick={() => selectBookingDate(suggestedDate)}>{isToday ? language === "tr" ? "Bugün" : "Today" : label}</button>;
              })}
            </div>
          </div>
          <fieldset className={`time-fieldset ${fieldErrors.time ? "has-error" : ""}`} disabled={!date || isSundayDate(date) || availabilityLoading || Boolean(currentAvailability?.failed)} aria-invalid={Boolean(fieldErrors.time)} aria-describedby={fieldErrors.time ? "booking-time-error" : undefined}>
            <legend>{t.time} {!date ? <span>{t.pickDate}</span> : availabilityLoading ? <span>{t.availabilityLoading}</span> : null}</legend>
            <div className="time-grid">
              {timeSlots.map((slot) => {
                const isPast = date === minDate && currentTime > 0 && new Date(`${date}T${slot}:00+03:00`).getTime() <= currentTime;
                const isBooked = bookedSlots.includes(slot);
                const isUnavailable = isSundayDate(date) || isPast || isBooked || availabilityLoading || Boolean(currentAvailability?.failed);
                return (
                  <button className={`${time === slot ? "is-active" : ""} ${isBooked ? "is-booked" : ""}`} key={slot} type="button" onClick={() => { setTime(slot); updateFieldError("time", slot, date); }} aria-label={isBooked ? `${slot}, ${t.booked}` : slot} aria-pressed={time === slot} disabled={isUnavailable}>
                    <span>{slot}</span>{isBooked && <small>{t.booked}</small>}
                  </button>
                );
              })}
            </div>
            {date && isSundayDate(date) && <small className="availability-message error" role="status">{t.dateClosed}</small>}
            {date && !availabilityLoading && currentAvailability?.failed && <small className="availability-message error" role="status">{t.availabilityUnavailable}</small>}
            {date && !isSundayDate(date) && currentAvailability && !currentAvailability.failed && <small className="availability-message" aria-live="polite">{t.availableSlots}: {timeSlots.filter((slot) => !bookedSlots.includes(slot) && !(date === minDate && currentTime > 0 && new Date(`${date}T${slot}:00+03:00`).getTime() <= currentTime)).length}</small>}
            {fieldErrors.time && <small className="field-error" id="booking-time-error">{fieldErrorText[fieldErrors.time]}</small>}
          </fieldset>
          <div className="booking-summary" aria-live="polite">
            <div>
              <span>{t.bookingSummary}</span>
              <strong>{selectedService.name[language]}</strong>
            </div>
            <div className="booking-summary-selection">
              <span>{date ? new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" }).format(new Date(`${date}T12:00:00+03:00`)) : t.summaryChooseDate}{time ? ` · ${time}` : ""}</span>
              <strong>{selectedService.price}</strong>
            </div>
            <small><Clock3 size={13} />{selectedService.duration[language]}</small>
          </div>
          <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? t.submitting : t.submit}<ArrowRight size={17} /></button>
          {status && <div className={`form-status ${statusIsSuccess ? "success" : "error"}`} role={statusIsSuccess ? "status" : "alert"}>{statusIsSuccess && <Check size={16} />}<span>{status}</span>{statusIsSuccess && whatsappDraftHref && <a className="whatsapp-draft-link" href={whatsappDraftHref} target="_blank" rel="noreferrer">{language === "tr" ? "WhatsApp taslağını aç" : "Open WhatsApp draft"}<ArrowRight size={13} /></a>}{statusIsSuccess && bookingCancellationHref && <a className="booking-cancel-link" href={bookingCancellationHref} target="_blank" rel="noreferrer">{t.cancellationLink}<ArrowRight size={13} /></a>}</div>}
          <p className="form-privacy">{t.privacy}</p>
        </form>
      </section>

      <section className="location-section" aria-labelledby="location-title">
        <div className="section-wrap">
          <div className="location-heading">
            <div>
              <p className="eyebrow">{t.location}</p>
              <h2 id="location-title">{t.locationTitle}</h2>
              <p>{t.address[0]}<br />{t.address[1]}</p>
            </div>
            <a href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x152b6d1a9cf072ff:0x6db250a86e7c64bd?sa=X&ved=1t:8290&ictx=111" target="_blank" rel="noreferrer">{t.directions} <ArrowRight size={15} /></a>
          </div>
          <div className="location-map">
            <iframe
              title={language === "tr" ? "Talas'taki berber dükkanımızın Google Haritalar konumu" : "Google Maps location of our barber shop in Talas"}
              src="https://maps.google.com/maps?q=Mevlana%20Mahallesi%20Mehmet%20Timu%C3%A7in%20Caddesi%2C%20%C3%96zkan%20Sokak%20No%3A1%2C%20Talas%2C%20Kayseri&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {isAdminOpen && (
        <section className="admin-section section-wrap" id="yonetim">
          <div className="admin-panel">
            <div className="admin-heading">
              <div>
                <p className="eyebrow">{adminText.entry}</p>
                <h2>{adminText.title}</h2>
                <p>{adminText.description}</p>
              </div>
              {adminAuthenticated && (
                <div className="admin-actions">
                  <span>{adminAppointments.length} {adminText.count}</span>
                  <button type="button" onClick={refreshAdminAppointments} disabled={adminLoading}><RefreshCw size={14} />{language === "tr" ? "YENİLE" : "REFRESH"}</button>
                  <button type="button" onClick={logoutAdmin}>{adminText.logout}</button>
                </div>
              )}
            </div>
            {adminError && <p className="admin-error" role="alert">{adminText[adminError]}</p>}
            {adminActionError && <p className="admin-error" role="alert">{adminText[adminActionError]}</p>}
            {adminLoading ? (
              <p className="admin-message" role="status">{adminText.loading}</p>
            ) : adminAuthenticated ? (
              <>
                <div className="admin-stats">
                  <article><span>{adminText.upcoming}</span><strong>{adminAppointments.length}</strong><small>{adminText.count}</small></article>
                  <article><span>{adminText.today}</span><strong>{todayAppointments}</strong><small>{minDate}</small></article>
                  <article><span>{adminText.thisWeek}</span><strong>{weekAppointments}</strong><small>{language === "tr" ? "Önümüzdeki 7 gün" : "Next 7 days"}</small></article>
                </div>
                <div className="admin-toolbar">
                  <label className="admin-search">
                    <Search size={16} aria-hidden="true" />
                    <input type="search" value={adminSearch} placeholder={adminText.searchPlaceholder} aria-label={adminText.search} onChange={(event) => { setAdminSearch(event.currentTarget.value); setAdminPage(1); }} />
                  </label>
                  <label className="admin-filter">
                    <span>{adminText.filterDate}</span>
                    <input type="date" value={adminDateFilter} aria-label={adminText.filterDate} onChange={(event) => { setAdminDateFilter(event.currentTarget.value); setAdminPage(1); }} />
                  </label>
                  <label className="admin-filter">
                    <span>{adminText.service}</span>
                    <select value={adminServiceFilter} aria-label={adminText.service} onChange={(event) => { setAdminServiceFilter(event.currentTarget.value); setAdminPage(1); }}>
                      <option value="">{adminText.allServices}</option>
                      {services.map((item) => <option key={item.key} value={item.key}>{item.name[language]}</option>)}
                    </select>
                  </label>
                  {hasAdminFilters && <button className="admin-clear-filters" type="button" onClick={clearAdminFilters}>{adminText.clearFilters}</button>}
                  <button className="admin-export" type="button" onClick={exportAdminAppointments} disabled={!filteredAdminAppointments.length}><Download size={14} />{adminText.exportCsv}</button>
                </div>
                {filteredAdminAppointments.length ? (
                  <>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th><button className="admin-sort-button" type="button" aria-label={adminText.sortDate} onClick={() => setAdminSortDescending((descending) => !descending)}>{adminText.date}<ArrowUpDown size={13} /></button></th>
                            <th>{adminText.time}</th><th>{adminText.name}</th><th>{adminText.phone}</th><th>{adminText.service}</th><th>{adminText.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedAdminAppointments.map((appointment) => {
                            const isEditing = editingAppointmentId === appointment.id && appointmentEdit !== null;
                            const serviceName = services.find((item) => item.key === appointment.service)?.name[language] || appointment.service;
                            const dateLabel = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "tr-TR", {
                              dateStyle: "medium",
                              timeZone: "Europe/Istanbul",
                            }).format(new Date(`${appointment.date}T12:00:00+03:00`));
                            return (
                              <tr key={appointment.id} className={appointment.date === minDate ? "is-today" : ""}>
                                {isEditing && appointmentEdit ? (
                                  <td colSpan={6}>
                                    <form className="admin-edit-form" onSubmit={saveAppointmentEdit}>
                                      <label className="field"><span>{adminText.date}</span><input type="date" min={minDate} value={appointmentEdit.date} onChange={(event) => setAppointmentEdit({ ...appointmentEdit, date: event.currentTarget.value })} required /></label>
                                      <label className="field"><span>{adminText.time}</span><select value={appointmentEdit.time} onChange={(event) => setAppointmentEdit({ ...appointmentEdit, time: event.currentTarget.value })}>{timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
                                      <label className="field"><span>{adminText.name}</span><input value={appointmentEdit.name} minLength={2} maxLength={80} onChange={(event) => setAppointmentEdit({ ...appointmentEdit, name: event.currentTarget.value })} required /></label>
                                      <label className="field"><span>{adminText.phone}</span><input type="tel" value={appointmentEdit.phone} minLength={7} maxLength={20} onChange={(event) => setAppointmentEdit({ ...appointmentEdit, phone: event.currentTarget.value })} required /></label>
                                      <label className="field"><span>{adminText.service}</span><select value={appointmentEdit.service} onChange={(event) => setAppointmentEdit({ ...appointmentEdit, service: event.currentTarget.value })}>{services.map((item) => <option key={item.key} value={item.key}>{item.name[language]}</option>)}</select></label>
                                      <div className="admin-row-actions">
                                        <button type="submit" disabled={adminBusyId === appointment.id}>{adminText.save}</button>
                                        <button type="button" onClick={discardAppointmentEdit} disabled={adminBusyId === appointment.id}>{adminText.discard}</button>
                                      </div>
                                    </form>
                                  </td>
                                ) : (
                                  <>
                                    <td data-label={adminText.date}><span className="admin-date-cell">{dateLabel}{appointment.date === minDate && <small>{adminText.todayBadge}</small>}</span></td>
                                    <td data-label={adminText.time}><strong className="admin-time">{appointment.time}</strong></td>
                                    <td data-label={adminText.name}><strong>{appointment.name}</strong></td>
                                    <td data-label={adminText.phone}><a className="admin-phone" href={`tel:${appointment.phone.replace(/[^\d+]/g, "")}`}>{appointment.phone}</a></td>
                                    <td data-label={adminText.service}>{serviceName}</td>
                                    <td data-label={adminText.actions}><div className="admin-row-actions"><button type="button" onClick={() => beginAppointmentEdit(appointment)} disabled={Boolean(adminBusyId)}>{adminText.edit}</button><button type="button" onClick={() => cancelAppointment(appointment)} disabled={Boolean(adminBusyId)}>{adminText.cancel}</button></div></td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-pagination">
                      <span>{adminPageStart + 1}–{Math.min(adminPageStart + adminPageSize, filteredAdminAppointments.length)} {adminText.showing} {filteredAdminAppointments.length}</span>
                      <label>{adminText.rowsPerPage}
                        <select value={adminPageSize} onChange={(event) => { setAdminPageSize(Number(event.currentTarget.value)); setAdminPage(1); }}>
                          {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                      </label>
                      <div>
                        <button type="button" aria-label={adminText.previousPage} disabled={visibleAdminPage <= 1} onClick={() => setAdminPage((page) => Math.max(1, Math.min(page, adminPageCount) - 1))}><ChevronLeft size={16} /></button>
                        <span>{visibleAdminPage}{adminText.pageOf}{adminPageCount}</span>
                        <button type="button" aria-label={adminText.nextPage} disabled={visibleAdminPage >= adminPageCount} onClick={() => setAdminPage((page) => Math.min(adminPageCount, Math.min(page, adminPageCount) + 1))}><ChevronRight size={16} /></button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="admin-empty">
                    <p className="admin-message">{hasAdminFilters ? adminText.noResults : adminText.empty}</p>
                    {hasAdminFilters && <button className="admin-clear-filters" type="button" onClick={clearAdminFilters}>{adminText.clearFilters}</button>}
                  </div>
                )}
              </>
            ) : (
              <form className="admin-login" onSubmit={submitAdminLogin}>
                <label className="field" htmlFor="admin-password">
                  <span>{adminText.password}</span>
                  <input id="admin-password" type="password" autoComplete="current-password" minLength={12} value={adminPassword} onChange={(event) => setAdminPassword(event.currentTarget.value)} required />
                </label>
                <button className="submit-button" type="submit" disabled={adminSubmitting}>{adminSubmitting ? adminText.loggingIn : adminText.login}<ArrowRight size={17} /></button>
              </form>
            )}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <BrandLogo footer />
        <p>{t.footerLine[0]}<br />{t.footerLine[1]}</p>
        <a href="https://www.google.com/maps/place//data=!4m2!3m1!1s0x152b6d1a9cf072ff:0x6db250a86e7c64bd?sa=X&ved=1t:8290&ictx=111" target="_blank" rel="noreferrer">{t.directions} <ArrowRight size={14} /></a>
        <button className="admin-entry" type="button" onClick={toggleAdminPanel} aria-expanded={isAdminOpen}>{adminText.entry}</button>
        <span className="footer-copy">© 2026 MEHMET İRŞAD GÜDER BARBER SHOP</span>
      </footer>

      {whatsappHref ? (
        <a className="fixed bottom-5 right-5 z-[60] inline-flex h-14 items-center gap-3 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#10251A] shadow-xl shadow-black/20 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive max-sm:bottom-4 max-sm:right-4 max-sm:h-12 max-sm:px-4" href={whatsappHref} target="_blank" rel="noreferrer" aria-label={t.whatsappContact}>
          <MessageCircle size={20} aria-hidden="true" />
          <span>{t.whatsappContact}</span>
        </a>
      ) : (
        <button className="fixed bottom-5 right-5 z-[60] inline-flex h-14 cursor-not-allowed items-center gap-3 rounded-full bg-[#25D366] px-5 text-sm font-bold text-[#10251A] opacity-60 shadow-xl shadow-black/20 max-sm:bottom-4 max-sm:right-4 max-sm:h-12 max-sm:px-4" type="button" title={t.whatsappSetup} disabled>
          <MessageCircle size={20} aria-hidden="true" />
          <span>{t.whatsappContact}</span>
        </button>
      )}
    </main>
  );
}