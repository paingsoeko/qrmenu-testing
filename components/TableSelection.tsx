import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, Users, AlertCircle, Sofa } from 'lucide-react';
import { LocationData, Zone, Table } from '../types';
import { fetchTables, startTableSession, createCart, getSessionId } from '../services/api';
import { ErrorDisplay } from './ErrorDisplay';

interface TableSelectionProps {
  location: LocationData;
  onSelect: (table: Table) => void;
}

export const TableSelection: React.FC<TableSelectionProps> = ({ location, onSelect }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTableId, setStartingTableId] = useState<number | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTables(location.id);
      setZones(data);
      if (data.length > 0) {
        setActiveZoneId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Unable to load tables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.id]);

  const handleTableClick = async (table: Table) => {
    if (!table.is_active || startingTableId) return;

    setStartingTableId(table.id);
    try {
        const sessionData = await startTableSession(table.id);
        const clientSessionId = getSessionId();
        await createCart(clientSessionId, sessionData.session_id);
        onSelect(table);
    } catch (err: any) {
        console.error("Failed to start session:", err);
        alert(err.message || "Failed to start table session. Please try again.");
    } finally {
        setStartingTableId(null);
    }
  };

  const activeZone = useMemo(() => 
    zones.find(z => z.id === activeZoneId), 
  [zones, activeZoneId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Preparing dining areas...</p>
      </div>
    );
  }

  if (error) return <ErrorDisplay message={error} onRetry={loadData} />;

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Sofa className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No tables found</h3>
        <p className="text-gray-500">Please contact staff for assistance.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Header Info */}
      <div className="bg-white px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Select a table to start your order.</p>
      </div>

      {/* Zone Tabs (Sticky) */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="overflow-x-auto no-scrollbar px-4 py-3 flex space-x-3">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setActiveZoneId(zone.id)}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                ${activeZoneId === zone.id 
                  ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
        {activeZone && (
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-bold text-gray-800">{activeZone.name}</h2>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                {activeZone.tables.length} Tables
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {activeZone.tables.length > 0 ? (
                activeZone.tables.map((table, index) => {
                  const isStarting = startingTableId === table.id;
                  
                  return (
                    <button
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        disabled={!table.is_active || startingTableId !== null}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`
                        relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 animate-scale-in
                        ${table.is_active 
                            ? 'bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 active:scale-95' 
                            : 'bg-gray-100 border border-transparent opacity-60 cursor-not-allowed'}
                        ${isStarting ? 'ring-2 ring-orange-500 bg-orange-50' : ''}
                        `}
                    >
                        {/* Table Icon/Shape */}
                        <div className={`
                          w-14 h-14 mb-3 rounded-full flex items-center justify-center transition-colors duration-300
                          ${isStarting ? 'bg-orange-100' : 'bg-gray-50'}
                        `}>
                            {isStarting ? (
                                <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                            ) : (
                                <span className={`text-xl font-bold ${table.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {table.display_name.replace(/\D/g, '') || table.id}
                                </span>
                            )}
                        </div>
                        
                        <div className="text-center w-full">
                           <span className={`block text-xs font-medium truncate ${table.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
                               {table.display_name}
                           </span>
                           <div className="flex items-center justify-center space-x-1 mt-1">
                               <Users className="w-3 h-3 text-gray-300" />
                               <span className="text-[10px] text-gray-400">{table.seats}</span>
                           </div>
                        </div>

                        {/* Status Indicator Dot */}
                        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${table.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center text-center text-gray-400">
                  <Sofa className="w-12 h-12 mb-3 opacity-20" />
                  <p>No tables configured in this zone.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};