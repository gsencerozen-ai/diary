import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
