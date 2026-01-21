import React, { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, viewMode = 'grid' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { formatPrice } = useCurrency();

  const imageUrl = product.image || `https://picsum.photos/seed/${product.id}/400/300`;
  const formattedPrice = formatPrice(Number(product.price));

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || isAdding) return;

    setIsAdding(true);
    try {
      await onAddToCart(product);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsAdding(false);
    }
  };

  if (viewMode === 'list') {
    return (
        <div className="group bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100 flex gap-4 h-28 hover:shadow-lg hover:border-orange-100 transition-all duration-300 overflow-hidden relative">
             {/* Image */}
            <div className="w-24 h-full rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1 pr-1">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-1 mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {product.description || "No description available."}
                    </p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-gray-900 text-base">{formattedPrice}</span>
                    <button 
                        onClick={handleAdd}
                        disabled={isAdding}
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95
                        ${isSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-orange-600'}
                        `}
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : isSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // Grid view
  return (
    <div className="group bg-white rounded-2xl p-3 shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-xl hover:border-orange-100 transition-all duration-300 relative overflow-hidden">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Floating Price Tag */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm text-xs font-bold text-gray-900 border border-gray-100">
             {formattedPrice}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        
        <button 
            onClick={handleAdd}
            disabled={isAdding}
            className={`
            w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95
            ${isSuccess 
                ? 'bg-green-500 text-white shadow-green-200' 
                : 'bg-gray-50 text-gray-900 hover:bg-orange-600 hover:text-white'}
            `}
        >
            {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
                </>
            ) : (
                <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Order</span>
                </>
            )}
        </button>
      </div>
    </div>
  );
};