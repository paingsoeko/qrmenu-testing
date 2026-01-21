import React, { useEffect, useState, useMemo } from 'react';
import { Search, Loader2, Utensils, Coffee, Pizza, IceCream, UtensilsCrossed, ChevronRight, LayoutGrid, List, ShoppingBag, RefreshCw, CheckCircle, Clock, FileText } from 'lucide-react';
import { Product, LocationData, Table } from '../types';
import { fetchProducts, checkPaymentStatus } from '../services/api';
import { ErrorDisplay } from './ErrorDisplay';
import { ProductCard } from './ProductCard';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../context/CurrencyContext';

interface MenuPageProps {
  location: LocationData;
  table: Table;
  onViewCart: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ location, table, onViewCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  // Pending Order Status Logic
  const [pendingToken, setPendingToken] = useState<string | null>(() => localStorage.getItem('active_order_token'));
  const [paymentStatus, setPaymentStatus] = useState<string>('requested');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [orderStatusMessage, setOrderStatusMessage] = useState<string | null>(null);

  const { cart, addToCart, total } = useCart();
  const { formatPrice } = useCurrency();

  const cartItemCount = cart?.items ? cart.items.reduce((acc, item) => acc + Number(item.quantity), 0) : 0;
  const cartTotal = total || 0;

  // Load Products
  useEffect(() => {
    let isMounted = true;
    const initMenu = async () => {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const productsData = await fetchProducts(location.id);
        if (isMounted) setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err: any) {
        if (isMounted) {
          setProductsError(err.message || "Unable to load menu.");
        }
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    initMenu();
    return () => { isMounted = false; };
  }, [location.id]);

  // Initial Status Check on Mount
  useEffect(() => {
      if (pendingToken) {
          handleRefreshStatus(true); // Silent check
      }
  }, []);

  // Cart Animation
  useEffect(() => {
      if (cartItemCount > 0) {
          setIsCartAnimating(true);
          const timer = setTimeout(() => setIsCartAnimating(false), 300);
          return () => clearTimeout(timer);
      }
  }, [cartItemCount]);

  const handleRefreshStatus = async (silent = false) => {
      if (!pendingToken) return;
      if (!silent) setCheckingStatus(true);
      
      try {
          const statusData = await checkPaymentStatus(pendingToken);
          setPaymentStatus(statusData.status);

          if (statusData.status === 'confirmed') {
              setOrderStatusMessage("Payment Confirmed! Your order is being prepared.");
              // Clear token after a short delay so user sees the success state
              setTimeout(() => {
                  localStorage.removeItem('active_order_token');
                  setPendingToken(null);
                  setOrderStatusMessage(null);
              }, 4000);
          } else if (!silent) {
              setOrderStatusMessage("Status: Payment under review");
              setTimeout(() => setOrderStatusMessage(null), 2000);
          }
      } catch (err) {
          if (!silent) {
            setOrderStatusMessage("Failed to check status.");
            setTimeout(() => setOrderStatusMessage(null), 2000);
          }
      } finally {
          if (!silent) setCheckingStatus(false);
      }
  };

  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    const cats = new Set(products.map(p => p.category || 'Other'));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      if (!product) return false;
      const term = searchTerm.toLowerCase();
      const matchesSearch = (product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term));
      const matchesCategory = selectedCategory === 'All' || (product.category || 'Other') === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const lower = category ? category.toLowerCase() : '';
    if (lower.includes('drink') || lower.includes('beverage')) return <Coffee className="w-4 h-4" />;
    if (lower.includes('pizza') || lower.includes('pasta')) return <Pizza className="w-4 h-4" />;
    if (lower.includes('dessert') || lower.includes('sweet')) return <IceCream className="w-4 h-4" />;
    if (lower.includes('burger') || lower.includes('meat')) return <UtensilsCrossed className="w-4 h-4" />;
    return <Utensils className="w-4 h-4" />;
  };

  const handleAddToCart = async (product: Product) => {
    try {
        await addToCart(product);
    } catch (err: any) {
        alert("Failed to add: " + err.message);
        throw err;
    }
  };

  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Preparing menu...</p>
      </div>
    );
  }

  if (productsError) return <ErrorDisplay message={productsError} onRetry={() => window.location.reload()} />;

  const isConfirmed = paymentStatus === 'confirmed';

  return (
    <div className="w-full pb-32 bg-gray-50 min-h-screen relative">
      
      {/* Sticky Headers Container */}
      <div className="sticky top-16 z-30 transition-all duration-300">
          
          {/* Status Pill UI */}
          {pendingToken && (
             <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm animate-fade-in-up relative z-40">
                 <div className={`
                    rounded-xl p-1 flex items-center justify-between border
                    ${isConfirmed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}
                 `}>
                     <div className="flex items-center space-x-3 px-2">
                         <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center shadow-sm
                            ${isConfirmed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
                         `}>
                             {isConfirmed ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                         </div>
                         <div className="flex flex-col">
                             <span className={`text-sm font-bold ${isConfirmed ? 'text-green-800' : 'text-blue-900'}`}>
                                 {isConfirmed ? 'Order Confirmed' : 'Order Requested'}
                             </span>
                             <span className={`text-xs font-medium ${isConfirmed ? 'text-green-600' : 'text-blue-600'} flex items-center`}>
                                 {!isConfirmed && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                 {isConfirmed ? 'Sent to kitchen' : 'Verifying payment slip...'}
                             </span>
                         </div>
                     </div>

                     <button 
                        onClick={() => handleRefreshStatus()}
                        disabled={checkingStatus || isConfirmed}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center space-x-1 mr-1
                            ${isConfirmed 
                                ? 'bg-white text-green-600 opacity-50 cursor-default' 
                                : 'bg-white text-blue-600 shadow-sm hover:bg-blue-50 border border-blue-100'}
                        `}
                     >
                         {checkingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                         <span>{checkingStatus ? 'Checking' : 'Refresh'}</span>
                     </button>
                 </div>
             </div>
          )}
          
          {/* Toast Notification */}
          {orderStatusMessage && (
               <div className={`
                    absolute top-full left-0 right-0 mx-4 mt-2 p-3 rounded-xl shadow-lg border text-sm font-bold flex items-center justify-center z-50 animate-fade-in-up
                    ${orderStatusMessage.includes('Confirmed') ? 'bg-green-600 text-white border-green-700' : 'bg-gray-800 text-white border-gray-900'}
               `}>
                   {orderStatusMessage.includes('Confirmed') && <CheckCircle className="w-4 h-4 mr-2" />}
                   {orderStatusMessage}
               </div>
          )}

          {/* Search & Filter Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Search and Toggle Row */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                            placeholder="Search for food, drinks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                            aria-label="Grid View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                            aria-label="List View"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mask-fade-right">
                {categories.map((category) => (
                    <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                        flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border
                        ${selectedCategory === category 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                    `}
                    >
                    {category !== 'All' && getCategoryIcon(category)}
                    <span>{category}</span>
                    </button>
                ))}
                </div>
            </div>
          </div>
      </div>

      {/* Product List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                : "flex flex-col space-y-3"
            }>
            {filteredProducts.map((product, idx) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx < 10 ? idx * 50 : 0}ms` }}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} viewMode={viewMode} />
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Utensils className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No items found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="text-orange-600 font-bold mt-4 hover:underline">Clear all filters</button>
            </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
            <div className="max-w-xl mx-auto pointer-events-auto">
                <button 
                onClick={onViewCart}
                className={`
                    w-full group relative overflow-hidden bg-gray-900 text-white rounded-2xl p-4 shadow-2xl shadow-orange-500/20
                    transform transition-all duration-300 active:scale-95 hover:shadow-orange-500/30 border border-white/10
                    ${isCartAnimating ? 'scale-105' : 'scale-100'} animate-fade-in-up
                `}
                >
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex items-center justify-between">
                        {/* Count Badge & Total */}
                        <div className="flex items-center space-x-3.5">
                            <div className="relative">
                                <div className={`
                                    bg-orange-500 text-white font-bold h-11 w-11 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800
                                    transform transition-transform duration-300 ${isCartAnimating ? 'scale-110 rotate-12' : 'scale-100'}
                                `}>
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                                    {cartItemCount}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total</span>
                                <span className="text-xl font-bold tracking-tight">
                                    {formatPrice(cartTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Action Text */}
                        <div className="flex items-center pl-4 border-l border-white/10 h-10">
                            <span className="text-sm font-semibold mr-3 text-white/90 group-hover:text-white transition-colors">View Cart</span>
                            <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-orange-500 transition-colors duration-300">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};