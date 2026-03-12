import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

const ROW_HEIGHT = 44;
const MAX_LIST_HEIGHT = 480;

function SkeletonRow() {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background:
          'linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)',
        backgroundSize: '200% 100%',
        animation: 'items-skeleton-loading 1.2s ease-in-out infinite',
        marginBottom: 8,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          height: 12,
          width: '60%',
          borderRadius: 999,
          backgroundColor: 'rgba(148, 163, 184, 0.6)',
        }}
      />
    </div>
  );
}

function Items() {
  const { items, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchItems({ page, q: query, signal: controller.signal })
      .then(meta => {
        if (meta && typeof meta.totalPages === 'number') {
          setTotalPages(meta.totalPages);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load items');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [fetchItems, page, query]);

  const handleSearchChange = event => {
    setPage(1);
    setQuery(event.target.value);
  };

  const handlePrevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  if (isLoading && !items.length) {
    return (
      <main
        style={{ padding: 16 }}
        aria-busy="true"
        aria-label="Loading items"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main style={{ padding: 16 }}>
        <p role="status">No items found. Try adjusting your search.</p>
      </main>
    );
  }

  const listHeight = Math.min(
    MAX_LIST_HEIGHT,
    Math.max(ROW_HEIGHT, items.length * ROW_HEIGHT)
  );

  const Row = ({ index, style }) => {
    const item = items[index];

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
        }}
      >
        <Link
          to={'/items/' + item.id}
          style={{
            textDecoration: 'none',
            color: '#1d4ed8',
            fontSize: 14,
          }}
        >
          {item.name}
        </Link>
      </div>
    );
  };

  return (
    <main
      style={{
        padding: 16,
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Items</h1>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search items…"
            aria-label="Search items"
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 999,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
        </div>
      </header>

      <section
        aria-label="Items list"
        style={{
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <List
          height={listHeight}
          itemCount={items.length}
          itemSize={ROW_HEIGHT}
          width="100%"
        >
          {Row}
        </List>
      </section>

      <footer
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #d1d5db',
              backgroundColor: page <= 1 ? '#e5e7eb' : '#ffffff',
              cursor: page <= 1 ? 'default' : 'pointer',
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #d1d5db',
              backgroundColor: page >= totalPages ? '#e5e7eb' : '#ffffff',
              cursor: page >= totalPages ? 'default' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
        <span
          style={{
            fontSize: 14,
            color: '#4b5563',
          }}
        >
          Page {page} of {totalPages}
        </span>
      </footer>

      <style>
        {`@keyframes items-skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`}
      </style>
    </main>
  );
}

export default Items;