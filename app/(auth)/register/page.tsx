import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Kayıt Ol - Günlüğüm',
  description: 'Yeni hesap oluşturun ve günlüklerinizi yazmaya başlayın',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
