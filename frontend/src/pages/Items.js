import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

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

    // Clean-up to avoid memory leak when component unmounts
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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!items.length) {
    return <p>No items found.</p>;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search items..."
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            <Link to={'/items/' + item.id}>{item.name}</Link>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={handlePrevPage} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;