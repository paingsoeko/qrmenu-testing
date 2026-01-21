import { useState, useEffect, useCallback, useRef } from 'react';
import { Cart, CartItem, Product } from '../types';
import { fetchCart, updateCartItem, removeCartItem, addToCart as apiAddToCart, getSessionId } from '../services/api';

const CART_STORAGE_KEY = 'qr_menu_cart_cache';

export const useCart = () => {
  // Initialize from storage to provide instant feedback
  const [cart, setCart] = useState<Cart | null>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse cached cart", e);
      return null;
    }
  });

  // Only show loading spinner if we don't have data
  const [loading, setLoading] = useState<boolean>(!cart);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // Ref to access current cart in callbacks without dependency loops
  const cartRef = useRef(cart);
  useEffect(() => { cartRef.current = cart; }, [cart]);

  // Persist to localStorage
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Helper to merge simplified API response with rich local data
  const mergeCartData = useCallback((prevCart: Cart, updatedCart: Cart): Cart => {
    if (!updatedCart.items) return updatedCart;

    const mergedItems = updatedCart.items.map(newItem => {
        const existingItem = prevCart.items?.find(i => i.id === newItem.id);
        if (existingItem) {
            const newItemHasProductData = newItem.product && (newItem.product.product_image || newItem.product.image || Object.keys(newItem.product).length > 1);
            const productToUse = newItemHasProductData ? newItem.product : (existingItem.product || newItem.product);

            const newItemHasVariantData = newItem.variant && (newItem.variant.fullName || Object.keys(newItem.variant).length > 1);
            const variantToUse = newItemHasVariantData ? newItem.variant : (existingItem.variant || newItem.variant);
            
            const productFullName = (newItem.product_full_name === "Unknown Product" || !newItem.product_full_name)
                    ? existingItem.product_full_name 
                    : newItem.product_full_name;

            return {
                ...newItem,
                product: productToUse,
                variant: variantToUse,
                product_full_name: productFullName
            };
        }
        return newItem;
    });

    return { ...updatedCart, items: mergedItems };
  }, []);

  const loadCart = useCallback(async () => {
    // If no cache, set loading. If cache exists, silent background update.
    if (!cartRef.current) setLoading(true);
    
    try {
      const sessionId = getSessionId();
      const data = await fetchCart(sessionId);
      
      setCart(prevCart => {
        if (prevCart) {
            return mergeCartData(prevCart, data);
        }
        return data;
      });
      // Clear error if load succeeds
      setError(null);
    } catch (err: any) {
      // Only block UI with error if we have no cached data
      if (!cartRef.current) {
        setError(err.message || "Unable to load cart");
      } else {
        console.warn("Background cart refresh failed:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [mergeCartData]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
        const sessionId = getSessionId();
        const updatedCart = await updateCartItem({
            session_id: sessionId,
            cart_item_id: itemId,
            quantity: newQuantity
        });
        
        setCart(prevCart => prevCart ? mergeCartData(prevCart, updatedCart) : updatedCart);
    } catch (err) {
        console.error("Failed to update item", err);
    } finally {
        setUpdatingItems(prev => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    }
  };

  const removeItem = async (itemId: number) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
        const sessionId = getSessionId();
        const updatedCart = await removeCartItem({
            session_id: sessionId,
            cart_item_id: itemId
        });

        setCart(prevCart => prevCart ? mergeCartData(prevCart, updatedCart) : updatedCart);
    } catch (err) {
        console.error("Failed to remove item", err);
    } finally {
        setUpdatingItems(prev => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    }
  };
  
  const addItem = async (product: Product) => {
    const sessionId = getSessionId();
    if (!product.product_id && !product.id) {
        throw new Error("Missing Product ID");
    }

    const updatedCart = await apiAddToCart({
        session_id: sessionId,
        product_id: product.product_id || product.id,
        product_variant_id: product.product_variant_id || product.id,
        uom_id: product.uom_id || 1,
        uom_price: product.price,
        quantity: 1
    });
    
    setCart(prevCart => prevCart ? mergeCartData(prevCart, updatedCart) : updatedCart);
    return updatedCart;
  };

  const calculateTotal = (items: CartItem[] = []) => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.uom_price)), 0);
  };

  return {
    cart,
    loading,
    error,
    updatingItems,
    updateQuantity,
    removeItem,
    addToCart: addItem,
    total: calculateTotal(cart?.items),
    refreshCart: loadCart
  };
};