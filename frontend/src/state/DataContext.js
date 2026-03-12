import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async ({ page = 1, q = '', limit = 20, signal } = {}) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (q) {
      params.set('q', q);
    }

    const res = await fetch(`/api/items?${params.toString()}`, { signal });

    if (!res.ok) {
      throw new Error('Failed to fetch items');
    }

    const json = await res.json();
    setItems(json.items || []);

    // Return pagination metadata so callers can manage UI state
    return {
      total: json.total,
      page: json.page,
      totalPages: json.totalPages,
      pageSize: json.pageSize,
    };
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);