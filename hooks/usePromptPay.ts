import { useState, useEffect, useRef } from 'react';
import { PromptPayQrData, LocationData, Cart } from '../types';
import { generatePromptPayQr, generateStaffQr, checkPromptPayStatus, checkPaymentStatus } from '../services/api';

const QR_STORAGE_KEY = 'qr_menu_promptpay_data';

export const usePromptPay = (
  cart: Cart | null, 
  location: LocationData | null, 
  totalAmount: number
) => {
  const [qrData, setQrData] = useState<PromptPayQrData | null>(() => {
    try {
      const saved = localStorage.getItem(QR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loadingQr, setLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Use refs to track mounting status and timeout to ensure cleanup
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Poll for status when QR data exists
  useEffect(() => {
    // If no QR data or order already placed, stop polling
    if (!qrData || !qrData.token || orderPlaced) {
        return;
    }

    let currentDelay = 2000; // Start with 2s delay
    
    const pollStatus = async () => {
        try {
            let isConfirmed = false;

            // Differentiate check logic based on QR Type
            if (qrData.qr_type === 'staff') {
                const statusData = await checkPaymentStatus(qrData.token);
                if (statusData.status === 'confirmed') isConfirmed = true;
            } else {
                // Default PromptPay
                const statusData = await checkPromptPayStatus(qrData.token);
                if (statusData.status === 'confirmed') isConfirmed = true;
            }
            
            // Check if component is still mounted before state updates
            if (!isMountedRef.current) return;

            if (isConfirmed) {
                localStorage.removeItem(QR_STORAGE_KEY);
                setQrData(null);
                setOrderPlaced(true);
                return; // Stop polling on success
            }
            
            // If payment is pending, continue polling with standard interval
            currentDelay = 3000; 
            timeoutRef.current = setTimeout(pollStatus, currentDelay);

        } catch (err) {
            console.error("Error polling payment status:", err);
            
            if (!isMountedRef.current) return;
            
            // Implement exponential backoff for errors
            // Increase delay by 50%, capping at 15 seconds
            currentDelay = Math.min(currentDelay * 1.5, 15000);
            timeoutRef.current = setTimeout(pollStatus, currentDelay);
        }
    };

    // Initial call
    pollStatus();

    // Cleanup function for this effect
    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [qrData, orderPlaced]);

  const generateQr = async (slug: string = 'promptpay') => {
      if (!cart || !location) {
          setQrError("Missing cart or location information.");
          return;
      }

      setLoadingQr(true);
      setQrError(null);
      try {
          let data;
          const payload = {
            cart_id: cart.id,
            location_id: location.id,
            amount: totalAmount,
            order_type: 'dine_in'
          };

          if (slug === 'staff') {
             data = await generateStaffQr(payload);
          } else {
             data = await generatePromptPayQr(payload);
          }
          
          localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(data));
          setQrData(data);
      } catch (err: any) {
          setQrError(err.message || "Failed to generate QR code");
      } finally {
          setLoadingQr(false);
      }
  };

  const manualCheckStatus = async () => {
      if (!qrData || !qrData.token) return;
      
      setLoadingQr(true);
      try {
        let isConfirmed = false;
        
        if (qrData.qr_type === 'staff') {
            const statusData = await checkPaymentStatus(qrData.token);
            if (statusData.status === 'confirmed') isConfirmed = true;
        } else {
            const statusData = await checkPromptPayStatus(qrData.token);
            if (statusData.status === 'confirmed') isConfirmed = true;
        }

        if (isConfirmed) {
            localStorage.removeItem(QR_STORAGE_KEY);
            setQrData(null);
            setOrderPlaced(true);
        } else {
            alert("Payment is still pending. Please scan the QR code.");
        }
      } catch (err: any) {
          console.error("Manual check failed", err);
          alert("Could not check status: " + (err.message || "Unknown error"));
      } finally {
          setLoadingQr(false);
      }
  };

  const cancelQr = () => {
      if (window.confirm("Are you sure you want to cancel this payment?")) {
          setQrData(null);
          localStorage.removeItem(QR_STORAGE_KEY);
          // Clearing state triggers useEffect cleanup, stopping the poll
      }
  };

  return {
      qrData,
      loadingQr,
      qrError,
      orderPlaced,
      setOrderPlaced,
      generateQr,
      manualCheckStatus,
      cancelQr,
      resetQr: () => setQrData(null)
  };
};