import React, { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import { PaymentMethod } from '../types';
import { fetchPaymentMethods } from '../services/api';

interface PaymentMethodSelectorProps {
  total: number;
  onBack: () => void;
  onConfirm: (methodSlug: string) => void;
  loadingExternal: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ total, onBack, onConfirm, loadingExternal }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await fetchPaymentMethods();
        setMethods(data);
        const defaultMethod = data.find(m => m.is_default === 1) || data[0];
        if (defaultMethod) setSelectedId(defaultMethod.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMethods();
  }, []);

  // Reset local submitting state if external loading stops (e.g. error occurred)
  useEffect(() => {
    if (!loadingExternal) {
        setIsSubmitting(false);
    }
  }, [loadingExternal]);

  const handleConfirm = () => {
    const selected = methods.find(m => m.id === selectedId);
    if (selected) {
        setIsSubmitting(true);
        onConfirm(selected.slug);
    }
  };

  const isProcessing = loadingExternal || isSubmitting;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-32 animate-in slide-in-from-right duration-300">
        <div className="mb-6 flex items-center">
            <button 
                onClick={onBack} 
                disabled={isProcessing}
                className={`p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 mr-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-500">Total Amount</span>
                 <span className="text-xl font-bold text-orange-600">
                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
                 </span>
             </div>
             <div className="h-px bg-gray-100 w-full mb-4"></div>
             
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                 <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                 Select Payment Option
             </h3>

             {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
             ) : methods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payment methods available.</div>
             ) : (
                <div className="space-y-3">
                    {methods.map(method => (
                        <button
                            key={method.id}
                            onClick={() => !isProcessing && setSelectedId(method.id)}
                            disabled={isProcessing}
                            className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-300 
                                ${selectedId === method.id 
                                    ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200 ring-offset-2 scale-[1.02]' 
                                    : 'border-gray-100 bg-white hover:shadow-sm'}
                                ${!isProcessing && selectedId !== method.id ? 'hover:border-orange-200' : ''}
                                ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1">
                                {method.logo_url ? (
                                    <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Wallet className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                            <div className="ml-4 flex-1 text-left">
                                <span className={`block font-semibold ${selectedId === method.id ? 'text-gray-900' : 'text-gray-700'}`}>{method.name}</span>
                                {method.payment_account?.account_number && (
                                    <span className="text-xs text-gray-500 block mt-0.5">{method.payment_account.account_number}</span>
                                )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300 ${selectedId === method.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                {selectedId === method.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
             )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedId || isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                >
                    {isProcessing ? (
                        <div className="flex items-center animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        "Confirm Payment"
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};