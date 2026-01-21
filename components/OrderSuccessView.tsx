import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface OrderSuccessViewProps {
  onBack: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-indigo-50 p-6 rounded-full mb-6">
          <Clock className="w-16 h-16 text-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Requested</h2>
        <p className="text-gray-600 mb-8 max-w-md">We have received your payment slip and your order is under review. You can check the status from the menu.</p>
        <button 
            onClick={onBack}
            className="bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
        >
            Back to Menu
        </button>
    </div>
  );
};