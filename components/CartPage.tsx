import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { LocationData } from '../types';
import { ErrorDisplay } from './ErrorDisplay';
import { useCart } from '../hooks/useCart';
import { usePromptPay } from '../hooks/usePromptPay';
import { CartItemRow } from './CartItemRow';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PromptPayDisplay } from './PromptPayDisplay';
import { OrderSuccessView } from './OrderSuccessView';

interface CartPageProps {
  onBack: () => void;
  location: LocationData | null;
}

export const CartPage: React.FC<CartPageProps> = ({ onBack, location }) => {
  // Logic extracted to hooks
  const { cart, loading, error, updatingItems, updateQuantity, removeItem, total, refreshCart } = useCart();
  const { qrData, loadingQr, qrError, orderPlaced, setOrderPlaced, generateQr, manualCheckStatus, cancelQr } = usePromptPay(cart, location, total);
  
  const [showPayment, setShowPayment] = useState(false);
  const [animateTotal, setAnimateTotal] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);

  useEffect(() => {
    if (total !== prevTotal) {
      setAnimateTotal(true);
      const timer = setTimeout(() => setAnimateTotal(false), 300);
      setPrevTotal(total);
      return () => clearTimeout(timer);
    }
  }, [total, prevTotal]);

  // View Routing Logic
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your order...</p>
      </div>
    );
  }

  if (error || qrError) {
    return <ErrorDisplay message={error || qrError || "Error"} onRetry={() => window.location.reload()} />;
  }

  if (orderPlaced) {
    return <OrderSuccessView onBack={onBack} />;
  }

  if (qrData) {
    return (
      <PromptPayDisplay 
        data={qrData} 
        loading={loadingQr} 
        onCheckStatus={manualCheckStatus} 
        onCancel={cancelQr}
      />
    );
  }

  if (showPayment) {
    return (
        <PaymentMethodSelector 
            total={total}
            onBack={() => setShowPayment(false)}
            onConfirm={(slug) => {
                if (slug === 'stripe') {
                    generateQr();
                } else {
                    setOrderPlaced(true);
                }
            }}
            loadingExternal={loadingQr}
        />
    );
  }

  // Default Cart View
  const items = cart?.items || [];

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-32 animate-in slide-in-from-right duration-300">
      
      {/* Items List */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-orange-500" />
            Your Selection ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 animate-fade-in-up">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <button onClick={onBack} className="text-orange-600 font-medium hover:underline">
              Browse Menu
            </button>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow 
                key={item.id}
                item={item}
                isUpdating={updatingItems.has(item.id)}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* Bill Details */}
      {items.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Service Charge (0%)</span>
            <span>$0.00</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className={`font-bold text-orange-600 text-xl transition-transform duration-300 inline-block ${animateTotal ? 'scale-110' : ''}`}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
            </span>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 animate-slide-up">
            <div className="max-w-3xl mx-auto flex space-x-4">
                <button 
                    onClick={onBack}
                    className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                    Add More Items
                </button>
                <button 
                    onClick={() => setShowPayment(true)}
                    className="flex-[2] py-3.5 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors flex justify-center items-center active:scale-95 transform duration-150"
                >
                    Place Order
                </button>
            </div>
        </div>
      )}
    </div>
  );
};