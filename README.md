# KÖK. Berber Kulübü

Next.js randevu sitesi. Randevular MongoDB Atlas'taki `appointments` koleksiyonuna kaydedilir; aynı gün ve saate yalnızca bir randevu alınır.

## Yerelde çalıştırma

1. MongoDB Atlas'ta bir cluster ve veritabanı kullanıcısı oluşturun. Database Access ve Network Access ayarlarında uygulama sunucusunun bağlanmasına izin verin.
2. `.env.example` dosyasını `.env.local` adıyla kopyalayıp `MONGODB_URI`, `MONGODB_DB` ve `NEXT_PUBLIC_WHATSAPP_NUMBER` değerlerini doldurun. WhatsApp numarasını ülke koduyla, yalnızca rakam kullanarak yazın (ör. `905xxxxxxxxx`).
3. Berberin randevu tablosuna erişmesi için `ADMIN_PASSWORD` değerini en az 12 karakterli güçlü bir parola, `ADMIN_SESSION_SECRET` değerini en az 32 karakterli rastgele bir sır olarak ayarlayın. Yönetim tablosu sayfanın altındaki **Berber girişi** bağlantısından açılır; oturum 12 saat sonra sona erer. Bu iki değeri herkese açık ortamlarda paylaşmayın.
4. Bağımlılıkları kurup geliştirme sunucusunu başlatın:

```bash
npm install
npm run dev
```

Site `http://localhost:3000` adresinde açılır. Randevu formu ve API pazar gününü kapalı kabul eder. Randevu oluşturulduktan sonra müşteriye özel iptal bağlantısı gösterilir ve WhatsApp mesaj taslağına eklenir. Müşteri bağlantıdan randevuyu iptal edebilir; berbere haber vermek için WhatsApp mesaj taslağı açılır ve mesajın müşteri tarafından gönderilmesi gerekir. İptal bağlantısı randevu saatine kadar geçerlidir. Berber girişiyle yaklaşan randevular listelenebilir, bilgiler düzenlenebilir veya iptal edilebilir; iptal edilen randevu kayıttan kaldırılır.

## Vercel'e dağıtım

Projeyi Git sağlayıcınıza gönderip Vercel'de içe aktarın. Vercel projesinin **Settings → Environment Variables** bölümüne `MONGODB_URI`, `MONGODB_DB`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` değişkenlerini ekleyin, sonra yeniden dağıtın. WhatsApp numarasını ülke koduyla ve `+`/boşluk olmadan girin. Atlas Network Access'te Vercel'den gelen bağlantılara izin verin; dinamik çıkış IP'leri için Atlas/Vercel planınıza uygun ağ erişimi yapılandırması gerekir.

Randevu API'si `POST /api/appointments` yolundadır. API tarih, saat, telefon ve hizmet alanlarını doğrular; aynı saat için eşzamanlı talepleri MongoDB unique index'i engeller. Atlas değişkenleri tanımlı değilse arayüz açılır, randevu kaydı 503 yanıtı verir.

## WhatsApp otomatik yanıt

Sabit WhatsApp düğmesi yalnızca kullanıcı sohbeti açıp ilk mesajı gönderdikten sonra yanıt alabilir. Otomatik yanıt için Meta WhatsApp Business Cloud API gerekir; normal `wa.me` bağlantısı kendi başına mesaj alamaz.

Meta Developer hesabında WhatsApp ürünü ve webhook'u etkinleştirin. Webhook callback URL'si `https://<alan-adiniz>/api/whatsapp/webhook`, verify token ise `WHATSAPP_VERIFY_TOKEN` ile aynı olmalı. Webhook aboneliklerinde `messages` alanını açın. Yerel test için Meta'nın erişebileceği HTTPS bir tünel gerekir.

`.env.local` ve Vercel Environment Variables içine şu sunucu ayarlarını ekleyin: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` ve Meta uygulamasında etkin olan Graph API sürümünü içeren `WHATSAPP_GRAPH_API_VERSION` (`vXX.X`). Randevu sonrası otomatik onay için `WHATSAPP_CONFIRMATION_TEMPLATE_TR` ve `WHATSAPP_CONFIRMATION_TEMPLATE_EN` değerlerine Meta'da onaylanmış şablon adlarını yazın. Şablonların gövdesinde hizmet, tarih ve saat için sırasıyla `{{1}}`, `{{2}}`, `{{3}}` değişkenleri olmalı. Token ve App Secret'ı `NEXT_PUBLIC_` önekiyle tanımlamayın. Değişkenleri ekledikten sonra uygulamayı yeniden başlatın veya Vercel'de yeniden deploy edin.

Webhook imzayı doğrular, yalnızca metin mesajlarına yanıt verir ve işlenmiş mesaj kimliklerini tekrar yanıt göndermemek için 30 gün saklar. Kullanıcı ilk mesajı gönderdikten sonra otomatik karşılama ve hizmet/fiyat bilgisi yollar. Randevu formunda WhatsApp onayı veren müşteriye kayıt sonrası onay şablonu gönderilir; Meta onaylı TR/EN şablon adları ve tüm API değişkenleri olmadan bu mesaj gönderilmez. WhatsApp'ın müşteri hizmetleri penceresi dışında serbest biçimli mesaj yerine onaylı şablon kullanılır.

`.env.example` yalnızca boş WhatsApp yapılandırma alanları ve örnek MongoDB URI'si içerir; gerçek sırları bu dosyaya koymayın. Daha önce paylaşılan MongoDB parolasını Atlas'ta yenileyip yalnızca `.env.local` ve Vercel'de güncelleyin.

Hizmet adları ve saat seçenekleri `src/app/page.tsx` ile `src/app/api/appointments/route.ts` içinde eşleşmelidir. Görünen fiyat ve süreler arayüzde tanımlıdır.