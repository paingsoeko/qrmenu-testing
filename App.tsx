import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LocationSelection } from './components/LocationSelection';
import { TableSelection } from './components/TableSelection';
import { MenuPage } from './components/MenuPage';
import { CartPage } from './components/CartPage';
import { OrderHistoryPage } from './components/OrderHistoryPage';
import { LocationData, Table } from './types';

const STORAGE_KEYS = {
  LOCATION: 'qr_menu_location',
  TABLE: 'qr_menu_table',
  VIEWING_CART: 'qr_menu_viewing_cart',
  VIEWING_HISTORY: 'qr_menu_viewing_history'
};

const App: React.FC = () => {
  // Initialize state from localStorage to persist data on reload
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse saved location", e);
      return null;
    }
  });

  const [selectedTable, setSelectedTable] = useState<Table | null>(() => {
    try {
      // Only restore table if location is also present/valid to avoid inconsistent state
      if (!localStorage.getItem(STORAGE_KEYS.LOCATION)) return null;
      
      const saved = localStorage.getItem(STORAGE_KEYS.TABLE);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse saved table", e);
      return null;
    }
  });

  const [isViewingCart, setIsViewingCart] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.VIEWING_CART) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.VIEWING_HISTORY) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persist state changes to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(selectedLocation));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem(STORAGE_KEYS.TABLE, JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem(STORAGE_KEYS.TABLE);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (isViewingCart) {
      localStorage.setItem(STORAGE_KEYS.VIEWING_CART, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.VIEWING_CART);
    }
  }, [isViewingCart]);

  useEffect(() => {
    if (isViewingHistory) {
      localStorage.setItem(STORAGE_KEYS.VIEWING_HISTORY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.VIEWING_HISTORY);
    }
  }, [isViewingHistory]);

  // Determine current view title and subtitle
  let title = "GourmetQR";
  let subtitle = "Select a Location";
  let onBack: (() => void) | undefined = undefined;
  
  // Show history button only when a table is selected (active session)
  const showHistoryButton = !!selectedTable && !isViewingCart && !isViewingHistory;

  if (isViewingCart) {
    title = "Order Summary";
    subtitle = "Review your items";
    onBack = () => setIsViewingCart(false);
  } else if (isViewingHistory) {
    title = "Order History";
    subtitle = "My past orders";
    onBack = () => setIsViewingHistory(false);
  } else if (selectedTable && selectedLocation) {
    title = "Menu";
    subtitle = `${selectedLocation.name} • ${selectedTable.display_name}`;
    onBack = () => setSelectedTable(null);
  } else if (selectedLocation) {
    title = "Select Table";
    subtitle = selectedLocation.name;
    onBack = () => setSelectedLocation(null);
  }

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    // When changing location, explicitly clear any previously selected table
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header 
        title={title} 
        subtitle={subtitle}
        onBack={onBack}
        onHistory={() => setIsViewingHistory(true)}
        showHistory={showHistoryButton}
      />

      <main className="flex-1 flex flex-col">
        {isViewingCart ? (
          <CartPage 
            onBack={() => setIsViewingCart(false)} 
            location={selectedLocation} 
          />
        ) : isViewingHistory ? (
          <OrderHistoryPage 
            onBack={() => setIsViewingHistory(false)} 
          />
        ) : selectedTable && selectedLocation ? (
          <MenuPage 
            location={selectedLocation} 
            table={selectedTable} 
            onViewCart={() => setIsViewingCart(true)}
          />
        ) : selectedLocation ? (
          <TableSelection 
            location={selectedLocation} 
            onSelect={setSelectedTable} 
          />
        ) : (
          <LocationSelection onSelect={handleLocationSelect} />
        )}
      </main>

      {/* Footer (only show on selection screens to save space on menu) */}
      {!selectedTable && !isViewingCart && !isViewingHistory && (
        <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} GourmetQR. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
