import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetch('/api/items/' + id)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(data => {
        if (isMounted) {
          setItem(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load item details.');
          // keep the user on the page but show a clear error
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (!item && !error) {
    return (
      <main style={{ padding: 16 }} aria-busy="true" aria-label="Loading item">
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              height: 20,
              width: '40%',
              marginBottom: 12,
              borderRadius: 8,
              background:
                'linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)',
              backgroundSize: '200% 100%',
              animation: 'detail-skeleton-loading 1.2s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 14,
              width: '60%',
              marginBottom: 8,
              borderRadius: 8,
              backgroundColor: '#e5e7eb',
            }}
          />
          <div
            style={{
              height: 14,
              width: '30%',
              borderRadius: 8,
              backgroundColor: '#e5e7eb',
            }}
          />
        </div>
        <style>
          {`@keyframes detail-skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }`}
        </style>
      </main>
    );
  }

  return (
    <main style={{ padding: 16 }}>
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
        }}
      >
        {error && (
          <p
            role="alert"
            style={{ color: '#b91c1c', marginTop: 0, marginBottom: 12 }}
          >
            {error}
          </p>
        )}
        {item && (
          <>
            <h1 style={{ marginTop: 0, marginBottom: 12 }}>{item.name}</h1>
            <p>
              <strong>Category:</strong> {item.category}
            </p>
            <p>
              <strong>Price:</strong> ${item.price}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default ItemDetail;