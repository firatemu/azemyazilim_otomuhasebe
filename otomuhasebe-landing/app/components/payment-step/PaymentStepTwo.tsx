'use client';

import { CreditCard, Calendar } from 'lucide-react';

export interface PaymentStepTwoProps {
  cardLast4: string;
  expiry: string;
}

export default function PaymentStepTwo({ cardLast4, expiry }: PaymentStepTwoProps) {
  return (
    <div className="text-center p-6">
      <div className="bg-blue-100 rounded-full p-4 mb-4 inline-flex items-center justify-center">
        <CreditCard className="w-12 h-12 text-blue-600" />
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Kart Bilgileri</h3>
        <div className="text-gray-800 bg-gray-50 rounded-lg p-6 text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Kart Son 4 Hanesi:</span>
            <span className="font-semibold text-gray-900">{cardLast4}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">SKT:</span>
            <span className="font-semibold text-gray-900">{expiry}</span>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Lütfen kart bilgilerinizi gizli tutun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
