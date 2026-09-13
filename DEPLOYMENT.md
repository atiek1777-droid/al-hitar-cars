# النشر — Deployment

الموقع ثابت بالكامل (Static) — لا يحتاج `npm install` ولا خطوة بناء. فقط ارفع محتويات مجلد `site/` كما هي.

## النشر على Vercel (الأسرع)

**عن طريق CLI (من Termux):**
```bash
cd site
npm i -g vercel        # مرة واحدة فقط إن لم يكن مثبتًا
vercel login
vercel --prod
```
عند السؤال عن "Output Directory" اختر `.` (المجلد الحالي)، ولا حاجة لأي Build Command (اتركه فارغًا).

**عن طريق GitHub + لوحة Vercel:**
1. ارفع مجلد `site/` كمستودع على GitHub.
2. من لوحة Vercel: New Project → اختر المستودع.
3. Framework Preset: **Other** — اترك Build Command فارغًا و Output Directory كـ `.`
4. Deploy.

ملف `vercel.json` المرفق يضبط:
- تخزين مؤقت طويل الأمد لمجلد `assets/` (صور/فيديو/خطوط).
- إعادة توجيه `/` إلى `/index.html`.

## النشر على Netlify

اسحب مجلد `site/` مباشرة في لوحة Netlify (Drag & Drop)، أو:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=site
```

## النشر على GitHub Pages

1. ارفع محتوى `site/` إلى فرع `main` أو `gh-pages`.
2. من إعدادات المستودع → Pages → اختر الفرع والمجلد الجذر.
3. لاحظ: خدمة الـ Service Worker وملف الـ manifest سيعملان بشكل طبيعي طالما الموقع يُقدَّم عبر HTTPS (وهو الحال تلقائيًا في Vercel/Netlify/GitHub Pages).

## بعد النشر — تحقق من

- [ ] فتح الموقع من الجوال والتأكد من ظهور اقتراح "تثبيت التطبيق" (PWA).
- [ ] تجربة نموذج الحجز والتأكد من فتح واتساب برسالة معبأة.
- [ ] التأكد من تشغيل الفيديو تلقائيًا في الواجهة (بعض المتصفحات تتطلب أول تفاعل من المستخدم).
- [ ] فحص الموقع بدون إنترنت للتأكد من ظهور `offline.html` بدل الصفحة البيضاء.
