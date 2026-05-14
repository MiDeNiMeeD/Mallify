import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageLoader.css';

const PageLoader = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader when route changes
    setIsLoading(true);
    
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location]);

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="page-loader-spinner"></div>
        <div className="page-loader-text">Loading...</div>
      </div>
    );
  }

  return children;
};

export default PageLoader;