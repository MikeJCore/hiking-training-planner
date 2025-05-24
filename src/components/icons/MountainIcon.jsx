import React from 'react';

const MountainIcon = ({ className = 'h-5 w-5 text-gray-400' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 20l5-10 5 10 5-10 5 10M3 20h18" 
    />
  </svg>
);

export default MountainIcon;
