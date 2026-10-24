EBEDİ AZEROTH — BİRLEŞİK SÜRÜM

Bu paket:
- index.html: ana sayfa, guild tanıtımı, başvuru formu ve guild kuralları
- azeroth-background.png: yazısız kale arka planı
- netlify.toml ve netlify/functions/apply.mjs: başvuruyu Discord webhook'una ileten Netlify Function

ÖNEMLİ:
1. Netlify'da bu ZIP'i Deploys bölümüne doğrudan ZIP olarak değil, AYIKLADIĞINIZ klasörün içeriği olarak yükleyin. Klasörün kökünde index.html ve netlify.toml bulunmalı.
2. Netlify projesinde Environment variables bölümünde DISCORD_WEBHOOK_URL değişkeninin mevcut ve doğru olduğundan emin olun. Webhook URL'sini kimseyle paylaşmayın.
3. Başvuru formu gönderimi için Netlify Functions destekleyen deploy gerekir. Deploy sonrası bir test başvurusu gönderin ve Discord kanalında göründüğünü doğrulayın.
4. Bu HTML dosyasında mevcut başvuru formu korunmuş, eski arşivde bulunan 6 guild kuralı bölümü geri eklenmiştir.
