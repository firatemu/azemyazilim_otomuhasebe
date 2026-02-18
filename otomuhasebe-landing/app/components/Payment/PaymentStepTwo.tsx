import { CreditCard } from 'lucide-react';

export interface PaymentStepTwoProps {
  cardLast4: string;
  expiry: string;
}

export function PaymentStepTwo({ cardLast4, expiry }: PaymentStepTwoProps) {
  return (
    <div className="text-center p-6">
      <div className="bg-blue-100 rounded-full p-4 mb-4 inline-flex items-center justify-center">
        <CreditCard className="w-12 h-12 text-blue-600" />
      </div>
      <div>
        <p className="text-gray-800 font-semibold text-lg">{cardLast4}</p>
        <p className="text-gray-600 mb-4">Kart Son 4 Hanesi</p>
      <p className="text-gray-800 font-semibold text-lg">{expiry}</p>
        <p className="text-gray-600 mb-4">SKT Tarihi</p>
      </div>
    </div>
  );
}
