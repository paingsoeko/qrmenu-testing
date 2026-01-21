import React from 'react';
import { Loader2, ArrowLeft, QrCode, User } from 'lucide-react';
import { PromptPayQrData } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface PromptPayDisplayProps {
  data: PromptPayQrData;
  loading: boolean;
  onCheckStatus: () => void;
  onCancel: () => void;
}

export const PromptPayDisplay: React.FC<PromptPayDisplayProps> = ({ data, loading, onCheckStatus, onCancel }) => {
  const isStaff = data.qr_type === 'staff';
  const { currency } = useCurrency(); // Get global currency for fallback if needed

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-32 animate-in slide-in-from-right duration-300">
        <div className="mb-6 flex items-center">
            <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 mr-2">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">{isStaff ? "Pay to Staff" : "Scan to Pay"}</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className={`${isStaff ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-2xl mb-6`}>
               {isStaff ? <User className="w-8 h-8 text-blue-600" /> : <QrCode className="w-8 h-8 text-orange-600" />}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{isStaff ? "Staff Payment QR" : "PromptPay QR Code"}</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                {isStaff 
                  ? "Please show this QR code to the staff member to complete your payment." 
                  : "Please scan the QR code below using your banking app to complete the payment."}
            </p>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <img 
                    src={data.qr_code_url} 
                    alt="Payment QR Code" 
                    className="w-64 h-64 object-contain"
                />
            </div>
            
            {!isStaff && data.instruction_url && (
                <a 
                    href={data.instruction_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline mb-8"
                >
                    View Payment Instructions
                </a>
            )}

            <div className="mb-8">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency || currency.code || 'THB' }).format(data.amount)}
                </p>
            </div>
            
            <div className="w-full max-w-sm space-y-3">
                <button 
                    onClick={onCheckStatus}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-gray-800 transition-colors flex justify-center items-center"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "I have completed payment"}
                </button>
                <button 
                    onClick={onCancel}
                    className="w-full py-3.5 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
                Checking payment status automatically...
            </p>
        </div>
    </div>
  );
};