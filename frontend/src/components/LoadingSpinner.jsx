import React from 'react';

export default function LoadingSpinner({ label = 'Loading…', size = 20 }) {
  return (
    <div className="loading-spinner" role="status" aria-label={label}>
      <div className="spinner-ring" style={{ width: size, height: size }} />
      <span className="spinner-label">{label}</span>
    </div>
  );
}
