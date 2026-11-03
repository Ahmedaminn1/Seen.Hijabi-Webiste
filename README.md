# Seen Hijabi (سين) — Official E-Commerce Storefront

<div align="center">
  <img src="public/images/logo.png" alt="Seen Hijabi Logo" width="120" />
  <p><strong>العلامة المصرية الرائدة في الأزياء النسائية المحتشمة والحجاب الفاخر</strong></p>
  <p>Modern, High-Performance Modest Fashion E-Commerce Platform built with Next.js 16, React 19, Tailwind CSS v4, Prisma ORM 7, and Supabase.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.10.1-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://seen-hijabi-webiste.vercel.app)
</div>

---

## 🌟 Overview | نظرة عامة

**Seen Hijabi (سين)** هو متجر إلكتروني فاخر وسريع للغاية مخصص لتسويق وبيع الطرح، الفساتين، والعبايات المحتشمة في مصر. تم تصميمه بهندسة معمارية حديثة تفصل واجهة المتجر للعملاء (Website) عن لوحة التحكم الإدارية (Dashboard)، مع مزامنة فورية للمخزون والبيانات عبر خادم Supabase المشترك.

- **رابط المتجر الحي على Vercel:** [https://seen-hijabi-webiste.vercel.app](https://seen-hijabi-webiste.vercel.app)
- **مستودع لوحة التحكم:** [Seen.Hijabi-Dashboard](https://github.com/Ahmedaminn1/Seen.Hijabi-Dashboard)

---

## ✨ المميزات الرئيسية | Core Features

### 🛍️ تجربة تسوق راقية وسريعة (Mobile-First UX)
- **تصميم أنثوي فاخر:** متوافق 100% مع الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر مع واجهة عربية بالكامل واتجاه RTL.
- **تصفح فوري وتصنيفات ديناميكية:** فلاتر للألوان، المقاسات، الأحدث، الأكثر طلباً، وعروض التخفيضات.
- **دعم الروابط العربية (Decoded Slugs):** دعم كامل للروابط الدائمة باللغتين العربية والإنجليزية بدون أي أخطاء 404.

### ⚡ مزامنة فورية مع لوحة التحكم (Real-time Store Sync)
- **تحديثات لحظية بدون Reload:** عند تعديل كميات المخزون أو نفاد كمية أي منتج في لوحة التحكم، تنعكس التغييرات فوراً في المتجر عبر Server-Sent Events (SSE) و On-Demand Revalidation.
- **منع البيع الزائد (Overselling Prevention):** فحص المخزون لحظة الإضافة للسلة ولحظة إتمام الدفع لمنع طلب منتجات غير متوفرة.

### 🚚 حساب شحن ديناميكي حسب محافظات مصر (Governorate Shipping Rates)
- **حساب دقيق لجميع محافظات جمهورية مصر العربية (27 محافظة):**
  - **الشرقية:** 50 ج.م
  - **القاهرة (وتشمل القاهرة الجديدة)، الجيزة، الإسكندرية:** 90 ج.م
  - **محافظات الدلتا والقناة (10 محافظات):** 100 ج.م
  - **محافظات الصعيد والبحر الأحمر (9 محافظات):** 100 ج.م
  - **المحافظات الحدودية (مطروح، الوادي الجديد، جنوب سيناء):** 200 ج.م
- **شريط الشحن المجاني التفاعلي:** شريط تقدم مباشر في السلة يوضح المبلغ أو عدد القطع المتبقية للحصول على شحن مجاني.

### 💳 نظام التحقق من تحويل الشحن مسبقاً (Upfront Shipping Verification)
- **سياسة جدية الاستلام:** إلزامية تحويل مصاريف الشحن مسبقاً عبر فودافون كاش أو إنستاباي (InstaPay) قبل تسليم الشحنة لشركة الشحن.
- **زر نسخ الرقم بنقرة واحدة:** نسخ رقم التحويل بسهولة.
- **حقول إلزامية صارمة في صفحة الدفع:**
  - إرفاق سكرين شوت إيصال التحويل (يتم رفعه فوراً إلى Supabase Storage).
  - كتابة رقم الهاتف / المحفظة المحول منها لمطابقة عملية الدفع.
  - حظر إتمام الطلب ومطالبة العميل بالبيانات قبل التسجيل في قاعدة البيانات.

### 📱 تكامل السوشيال ميديا والتواصل المباشر
- روابط مباشرة لحسابات البراند الرسمية على **Instagram** و **TikTok**.
- زر **واتساب** عائم للتواصل المباشر والاستفسارات بضغطة زر.

---

## 🛠️ التقنيات المستخدمة | Tech Stack

| المجال | التقنية | الاستخدام |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack) | معمارية الويب والسيرفر والـ Server Actions |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | بيئة كتابة كود صارمة ومحمية من الأخطاء |
| **UI & Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons | تصميم عصري وسريع بالكامل بدون مكتبات ثقيلة |
| **Database & ORM** | [Prisma ORM 7](https://www.prisma.io/) + `@prisma/adapter-pg` | إدارة ونمذجة قاعدة البيانات مع Pooler SSL |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL) | قاعدة البيانات السحابية واستضافة إيصالات وصور المنتجات |
| **State Management**| [Zustand](https://github.com/pmndrs/zustand) | إدارة حالة السلة والمشتريات وتخزينها محلياً |
| **Forms & Validation**| React Hook Form + [Zod](https://zod.dev/) | التحقق الشامل من بيانات العميل والشحن |
| **Deployment** | [Vercel](https://vercel.com/) | الاستضافة السحابية مع شهادة SSL وCI/CD تلقائي |

---

## 📁 هيكل المشروع | Project Structure

```text
seen.hijabi website/
├── prisma/
│   └── schema.prisma              # مخطط قاعدة البيانات (الموديلات والعلاقات)
├── public/
│   ├── images/logo.png            # شعار البراند الرسمي
│   └── placeholder.png            # صورة بديلة عند غياب الصورة
├── src/
│   ├── app/
│   │   ├── page.tsx               # الصفحة الرئيسية (Hero, New Arrivals, Best Sellers, Social)
│   │   ├── layout.tsx             # التخطيط العام والخطوط والـ Favicon
│   │   ├── globals.css            # متغيرات Tailwind v4 والألوان الرسمية
│   │   ├── checkout/page.tsx      # صفحة الدفع والتحقق من تحويل الشحن مسبقاً
│   │   ├── order-success/page.tsx # صفحة نجاح الأوردر ورسالة الواتساب
│   │   ├── products/
│   │   │   ├── page.tsx           # كتالوج المنتجات والفلاتر والتصنيفات
│   │   │   └── [slug]/page.tsx    # صفحة تفاصيل المنتج واختيار المقاس واللون
│   │   └── api/
│   │       ├── revalidate/        # نقطة نهاية إعادة التحقق الفوري من الكاش
│   │       └── sync/              # بث الأحداث اللحظية عبر SSE للمتجر
│   ├── components/
│   │   ├── store/                 # مكونات المتجر (Navbar, Footer, CartDrawer, ProductCard...)
│   │   └── ui/                    # مكونات الواجهة (Button, Input, Select, Icons...)
│   ├── lib/
│   │   ├── actions/               # Server Actions (checkout, upload, settings...)
│   │   ├── constants/             # أسعار شحن المحافظات وقوائم الثوابت
│   │   ├── prisma.ts              # عميل Prisma Client وإعدادات اتصال الـ SSL
│   │   └── utils/                 # دوال حساب الأسعار والخصومات والتنسيق
│   ├── store/
│   │   └── cart.ts                # متجر Zustand لإدارة السلة والكميات
│   └── middleware.ts              # توجيه الروابط الإدارية وحماية السيرفر
└── package.json
```

---

## ⚙️ إعداد وتشغيل المشروع محلياً | Local Development

### 1. استنساخ المشروع وتثبيت الحزم:
```bash
git clone https://github.com/Ahmedaminn1/Seen.Hijabi-Webiste.git
cd Seen.Hijabi-Webiste
npm install
```

### 2. إعداد المتغيرات البيئية (`.env.local`):
أنشئ ملف `.env.local` في المجلد الرئيسي وضع بداخله:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<YOUR_PUBLISHABLE_KEY>"
SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
SUPABASE_SECRET_KEY="<YOUR_SECRET_KEY>"
SUPABASE_JWKS_URL="https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/.well-known/jwks.json"

# Database Connection (Supabase Pooler)
DATABASE_URL="postgresql://postgres.<ID>:<PASSWORD>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ID>:<PASSWORD>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# App & Dashboard URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3001"
REVALIDATION_SECRET="seen_hijabi_secret_2026"
ADMIN_EMAIL="admin@seenhijabi.com"
```

### 3. توليد عميل Prisma:
```bash
npx prisma generate
```

### 4. تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على [http://localhost:3000](http://localhost:3000).

---

## 🚀 النشر على Vercel | Production Deployment

1. اربط مستودع GitHub بـ Vercel.
2. أضف جميع المتغيرات المذكورة في ملف `.env.local` داخل قسم **Environment Variables** في مشروع Vercel.
3. يقوم Vercel بتنفيذ `prisma generate && next build` تلقائياً ونشر الموقع مع شهادة حماية SSL كاملة.

---

## 📄 License
جميع الحقوق محفوظة لصالح علامة **Seen Hijabi (سين)** &copy; 2026.
