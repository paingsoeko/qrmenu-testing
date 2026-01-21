import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OrderSuccessViewProps {
  onBack: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h2>
        <p className="text-gray-600 mb-8 max-w-md">The kitchen has received your order and will start preparing it shortly.</p>
        <button 
            onClick={onBack}
            className="bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
        >
            Return to Menu
        </button>
    </div>
  );
};