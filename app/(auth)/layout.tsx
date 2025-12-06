'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Eğer kullanıcı giriş yapmışsa diary'ye yönlendir
    if (!loading && user) {
      router.push('/diary');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 via-warm-50 to-cream-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-terracotta-500 mx-auto" />
          <p className="mt-4 text-warm-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Eğer kullanıcı giriş yapmışsa boş render (yönlendirme bekle)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 via-warm-50 to-cream-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold text-terracotta-600">
            Günlüğüm
          </h1>
          <p className="mt-2 text-warm-600">
            Kişisel düşünceleriniz için güvenli alan
          </p>
        </div>
        <div className="rounded-lg bg-white/80 backdrop-blur-sm p-8 shadow-lg border border-warm-200">
          {children}
        </div>
      </div>
    </div>
  );
}
