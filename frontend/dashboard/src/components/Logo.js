import React from 'react';
import { Zap } from 'lucide-react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className={`${sizeClasses[size]} bg-primary-600 rounded-lg flex items-center justify-center ${className}`}>
      {/* Placeholder for actual logo - currently using Zap icon */}
      <Zap className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

export default Logo;