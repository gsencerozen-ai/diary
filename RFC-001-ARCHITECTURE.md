# RFC-001: Günlük Uygulaması - Genel Mimari

## Durum
Önerilen

## Özet
Kullanıcıların günlük yazılarını yazıp saklayabilecekleri, samimi ve sıcak bir arayüze sahip, tam typesafe bir Next.js uygulaması oluşturulması.

## Motivasyon
- Kullanıcıların düşüncelerini ve deneyimlerini güvenli bir ortamda kaydetmelerini sağlamak
- Modern web teknolojileri ile performanslı ve güvenli bir uygulama sunmak
- Kişisel verilerin Firebase ile güvenli bir şekilde saklanması

## Teknik Gereksinimler

### Teknoloji Stack
- **Framework**: Next.js 16 (App Router)
- **Dil**: TypeScript (Strict mode)
- **UI Kütüphaneleri**: 
  - shadcn/ui (Komponent sistemi)
  - Framer Motion (Animasyonlar)
  - Tailwind CSS (Styling)
- **Backend & Auth**: 
  - Firebase Authentication
  - Firestore Database
- **Form Yönetimi**: React Hook Form + Zod (Type-safe validasyon)

### Mimari Yapı

```
diary/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/
│   │   ├── layout.tsx          # Auth kontrolü burada
│   │   ├── page.tsx             # Ana günlük yazma sayfası
│   │   └── entries/
│   │       └── [id]/
│   │           └── page.tsx     # Eski günlük okuma (read-only)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn components
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── diary/
│   │   ├── entry-editor.tsx
│   │   ├── entry-list.tsx
│   │   └── entry-card.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── header.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── firestore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDiary.ts
│   ├── types/
│   │   └── diary.ts
│   └── utils.ts
└── public/
```

## Tasarım Kararları

### 1. Route Grupları
- `(auth)`: Kimlik doğrulama sayfaları (login/register)
- `(protected)`: Korumalı sayfalar (auth middleware ile)

### 2. Type Safety
- Tüm Firebase operasyonları için TypeScript interfaces
- Zod schemas ile runtime validasyon
- Strict TypeScript ayarları

### 3. State Management
- Firebase Realtime listeners ile otomatik senkronizasyon
- React Context API (Auth state için)
- Server Components + Client Components hibrit yaklaşım

### 4. Güvenlik
- Firebase Security Rules ile backend güvenliği
- Next.js Middleware ile route koruması
- Her kullanıcı sadece kendi yazılarına erişebilir

## İleri Aşamalar
1. RFC-002: Firebase Entegrasyonu ve Authentication
2. RFC-003: Firestore Veri Modeli ve Güvenlik Kuralları
3. RFC-004: UI/UX Tasarımı ve Komponent Yapısı
4. RFC-005: Günlük Editor ve CRUD İşlemleri

## Alternatifler
- **Supabase**: Firebase alternatifi, ancak Firebase'in kullanım kolaylığı tercih edildi
- **Redux**: State management için, ancak Context API + Firebase listeners yeterli

## Sorular
- Offline desteği gerekli mi? (Progressive Web App)
- Günlük yazılarında zengin metin editörü (rich text) isteniyor mu?
- Günlük yazılarını kategorilere ayırma özelliği?

## Kaynaklar
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Firebase for Web](https://firebase.google.com/docs/web/setup)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
