# KÖK. Berber Kulübü

Next.js randevu sitesi. Randevular MongoDB Atlas'taki `appointments` koleksiyonuna kaydedilir; aynı gün ve saate yalnızca bir randevu alınır.

## Yerelde çalıştırma

1. MongoDB Atlas'ta bir cluster ve veritabanı kullanıcısı oluşturun. Database Access ve Network Access ayarlarında uygulama sunucusunun bağlanmasına izin verin.
2. `.env.example` dosyasını `.env.local` adıyla kopyalayıp `MONGODB_URI` ve `MONGODB_DB` değerlerini doldurun.
3. Bağımlılıkları kurup geliştirme sunucusunu başlatın:

```bash
npm install
npm run dev
```

Site `http://localhost:3000` adresinde açılır.

## Vercel'e dağıtım

Projeyi Git sağlayıcınıza gönderip Vercel'de içe aktarın. Vercel projesinin **Settings → Environment Variables** bölümüne `MONGODB_URI` ve `MONGODB_DB` değişkenlerini ekleyin, sonra yeniden dağıtın. Atlas Network Access'te Vercel'den gelen bağlantılara izin verin; dinamik çıkış IP'leri için Atlas/Vercel planınıza uygun ağ erişimi yapılandırması gerekir.

Randevu API'si `POST /api/appointments` yolundadır. API tarih, saat, telefon ve hizmet alanlarını doğrular; aynı saat için eşzamanlı talepleri MongoDB unique index'i engeller. Atlas değişkenleri tanımlı değilse arayüz açılır, randevu kaydı 503 yanıtı verir.

Hizmet adları ve saat seçenekleri `src/app/page.tsx` ile `src/app/api/appointments/route.ts` içinde eşleşmelidir. Görünen fiyat ve süreler arayüzde tanımlıdır.