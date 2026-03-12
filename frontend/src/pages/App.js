import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <nav
          style={{
            padding: 16,
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#111827',
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Items
          </Link>
        </nav>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;