import React, { useState, useRef } from 'react';
import { Loader2, ArrowLeft, Upload, CheckCircle, Image as LucideImage, CreditCard, Copy, X } from 'lucide-react';
import { PaymentMethod } from '../types';
import { requestManualPayment } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

interface ManualPaymentDisplayProps {
  paymentMethod: PaymentMethod;
  total: number;
  cartId: number;
  locationId: number | string;
  onSuccess: (data?: any) => void;
  onCancel: () => void;
}

export const ManualPaymentDisplay: React.FC<ManualPaymentDisplayProps> = ({ 
    paymentMethod, 
    total, 
    cartId,
    locationId,
    onSuccess, 
    onCancel 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();

  // Guard clause for missing prop
  if (!paymentMethod) return null;

  // Use a type safe default object or existing account
  const account = paymentMethod.payment_account || {
    id: 0,
    name: paymentMethod.name,
    account_number: '',
    account_type: '',
    description: '',
    qrimage_url: '',
    image: ''
  };

  // Prioritize qrimage_url as per API response
  const qrImage = account.qrimage_url || account.qrimage || (account as any).image;
  const hasQr = Boolean(qrImage);
  
  const accountName = account.account_name || account.name || paymentMethod.name;
  const accountNumber = account.account_number || "N/A";
  const description = account.description || "Scan or transfer the exact amount.";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const copyToClipboard = () => {
      if (accountNumber && accountNumber !== "N/A") {
          navigator.clipboard.writeText(accountNumber);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
        alert("Please upload your payment slip.");
        return;
    }

    setIsSubmitting(true);
    try {
        const responseData = await requestManualPayment({
            cart_id: cartId,
            location_id: locationId,
            payment_method_id: paymentMethod.id,
            amount: total,
            order_type: 'dine_in',
            proof_image: selectedFile
        });
        onSuccess(responseData);
    } catch (err: any) {
        console.error("Payment error:", err);
        alert(err.message || "Failed to place order. Please try again.");
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 pb-32 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center mb-8">
            <button 
                onClick={onCancel} 
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
                <p className="text-sm text-gray-500">Transfer & Upload Slip</p>
            </div>
        </div>

        <div className="space-y-6">
            {/* Payment Details Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                
                <div className="p-8 text-center">
                    {/* Bank Logo */}
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-50 flex items-center justify-center mx-auto mb-5 p-2 relative z-10">
                         {paymentMethod.logo_url ? (
                             <img src={paymentMethod.logo_url} alt={paymentMethod.name} className="w-full h-full object-contain rounded-xl" />
                         ) : (
                             <CreditCard className="w-8 h-8 text-gray-400" />
                         )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900">{accountName}</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{description}</p>

                    {hasQr ? (
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 inline-block mb-6 relative group">
                            <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-3xl pointer-events-none" />
                            <img 
                                src={qrImage} 
                                alt="Payment QR" 
                                className="w-48 h-48 object-contain rounded-xl"
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-left max-w-sm mx-auto mb-6 relative group">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Account Number</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-mono text-gray-900 font-bold tracking-wide">{accountNumber}</p>
                                <button 
                                    onClick={copyToClipboard}
                                    className="p-2 -mr-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center bg-gray-900 text-white py-4 px-6 rounded-2xl shadow-lg shadow-gray-200">
                        <span className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Total Amount</span>
                        <span className="text-3xl font-bold tracking-tight">
                            {formatPrice(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-orange-600" />
                        Upload Slip
                    </h4>
                    {previewUrl && (
                        <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready to send
                        </span>
                    )}
                </div>

                <div 
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden
                        ${previewUrl 
                            ? 'border-green-500/50 bg-green-50/30' 
                            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30 cursor-pointer h-40 flex flex-col items-center justify-center'}
                    `}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    {previewUrl ? (
                        <div className="relative w-full h-full p-2">
                            <img src={previewUrl} alt="Slip Preview" className="w-full h-64 object-contain rounded-xl" />
                            
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-sm hover:bg-white transition-colors border border-gray-100"
                                >
                                    <LucideImage className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={removeFile}
                                    className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full shadow-sm hover:bg-white transition-colors border border-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6">
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <LucideImage className="w-6 h-6 text-orange-500" />
                            </div>
                            <p className="text-gray-900 font-bold text-sm mb-1">Tap to upload payment slip</p>
                            <p className="text-gray-400 text-xs">Supports JPG, PNG</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-40">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={handleSubmit}
                    disabled={!selectedFile || isSubmitting}
                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex justify-center items-center"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Verifying...
                        </>
                    ) : (
                        "Confirm Payment"
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};