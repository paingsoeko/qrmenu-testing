import React from 'react';
import { FileText, ArrowUp, CheckCircle } from 'lucide-react';

interface OrderSuccessViewProps {
  onBack: () => void;
  paymentSlug?: string;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ onBack, paymentSlug }) => {
  // If payment is Stripe, PromptPay, OR Staff, assume it's fully placed/confirmed.
  const isPlaced = paymentSlug === 'stripe' || paymentSlug === 'promptpay' || paymentSlug === 'staff';

  if (isPlaced) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] px-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-green-50 p-6 rounded-full mb-6 relative">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed</h2>
            <p className="text-gray-600 mb-8 max-w-md">
                We've received your order and payment.<br/>
                Sit back and relax while we prepare your food.
            </p>
            <button 
                onClick={onBack}
                className="bg-gray-900 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:bg-gray-800 transition-colors w-full max-w-xs"
            >
                Return to Menu
            </button>
        </div>
      );
  }

  // Default: Order Requested (Manual Payment)
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
          <FileText className="w-16 h-16 text-blue-600" />
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-bounce">
              <ArrowUp className="w-4 h-4 text-yellow-900" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Requested</h2>
        <p className="text-gray-600 mb-8 max-w-md">
            We've received your slip. <br/>
            Please check the <strong>status pill</strong> at the top of the menu to see when your order is confirmed.
        </p>
        <button 
            onClick={onBack}
            className="bg-gray-900 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:bg-gray-800 transition-colors w-full max-w-xs"
        >
            Return to Menu
        </button>
    </div>
  );
};