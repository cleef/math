import React from 'react';
import { TermType } from '../types';

interface ItemVisualProps {
  type: TermType;
  className?: string;
}

export const ItemVisual: React.FC<ItemVisualProps> = ({ type, className = '' }) => {
  const isNegative = type.startsWith('-');
  const isVariable = type.includes('x');

  if (isNegative) {
    // Red Balloon
    return (
      <div className={`flex flex-col items-center justify-end ${className}`}>
        <div className={`relative flex items-center justify-center font-bold text-white shadow-sm
          ${isVariable ? 'w-12 h-14 rounded-[50%]' : 'w-8 h-10 rounded-[50%]'} 
          bg-red-500 border border-red-600`}
        >
          {/* Shine effect */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-white opacity-40 rounded-full"></div>
          <span className="select-none z-10">{isVariable ? '-x' : '-1'}</span>
          
          {/* Balloon knot */}
          <div className="absolute -bottom-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        {/* String */}
        <div className="w-0.5 h-8 bg-gray-400 opacity-70"></div>
      </div>
    );
  }

  // Positive Blue Block
  return (
    <div className={`flex items-center justify-center font-bold text-white shadow-md border border-blue-600 rounded-sm
      ${isVariable ? 'w-12 h-12 bg-blue-500' : 'w-8 h-8 bg-blue-400'} 
      ${className}`}
    >
      <span className="select-none">{isVariable ? 'x' : '1'}</span>
    </div>
  );
};
