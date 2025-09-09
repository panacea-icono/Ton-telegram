"use client";

import { useCallback } from 'react';

const fallback = '/media-placeholder.svg';
const heroFallback = '/hero-placeholder.svg';
const gifFallback = '/gif-placeholder.svg';

export default function MediaPlaceholders() {
  const onError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    
    // Don't change if already showing a fallback
    if (el.src.endsWith('-placeholder.svg')) return;
    
    // Use appropriate fallback based on content type
    if (el.alt.includes('principal') || el.alt.includes('hero')) {
      el.src = heroFallback;
    } else if (el.alt.includes('GIF')) {
      el.src = gifFallback;
    } else {
      el.src = fallback;
    }
  }, []);

  const onVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // Hide video and show placeholder when it fails to load
    video.style.display = 'none';
    const placeholder = video.parentElement?.querySelector('.video-placeholder');
    if (placeholder) {
      (placeholder as HTMLElement).style.display = 'flex';
    }
  }, []);

  return (
    <div>
      <div className="media-hero">
        <img src="/hero.jpg" alt="Espacio para imagen principal - Hero" onError={onError} />
      </div>
      <div className="media-grid">
        <div className="media-item">
          <img src="/gift1.gif" alt="Espacio para GIF 1 - Regalo animado" onError={onError} />
        </div>
        <div className="media-item">
          <img src="/gift2.gif" alt="Espacio para GIF 2 - Regalo animado" onError={onError} />
        </div>
        <div className="media-item">
          <video 
            src="/video-logo.mp4" 
            autoPlay 
            loop 
            muted 
            onError={onVideoError}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div 
            className="video-placeholder" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              background: '#f3f4f6',
              border: '2px dashed #d1d5db',
              borderRadius: '12px'
            }}
          >
            <img src={fallback} alt="Video Logo - Logo animado" style={{ maxWidth: '80%', maxHeight: '80%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

