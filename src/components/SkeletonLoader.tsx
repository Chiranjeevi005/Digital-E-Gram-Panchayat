import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'avatar' | 'table' | 'list';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-xl shadow p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        );
      case 'avatar':
        return (
          <div className={`rounded-full bg-gray-200 ${className}`}>
            <div className="animate-pulse w-full h-full rounded-full"></div>
          </div>
        );
      case 'table':
        return (
          <div className={`bg-white rounded-xl shadow ${className}`}>
            <div className="animate-pulse p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/6"></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'text':
      default:
        return (
          <div className={`bg-white rounded-xl shadow p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;