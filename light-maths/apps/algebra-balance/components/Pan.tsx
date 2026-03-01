import React from 'react';
import { PanContent, TermType } from '../types';
import { ItemVisual } from './ItemVisual';

interface PanProps {
  content: PanContent;
  onMouseDownItem: (e: React.MouseEvent, type: TermType) => void;
}

export const Pan: React.FC<PanProps> = ({ content, onMouseDownItem }) => {
  const canceledStyle = 'opacity-35 grayscale saturate-50';
  const canceledXCount = Math.min(content.posX, content.negX);
  const canceled1Count = Math.min(content.pos1, content.neg1);

  const renderGroup = (count: number, type: TermType, canceledCount = 0) => {
    return Array.from({ length: count }).map((_, i) => (
      <div 
        key={`${type}-${i}`} 
        className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
        onMouseDown={(e) => onMouseDownItem(e, type)}
      >
        <ItemVisual type={type} className={i < canceledCount ? canceledStyle : ''} />
      </div>
    ));
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* The Pan Itself */}
      <div className="w-48 h-4 bg-amber-200 border-2 border-amber-700 rounded-sm shadow-sm relative z-10">
        {/* Pan visual depth */}
        <div className="absolute top-full left-4 right-4 h-2 bg-amber-300 border-l-2 border-r-2 border-b-2 border-amber-700 rounded-b-lg opacity-80"></div>
      </div>

      {/* Positive values sit on the pan. */}
      <div className="absolute bottom-full mb-0 w-full flex justify-center items-end pointer-events-none">
         <div className="flex gap-2 items-end pointer-events-auto flex-wrap justify-center max-w-[150px]">
            {renderGroup(content.posX, 'x', canceledXCount)}
            {renderGroup(content.pos1, '1', canceled1Count)}
         </div>
      </div>
    </div>
  );
};
