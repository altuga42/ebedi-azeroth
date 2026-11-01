EBEDİ AZEROTH ÜYE YÖNETİMİ — KURULUM NOTLARI

Bu paket bir ilk sürüm kodudur; henüz Netlify'a yüklenmedi veya canlı ortamda doğrulanmadı.
İşlevler Netlify Functions + Netlify Blobs kullanır.

1) Projedeki mevcut index.html ve netlify.toml dosyalarını yedekle.
2) Bu paketteki dosyaları doğru GitHub dalına (altuga42-patch-1) yerleştir.
3) Netlify proje ayarlarında Environment variables bölümüne ADMIN_PASSWORD ekle. Uzun ve benzersiz bir parola seç; bu parolayı siteye veya koda yazma.
4) package.json'daki @netlify/blobs bağımlılığı build sırasında kurulmalıdır. Netlify build/deploy tekrar çalışır hale geldiğinde yeni dağıtım gerekir.
5) İlk açılışta /#members alanından Yönetici düğmesine bas, parolanla giriş yap.
6) Üyeleri ekle; görsel alanından JPEG/PNG/WebP, 5 MB'a kadar dosya yükle. Görsel ve üye kayıtları Netlify Blobs'ta saklanır.

ÖNEMLİ:
- Netlify hesabındaki operasyonel kredi uyarısı nedeniyle deploy şu an duraklatılmış olabilir. Kodun canlıya çıkması için deploy yeniden etkin olmalı.
- Parola gizli tutulmalı; ADMIN_PASSWORD yalnızca Netlify Environment Variables içinde tanımlanmalı.
- Bu ilk paket üretim öncesi gözden geçirilmeli ve canlı deploy'da test edilmelidir.
- Mevcut başvuru formu fonksiyonu korunmalıdır; bu pakette apply.mjs eklenmediği için mevcut netlify/functions/apply.mjs dosyasını depoda aynen bırak.
