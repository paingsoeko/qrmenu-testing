import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { LocationData, PaymentMethod } from '../types';
import { ErrorDisplay } from './ErrorDisplay';
import { useCart } from '../hooks/useCart';
import { usePromptPay } from '../hooks/usePromptPay';
import { CartItemRow } from './CartItemRow';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PromptPayDisplay } from './PromptPayDisplay';
import { ManualPaymentDisplay } from './ManualPaymentDisplay';
import { OrderSuccessView } from './OrderSuccessView';
import { ConfirmationModal } from './ConfirmationModal';
import { useCurrency } from '../context/CurrencyContext';

interface CartPageProps {
  onBack: () => void;
  location: LocationData | null;
}

export const CartPage: React.FC<CartPageProps> = ({ onBack, location }) => {
  // Logic extracted to hooks
  const { cart, loading, error, updatingItems, updateQuantity, removeItem, total, refreshCart } = useCart();
  const { qrData, loadingQr, qrError, orderPlaced, setOrderPlaced, generateQr, manualCheckStatus, cancelQr } = usePromptPay(cart, location, total);
  const { formatPrice } = useCurrency();
  
  const [showPayment, setShowPayment] = useState(false);
  const [manualMethod, setManualMethod] = useState<PaymentMethod | null>(null);
  const [animateTotal, setAnimateTotal] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  
  // Track selected payment method for success screen logic
  const [selectedPaymentSlug, setSelectedPaymentSlug] = useState<string | null>(null);

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
        <Loader2 className="w-10 h-10 text-stone-500 animate-spin mb-4" />
        <p className="text-stone-500 font-medium">Loading your order...</p>
      </div>
    );
  }

  if (error || qrError) {
    return <ErrorDisplay message={error || qrError || "Error"} onRetry={() => window.location.reload()} />;
  }

  if (orderPlaced) {
    return <OrderSuccessView onBack={onBack} paymentSlug={selectedPaymentSlug || ''} />;
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

  if (manualMethod && cart && location) {
      return (
          <ManualPaymentDisplay 
            paymentMethod={manualMethod}
            total={total}
            cartId={cart.id}
            locationId={location.id}
            onSuccess={(data) => {
                if (data && data.token) {
                    localStorage.setItem('active_order_token', data.token);
                }
                setOrderPlaced(true);
            }}
            onCancel={() => setManualMethod(null)}
          />
      );
  }

  if (showPayment) {
    return (
        <PaymentMethodSelector 
            total={total}
            onBack={() => setShowPayment(false)}
            onConfirm={(method) => {
                setSelectedPaymentSlug(method.slug);
                if (method.slug === 'stripe' || method.slug === 'promptpay' || method.slug === 'staff') {
                    generateQr(method.slug);
                } else {
                    setManualMethod(method);
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
        <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-stone-800" />
            Your Selection ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 animate-fade-in-up">
            <p className="text-stone-500 mb-4">Your cart is empty.</p>
            <button onClick={onBack} className="text-stone-800 font-medium hover:underline">
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
                onRemove={(id) => setItemToRemove(id)}
            />
          ))
        )}
      </div>

      {/* Bill Details */}
      {items.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Service Charge (0%)</span>
            <span>{formatPrice(0)}</span>
          </div>
          <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
            <span className="font-bold text-stone-900 text-lg">Total</span>
            <span className={`font-bold text-stone-800 text-xl transition-transform duration-300 inline-block ${animateTotal ? 'scale-110' : ''}`}>
              {formatPrice(total)}
            </span>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 animate-slide-up">
            <div className="max-w-3xl mx-auto flex space-x-4">
                <button 
                    onClick={onBack}
                    className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-colors"
                >
                    Add More Items
                </button>
                <button 
                    onClick={() => setShowPayment(true)}
                    className="flex-[2] py-3.5 rounded-xl bg-stone-800 text-white font-bold shadow-lg shadow-stone-200 hover:bg-stone-900 transition-colors flex justify-center items-center active:scale-95 transform duration-150"
                >
                    Place Order
                </button>
            </div>
        </div>
      )}

      <ConfirmationModal 
         isOpen={itemToRemove !== null}
         onCancel={() => setItemToRemove(null)}
         onConfirm={() => {
             if (itemToRemove) removeItem(itemToRemove);
             setItemToRemove(null);
         }}
         title="Remove Item?"
         message="Are you sure you want to remove this item from your cart?"
      />
    </div>
  );
};