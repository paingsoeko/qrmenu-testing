import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency } from '../types';
import { fetchDefaultCurrency } from '../services/api';

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (amount: number | string) => string;
}

const defaultCurrency: Currency = {
  id: 0,
  business_id: 0,
  currency_type: 'fiat',
  name: 'US Dollar',
  country: 'United States',
  code: 'USD',
  symbol: '$',
  thoundsand_seprator: ',',
  decimal_separator: '.'
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  formatPrice: (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('qr_menu_currency');
      return saved ? JSON.parse(saved) : defaultCurrency;
    } catch {
      return defaultCurrency;
    }
  });

  useEffect(() => {
    const initCurrency = async () => {
      try {
        const data = await fetchDefaultCurrency();
        setCurrency(data);
        localStorage.setItem('qr_menu_currency', JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch currency:", err);
      }
    };
    initCurrency();
  }, []);

  const formatPrice = (amount: number | string) => {
    const num = Number(amount);
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
        }).format(num);
    } catch (e) {
        // Fallback if code is invalid
        return `${currency.symbol}${num.toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);