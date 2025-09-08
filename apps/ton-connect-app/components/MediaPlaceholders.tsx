"use client";

import { useCallback } from 'react';

const fallback = '/media-placeholder.svg';

export default function MediaPlaceholders() {
  const onError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.src.endsWith('media-placeholder.svg')) return;
    el.src = fallback;
  }, []);

  return (
    <div>
      <div className="media-hero">
        <img src="/hero.jpg" alt="Espacio para imagen principal" onError={onError} />
      </div>
      <div className="media-grid">
        <div className="media-item">
          <img src="/gif1.gif" alt="Espacio para GIF 1" onError={onError} />
        </div>
        <div className="media-item">
          <img src="/gif2.gif" alt="Espacio para GIF 2" onError={onError} />
        </div>
        <div className="media-item">
          <img src="/image1.jpg" alt="Espacio para imagen 1" onError={onError} />
        </div>
      </div>
    </div>
  );
}

