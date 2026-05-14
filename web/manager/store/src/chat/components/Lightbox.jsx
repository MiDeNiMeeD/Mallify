import React, { useEffect } from 'react';

export const Lightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="mc-lightbox"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <button
        type="button"
        className="mc-lightbox-close"
        onClick={onClose}
        title="Close (Esc)"
      >
        ×
      </button>
      <a
        className="mc-lightbox-open"
        href={src}
        target="_blank"
        rel="noreferrer"
        title="Open in new tab"
        onClick={(e) => e.stopPropagation()}
      >
        ↗
      </a>
      <img src={src} alt={alt || ''} className="mc-lightbox-img" />
    </div>
  );
};
