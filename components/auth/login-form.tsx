'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/context/auth-context';
import { loginSchema, type LoginInput } from '@/lib/schemas/auth';
import { getAuthErrorMessage } from '@/lib/utils/auth-errors';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Hoş geldiniz!');
      router.push('/diary');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-heading font-bold text-brown-800">
          Giriş Yap
        </h1>
        <p className="text-warm-600">
          Günlüklerinize devam etmek için giriş yapın
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-brown-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            {...register('email')}
            disabled={isLoading}
            className="bg-white"
          />
          {errors.email && (
            <p className="text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-brown-700">
            Şifre
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
            className="bg-white"
          />
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-terracotta-500 hover:bg-terracotta-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-warm-600">Hesabınız yok mu? </span>
        <Link
          href="/register"
          className="font-medium text-terracotta-500 hover:text-terracotta-600"
        >
          Kayıt Ol
        </Link>
      </div>
    </motion.div>
  );
}
