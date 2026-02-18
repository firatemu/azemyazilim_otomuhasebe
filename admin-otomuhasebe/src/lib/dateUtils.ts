import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Güvenli tarih formatlama fonksiyonu
 * Invalid date'leri ve null/undefined değerleri güvenli bir şekilde işler
 */
export function formatDateSafe(
  date: string | Date | null | undefined,
  formatStr: string = 'dd MMM yyyy HH:mm',
  fallback: string = '-'
): string {
  if (!date) {
    return fallback;
  }

  try {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Boş string kontrolü
      if (date.trim() === '' || date === 'null' || date === 'undefined') {
        return fallback;
      }
      dateObj = parseISO(date);
    } else {
      return fallback;
    }

    // Date geçerliliği kontrolü
    if (!isValid(dateObj)) {
      return fallback;
    }

    // NaN kontrolü
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }

    return format(dateObj, formatStr, { locale: tr });
  } catch (error) {
    console.warn('Date format error:', error, 'Date value:', date);
    return fallback;
  }
}

/**
 * Sadece tarih formatı (saat olmadan)
 */
export function formatDateOnly(
  date: string | Date | null | undefined,
  fallback: string = '-'
): string {
  return formatDateSafe(date, 'dd MMM yyyy', fallback);
}

/**
 * Tarih ve saat formatı
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  fallback: string = '-'
): string {
  return formatDateSafe(date, 'dd MMM yyyy HH:mm', fallback);
}

/**
 * Sadece saat formatı
 */
export function formatTimeOnly(
  date: string | Date | null | undefined,
  fallback: string = '-'
): string {
  return formatDateSafe(date, 'HH:mm', fallback);
}

/**
 * Uzun tarih formatı
 */
export function formatDateLong(
  date: string | Date | null | undefined,
  fallback: string = '-'
): string {
  return formatDateSafe(date, 'dd MMMM yyyy', fallback);
}

