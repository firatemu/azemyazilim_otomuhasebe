'use client';

import { useEffect, useState } from 'react';

/**
 * Bir değeri belirtilen süre (ms) kadar geciktirir
 * Kullanım: Arama input'ları için API çağrısı sayısını azaltmak
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Değer değiştiğinde bir timer başlat
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Component unmount olduğunda veya değer değiştiğinde timer'ı temizle
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Fonksiyonları debounce etmek için kullanılır
 * Kullanım: onClick, onChange gibi event handler'lar için
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Component unmount olduğunda timer'ı temizle
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimer(newTimer);
  }) as T;
}
