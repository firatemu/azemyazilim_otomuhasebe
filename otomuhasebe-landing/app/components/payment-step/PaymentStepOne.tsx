'use client';

import { Check } from 'lucide-react';

export interface PaymentStepOneProps {
  title: string;
  planName: string;
  price: string;
}

export default function PaymentStepOne({ title, planName, price }: PaymentStepOneProps) {
  return (
    <div className="text-center p-6">
      <div className="rounded-full bg-blue-100 p-4 mb-4 inline-flex items-center justify-center">
        <Check className="w-12 h-12 text-blue-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{planName}</p>
        <div className="text-3xl font-bold text-blue-600">{price}</div>
        <p className="text-sm text-gray-500">aylık</p>
      </div>
    </div>
  );
}
