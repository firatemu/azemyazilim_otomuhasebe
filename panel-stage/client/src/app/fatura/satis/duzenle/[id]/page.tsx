'use client';

import React from 'react';
import { SatisFaturaForm } from '../../yeni/page';
import { useTabStore } from '@/stores/tabStore';
import { useRouter, useParams } from 'next/navigation';

export default function DuzenleSatisFaturasiPage() {
  const router = useRouter();
  const params = useParams();
  const { removeTab } = useTabStore();
  const faturaId = params?.id as string;

  const goBackToList = () => {
    removeTab(`fatura-satis-duzenle-${faturaId}`);
    router.push('/fatura/satis');
  };

  return <SatisFaturaForm faturaId={faturaId} onBack={goBackToList} />;
}
