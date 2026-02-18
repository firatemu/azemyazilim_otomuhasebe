import { Check, Sparkles } from 'lucide-react';

export interface PaymentStepThreeProps {
  transactionId?: string;
}

export default function PaymentStepThree({ transactionId }: PaymentStepThreeProps) {
  return (
    <div className="text-center p-6">
      <div className="bg-green-100 rounded-full p-4 mx-auto mb-4 inline-flex items-center justify-center">
        <Check className="w-16 h-16 text-green-600" />
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Ödeme Başarılı!
        </h3>
        <p className="text-gray-600 mb-4">
          İşleminiz başarıyla tamamlandı.
        </p>
        {transactionId && (
          <div className="bg-white rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">İşlem ID:</span> {transactionId}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Ödeme detaylarınız e-posta olarak iletilecektir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
