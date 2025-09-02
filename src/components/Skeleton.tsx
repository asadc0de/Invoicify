import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-800 rounded-lg ${className}`}></div>
);

export const SkeletonText: React.FC<{ width?: string; className?: string }> = ({ width = '100%', className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} style={{ width, height: '1.2em' }}></div>
);

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <div className={`animate-pulse bg-gray-800 rounded-full ${className}`} style={{ width: size, height: size }}></div>
);

export const SkeletonSection: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 ${className}`}>
    <SkeletonText width="60%" className="mb-4" />
    <SkeletonBox className="h-8 mb-2" />
    <SkeletonBox className="h-8 mb-2" />
    <SkeletonBox className="h-8 mb-2" />
  </div>
);
