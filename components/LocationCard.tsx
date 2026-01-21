import React from 'react';
import { MapPin, Phone, ChevronRight, Timer } from 'lucide-react';
import { LocationData } from '../types';

interface LocationCardProps {
  location: LocationData;
  onSelect: (location: LocationData) => void;
  index?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onSelect, index = 0 }) => {
  const imageUrl = location.image || `https://picsum.photos/seed/${location.id}/600/400`;

  return (
    <div 
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] cursor-pointer border border-gray-100 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onSelect(location)}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-2xl font-bold truncate leading-tight mb-1">{location.name}</h3>
          <div className="flex items-center text-white/90 text-sm">
             <MapPin className="w-4 h-4 mr-1.5 text-orange-400" />
             <span className="truncate">{location.address || "Address not available"}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          Open Now
        </div>
      </div>

      {/* Action Strip */}
      <div className="p-4 flex justify-between items-center bg-white">
         <div className="flex space-x-4 text-gray-500">
            {location.phone && (
               <div className="flex items-center text-xs font-medium bg-gray-50 px-2 py-1.5 rounded-lg">
                 <Phone className="w-3.5 h-3.5 mr-1.5" />
                 Call
               </div>
            )}
            <div className="flex items-center text-xs font-medium bg-gray-50 px-2 py-1.5 rounded-lg">
               <Timer className="w-3.5 h-3.5 mr-1.5" />
               ~ 20 min
            </div>
         </div>

         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
            <ChevronRight className="w-5 h-5" />
         </div>
      </div>
    </div>
  );
};