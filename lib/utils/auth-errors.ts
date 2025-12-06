export const authErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Bu email adresi zaten kullanımda',
  'auth/invalid-email': 'Geçersiz email adresi',
  'auth/user-not-found': 'Kullanıcı bulunamadı',
  'auth/wrong-password': 'Hatalı şifre',
  'auth/weak-password': 'Şifre çok zayıf',
  'auth/network-request-failed': 'İnternet bağlantısı hatası',
  'auth/too-many-requests': 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin',
  'auth/user-disabled': 'Bu hesap devre dışı bırakılmış',
  'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor',
  'auth/invalid-credential': 'Email veya şifre hatalı',
};

export function getAuthErrorMessage(errorCode: string): string {
  return authErrorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
