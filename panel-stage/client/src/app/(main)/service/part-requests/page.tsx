'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParcaTalepleriRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/servis/parca-tedarik-yonetimi');
  }, [router]);
  return null;
}
