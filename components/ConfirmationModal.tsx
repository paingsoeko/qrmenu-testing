import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200 scale-100">
        <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
                {message}
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                    onClick={onCancel}
                    className="py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors active:scale-95"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                    Remove
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};