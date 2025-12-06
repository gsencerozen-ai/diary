# RFC-002: Firebase Authentication Entegrasyonu

## Durum
Önerilen

## Özet
Firebase Authentication ile kullanıcı kayıt, giriş ve oturum yönetimi sistemi.

## Motivasyon
- Kullanıcıların güvenli bir şekilde kimlik doğrulaması yapması
- Her kullanıcının kendi günlük verilerine özel erişimi
- Siteye auth olmadan erişimin engellenmesi

## Detaylı Tasarım

### Authentication Metodları
**Faz 1 (İlk Sürüm)**:
- Email/Password authentication

**Gelecek Fazlar**:
- Google OAuth
- Apple Sign In

### Firebase Konfigürasyonu

```typescript
// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Auth Context Provider

```typescript
// lib/context/auth-context.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Implementation...
};
```

### Route Protection (Middleware)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  
  // Auth gerektiren rotalar
  if (request.nextUrl.pathname.startsWith('/diary')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Auth varsa login/register'a erişim engelle
  if (request.nextUrl.pathname.match(/^\/(login|register)$/)) {
    if (session) {
      return NextResponse.redirect(new URL('/diary', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/diary/:path*', '/login', '/register'],
};
```

### Type Definitions

```typescript
// lib/types/auth.ts
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthState = 
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }
  | { status: 'loading'; user: null };
```

## UI Components

### Login Form
- Email input (validation: email format)
- Password input (validation: min 6 karakter)
- "Giriş Yap" button
- "Hesabın yok mu? Kayıt ol" linki
- Hata mesajları için toast/alert

### Register Form
- Email input
- Password input
- Password confirmation input
- "Kayıt Ol" button
- "Zaten hesabın var mı? Giriş yap" linki

### Form Validation (Zod)

```typescript
// lib/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

## Error Handling

Firebase Auth hata kodları Türkçe'ye çevrilecek:

```typescript
// lib/utils/auth-errors.ts
export const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Bu email adresi zaten kullanımda',
  'auth/invalid-email': 'Geçersiz email adresi',
  'auth/user-not-found': 'Kullanıcı bulunamadı',
  'auth/wrong-password': 'Hatalı şifre',
  'auth/weak-password': 'Şifre çok zayıf',
  'auth/network-request-failed': 'İnternet bağlantısı hatası',
  'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin',
};
```

## Güvenlik Konuları

### Session Management
- HTTP-only cookies kullanımı
- Secure flag (production'da)
- 7 günlük session süresi

### Password Güvenliği
- Minimum 6 karakter
- En az 1 büyük harf
- En az 1 rakam

### Rate Limiting
- Firebase'in built-in rate limiting'i kullanılacak

## Test Stratejisi
1. Unit tests: Auth helper fonksiyonları
2. Integration tests: Login/Register akışları
3. E2E tests: Tam auth flow (Cypress/Playwright)

## Performans
- Auth state React Context'te cached
- onAuthStateChanged listener single instance
- Lazy loading auth pages

## Bağımlılıklar
```json
{
  "firebase": "^11.0.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.9.0"
}
```

## Rollback Planı
- Environment variables'ı kontrol et
- Firebase console'da Authentication modülü aktif mi?
- Development vs Production config ayrımı

## İleri Adımlar
- [ ] Firebase projesi oluştur
- [ ] Environment variables ayarla (.env.local)
- [ ] Firebase SDK kurulumu
- [ ] Auth Context implementasyonu
- [ ] Login/Register sayfaları
- [ ] Middleware implementasyonu
- [ ] Error handling
- [ ] Unit tests
