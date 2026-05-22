import React, { useEffect, useState } from 'react';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

const colorFor = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // Monochrome palette: black + gray shades only.
  const palette = [
    '#111827',
    '#1F2937',
    '#374151',
    '#4B5563',
    '#6B7280',
    '#9CA3AF',
  ];
  return palette[h % palette.length];
};

export const Avatar = ({ src, name, id, size = 40, online, className = '' }) => {
  const bg = colorFor(id || name || 'x');
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = src && !errored;

  return (
    <span className={`mc-avatar ${className}`} style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={src}
          alt={name || ''}
          className="mc-avatar-img"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="mc-avatar-initials" style={{ background: bg }}>
          {initials(name || '')}
        </span>
      )}
      {online === true && <span className="mc-avatar-dot mc-avatar-dot-online" />}
      {online === false && <span className="mc-avatar-dot mc-avatar-dot-offline" />}
    </span>
  );
};
