import React from 'react';
import './SkeletonCard.css';

function SkeletonCard({ count = 1, type = 'grid' }) {
  return (
    <div className={`skeleton-container ${type === 'list' ? 'skeleton-list' : 'skeleton-grid'}`}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-info">
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-subtitle"></div>
              </div>
            </div>
        ))}
    </div>
  );
}

export default SkeletonCard;
