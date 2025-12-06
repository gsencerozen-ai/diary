import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Giriş Yap - Günlüğüm',
  description: 'Günlüklerinize devam etmek için giriş yapın',
};

export default function LoginPage() {
  return <LoginForm />;
}
