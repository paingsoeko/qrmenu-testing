import React, { useEffect, useState, useMemo } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { LocationCard } from './LocationCard';
import { ErrorDisplay } from './ErrorDisplay';
import { fetchLocations } from '../services/api';
import { LocationData } from '../types';

interface LocationSelectionProps {
  onSelect: (location: LocationData) => void;
}

export const LocationSelection: React.FC<LocationSelectionProps> = ({ onSelect }) => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || "Unable to load locations. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [locations, searchTerm]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full">
      {/* Search Header - Sticky */}
      <div className="sticky top-16 z-30 px-4 py-4 glass-panel border-b border-gray-200/50">
        <div className="max-w-2xl mx-auto relative">
           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
           <input
             type="text"
             className="block w-full pl-12 pr-4 py-3 bg-gray-100/50 border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-base"
             placeholder="Search locations..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Intro Text (only show if not searching) */}
        {!searchTerm && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
            <p className="text-gray-500 mt-1">Select a location to order.</p>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Locating restaurants...</p>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} onRetry={loadData} />
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No locations found</h3>
            <p className="text-gray-500">We couldn't find "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full font-medium"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredLocations.map((location, index) => (
              <LocationCard 
                key={location.id} 
                location={location} 
                onSelect={onSelect}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};