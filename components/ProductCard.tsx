import React, { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, viewMode = 'grid' }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const imageUrl = product.image || `https://picsum.photos/seed/${product.id}/400/300`;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(product.price));

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

  const renderAddButton = (fullWidth: boolean = true) => (
    <button 
        onClick={handleAdd}
        disabled={isAdding}
        className={`
        ${fullWidth ? 'w-full' : 'px-4'} h-9 rounded-lg transition-all duration-300 font-semibold text-sm active:scale-95 flex items-center justify-center
        ${isSuccess 
            ? 'bg-green-500 text-white shadow-md' 
            : 'bg-gray-100 text-gray-900 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'}
        `}
    >
        {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSuccess ? (
        <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4" />
            {fullWidth && <span>Added</span>}
        </div>
        ) : (
        <div className="flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Add</span>
        </div>
        )}
    </button>
  );

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex gap-4 h-32 hover:shadow-md transition-all duration-300">
            <div className="w-28 h-full rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 pr-2">{product.name}</h3>
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{formattedPrice}</span>
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {product.description || "Freshly prepared."}
                    </p>
                </div>
                
                <div className="flex justify-end mt-2">
                    {renderAddButton(false)}
                </div>
            </div>
        </div>
    );
  }

  // GRID VIEW LAYOUT (Default)
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Price Badge on Image */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
             <span className="font-bold text-gray-900 text-sm">{formattedPrice}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description || "Freshly prepared for you."}
        </p>
        
        <div className="mt-auto">
            {renderAddButton(true)}
        </div>
      </div>
    </div>
  );
};