import React, { useEffect, useState } from 'react';
import { Loader2, Receipt, Clock, ChefHat, CheckCircle, XCircle, ShoppingBag, AlertCircle } from 'lucide-react';
import { fetchOrderHistory, getSessionId } from '../services/api';
import { OrderHistoryData, Order, OrderSaleItem } from '../types';
import { ErrorDisplay } from './ErrorDisplay';
import { useCurrency } from '../context/CurrencyContext';

interface OrderHistoryPageProps {
    onBack: () => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBack }) => {
    const [data, setData] = useState<OrderHistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const { formatPrice } = useCurrency();

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const sessionId = getSessionId();
            const history = await fetchOrderHistory(sessionId);
            setData(history);
        } catch (err: any) {
            setError(err.message || "Failed to load order history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' };
            case 'cooking':
            case 'processing':
                return { color: 'bg-blue-100 text-blue-700', icon: <ChefHat className="w-3.5 h-3.5" />, label: 'Preparing' };
            case 'ready':
            case 'served':
            case 'completed':
            case 'paid':
                return { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Served' };
            case 'cancelled':
                return { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled' };
            default:
                return { color: 'bg-gray-100 text-gray-700', icon: <Receipt className="w-3.5 h-3.5" />, label: status };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading history...</p>
            </div>
        );
    }

    if (error) {
        return <ErrorDisplay message={error} onRetry={loadHistory} />;
    }

    const currentOrders = data?.current_orders || [];
    const pastOrders = data?.past_orders || [];
    const displayOrders = activeTab === 'current' ? currentOrders : pastOrders;

    return (
        <div className="max-w-3xl mx-auto w-full px-4 py-6 pb-24 animate-in slide-in-from-right duration-300">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'current' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Active Orders ({currentOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                        activeTab === 'past' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Past Orders ({pastOrders.length})
                </button>
            </div>

            {displayOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold mb-1">No orders found</h3>
                    <p className="text-gray-500 text-sm">You haven't placed any orders in this category yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayOrders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status);
                        const items = order.sale?.items || [];
                        
                        return (
                            <div 
                                key={order.id} 
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Order Header */}
                                <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-bold text-gray-900">{order.order_number}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                                        </div>
                                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            <span className="uppercase tracking-wider">{statusConfig.label}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs text-gray-500 mb-0.5">Total</span>
                                        <span className="font-bold text-gray-900 text-lg">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 space-y-3">
                                    {items.length > 0 ? (
                                        items.map((item: OrderSaleItem) => {
                                            const productName = item.variation?.fullName || item.variation?.product?.name || "Unknown Item";
                                            const image = item.variation?.product?.product_image || item.variation?.product?.image || null;

                                            return (
                                                <div key={item.id} className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {image ? (
                                                            <img src={image} alt={productName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <ShoppingBag className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-sm font-medium text-gray-800 line-clamp-1">{productName}</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {formatPrice(item.subtotal)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            Qty: {Number(item.quantity)} × {formatPrice(item.uom_price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            <span>Details unavailable</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};