import React, { useEffect, useState } from 'react';
import { Loader2, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CartItemRowProps {
  item: CartItem;
  isUpdating: boolean;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item, isUpdating, onUpdateQuantity, onRemove }) => {
  const { formatPrice } = useCurrency();
  const name = item.variant?.fullName || item.product_full_name || "Unknown Item";
  
  const image = item.product?.product_image || 
                item.product?.image || 
                item.variant?.product?.product_image || 
                item.variant?.product?.image || 
                "https://via.placeholder.com/150";
  
  const quantity = Number(item.quantity);
  const [prevQuantity, setPrevQuantity] = useState(quantity);
  const [highlight, setHighlight] = useState(false);

  // Trigger highlight animation when quantity changes
  useEffect(() => {
    if (quantity !== prevQuantity) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 300);
      setPrevQuantity(quantity);
      return () => clearTimeout(timer);
    }
  }, [quantity, prevQuantity]);

  return (
    <div className={`
      bg-white p-4 rounded-2xl shadow-sm border transition-all duration-300 animate-fade-in-up
      flex items-center space-x-4 relative overflow-hidden
      ${isUpdating ? 'border-orange-200 bg-gray-50/50' : 'border-gray-100 hover:border-orange-100'}
    `}>
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px] transition-opacity duration-300">
           {/* Subtle loading indicator if needed, but the spinner is in the button mostly */}
        </div>
      )}

      <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-1 z-20">
        <div>
          <h3 className="font-semibold text-gray-900 truncate pr-2">{name}</h3>
          <div className="text-sm text-gray-500 mt-1">
             <span>{formatPrice(Number(item.uom_price))}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center space-x-1 mt-2 w-fit transition-colors"
          disabled={isUpdating}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove</span>
        </button>
      </div>

      <div className="flex flex-col items-end space-y-3 z-20">
         <div className={`font-bold text-gray-900 text-lg transition-transform duration-300 ${highlight ? 'scale-110 text-orange-600' : ''}`}>
              {formatPrice(Number(item.uom_price) * quantity)}
         </div>
         
         <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-9 overflow-hidden">
            <button 
              onClick={() => onUpdateQuantity(item.id, quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:text-gray-500 active:bg-gray-200 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-8 flex items-center justify-center text-sm font-semibold text-gray-900 relative">
              {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500 absolute" />
              ) : (
                  <span className={`transition-all duration-300 ${highlight ? 'scale-125 font-bold text-orange-600' : ''}`}>
                    {quantity}
                  </span>
              )}
            </div>

            <button 
               onClick={() => onUpdateQuantity(item.id, quantity + 1)}
               disabled={isUpdating}
               className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-gray-100 disabled:opacity-30 active:bg-gray-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>
    </div>
  );
};