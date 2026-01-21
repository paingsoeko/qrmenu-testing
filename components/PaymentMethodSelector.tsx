import React, { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, CreditCard, Wallet, CheckCircle, UserCircle2 } from 'lucide-react';
import { PaymentMethod } from '../types';
import { fetchPaymentMethods } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

interface PaymentMethodSelectorProps {
  total: number;
  onBack: () => void;
  onConfirm: (method: PaymentMethod) => void;
  loadingExternal: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ total, onBack, onConfirm, loadingExternal }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatPrice } = useCurrency();

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
        onConfirm(selected);
    }
  };

  const isProcessing = loadingExternal || isSubmitting;

  const renderIcon = (method: PaymentMethod) => {
      if (method.logo_url) {
          return <img src={method.logo_url} alt={method.name} className="w-full h-full object-contain" />;
      }
      if (method.slug === 'staff') {
          return <UserCircle2 className="w-6 h-6 text-stone-600" />;
      }
      return <Wallet className="w-5 h-5 text-stone-400" />;
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-32 animate-in slide-in-from-right duration-300">
        <div className="mb-6 flex items-center">
            <button 
                onClick={onBack} 
                disabled={isProcessing}
                className={`p-2 -ml-2 rounded-full hover:bg-stone-100 text-stone-600 mr-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-stone-900">Payment Method</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-6">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-stone-500">Total Amount</span>
                 <span className="text-xl font-bold text-stone-800">
                     {formatPrice(total)}
                 </span>
             </div>
             <div className="h-px bg-stone-100 w-full mb-4"></div>
             
             <h3 className="font-semibold text-stone-900 mb-4 flex items-center">
                 <CreditCard className="w-4 h-4 mr-2 text-stone-600" />
                 Select Payment Option
             </h3>

             {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-stone-500 animate-spin" />
                </div>
             ) : methods.length === 0 ? (
                <div className="text-center py-8 text-stone-500">No payment methods available.</div>
             ) : (
                <div className="space-y-3">
                    {methods.map(method => (
                        <button
                            key={method.id}
                            onClick={() => !isProcessing && setSelectedId(method.id)}
                            disabled={isProcessing}
                            className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-300 
                                ${selectedId === method.id 
                                    ? 'border-stone-800 bg-stone-50 shadow-md ring-2 ring-stone-200 ring-offset-2 scale-[1.02]' 
                                    : 'border-stone-100 bg-white hover:shadow-sm'}
                                ${!isProcessing && selectedId !== method.id ? 'hover:border-stone-300' : ''}
                                ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-stone-200 flex-shrink-0 flex items-center justify-center p-1">
                                {renderIcon(method)}
                            </div>
                            <div className="ml-4 flex-1 text-left">
                                <span className={`block font-semibold ${selectedId === method.id ? 'text-stone-900' : 'text-stone-700'}`}>{method.name}</span>
                                {method.payment_account?.account_number && method.slug !== 'staff' && (
                                    <span className="text-xs text-stone-500 block mt-0.5">{method.payment_account.account_number}</span>
                                )}
                                {method.slug === 'staff' && (
                                    <span className="text-xs text-stone-500 block mt-0.5">Show QR code to staff</span>
                                )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300 ${selectedId === method.id ? 'border-stone-800 bg-stone-800' : 'border-stone-300'}`}>
                                {selectedId === method.id && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
             )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedId || isProcessing}
                    className="w-full py-3.5 rounded-xl bg-stone-900 text-white font-bold shadow-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
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