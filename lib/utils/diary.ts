/**
 * Türkçe tarih formatı: "30 Kasım 2025, 14:30"
 */
export function formatDate(date: Date): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/**
 * Kelime sayısını hesapla
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // HTML'den tags'i kaldır
  const plainText = text.replace(/<[^>]*>/g, '');
  return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Preview text oluştur (ilk maxLength karakter, HTML tags'i kaldır)
 */
export function createPreview(text: string, maxLength: number = 100): string {
  if (!text) return '';
  // HTML'den tags'i kaldır
  const plainText = text.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}

/**
 * Relative time (örn: "2 saat önce", "3 gün önce")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 30) return `${diffDays} gün önce`;
  
  return formatDate(date);
}

/**
 * Timestamp'i Date'e çevir
 */
export function timestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}
