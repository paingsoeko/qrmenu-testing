import React from 'react';
import { UtensilsCrossed, ChevronLeft, Clock } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onHistory?: () => void;
  showHistory?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "GourmetQR", 
  subtitle = "Select a Location",
  onBack,
  onHistory,
  showHistory = false
}) => {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack ? (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="bg-orange-600 p-2 rounded-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
          )}
          
          <div className="flex flex-col justify-center">
            <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">
              {title}
            </span>
            {subtitle && !onBack && (
              <span className="text-xs text-gray-500 font-medium hidden sm:block">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
            {showHistory && onHistory && (
                <button 
                    onClick={onHistory}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors active:scale-95"
                    aria-label="Order History"
                >
                    <Clock className="w-6 h-6" />
                </button>
            )}
            
            {/* Progress Step Indicator (Optional visual) */}
            <div className="hidden sm:flex items-center space-x-2 ml-2">
                <div className={`h-2 w-2 rounded-full ${!onBack ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`h-2 w-2 rounded-full ${onBack ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
            </div>
        </div>
      </div>
    </header>
  );
};
