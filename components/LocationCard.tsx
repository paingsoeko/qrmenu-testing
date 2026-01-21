import React from 'react';
import { MapPin, ChevronRight, Timer, Store, Star } from 'lucide-react';
import { LocationData } from '../types';

interface LocationCardProps {
  location: LocationData;
  onSelect: (location: LocationData) => void;
  index?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onSelect, index = 0 }) => {
  return (
    <button 
      onClick={() => onSelect(location)}
      className="w-full text-left group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 transform active:scale-[0.99] animate-fade-in-up flex flex-col h-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex justify-between items-start mb-4 w-full">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300 shadow-sm">
           <Store className="w-7 h-7" />
        </div>
        <div className="flex flex-col items-end">
             <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Open</span>
             </div>
        </div>
      </div>

      <div className="mb-4 flex-1">
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-orange-600 transition-colors">{location.name}</h3>
        <div className="flex items-start text-gray-500 text-sm leading-snug">
           <MapPin className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
           <span className="line-clamp-2">{location.address || "Address details unavailable"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 w-full mt-auto">
         <div className="flex items-center space-x-3 text-xs font-medium text-gray-400">
            <div className="flex items-center">
               <Timer className="w-3.5 h-3.5 mr-1 text-orange-400" />
               <span>15-25 min</span>
            </div>
            <div className="flex items-center">
               <Star className="w-3.5 h-3.5 mr-1 text-yellow-400" />
               <span>4.8</span>
            </div>
         </div>
         
         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
         </div>
      </div>
    </button>
  );
};