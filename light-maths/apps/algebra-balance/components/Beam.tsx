import React from 'react';
import { PanContent, TermType } from '../types';
import { Pan } from './Pan';
import { ItemVisual } from './ItemVisual';

interface BeamProps {
  leftContent: PanContent;
  rightContent: PanContent;
  rotation: number;
  onMouseDownPanItem: (side: 'left' | 'right', e: React.MouseEvent, type: TermType) => void;
  leftRef: React.RefObject<HTMLDivElement>;
  rightRef: React.RefObject<HTMLDivElement>;
  leftPositiveDropRef: React.RefObject<HTMLDivElement>;
  rightPositiveDropRef: React.RefObject<HTMLDivElement>;
  leftNegativeDropRef: React.RefObject<HTMLDivElement>;
  rightNegativeDropRef: React.RefObject<HTMLDivElement>;
}

export const Beam: React.FC<BeamProps> = ({ 
  leftContent, 
  rightContent, 
  rotation, 
  onMouseDownPanItem,
  leftRef,
  rightRef,
  leftPositiveDropRef,
  rightPositiveDropRef,
  leftNegativeDropRef,
  rightNegativeDropRef
}) => {
  const canceledStyle = 'opacity-35 grayscale saturate-50';

  const renderNegativeGroup = (count: number, type: TermType, side: 'left' | 'right', canceledCount = 0) => {
    return Array.from({ length: count }).map((_, i) => (
      <div
        key={`${side}-${type}-${i}`}
        className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
        onMouseDown={(e) => onMouseDownPanItem(side, e, type)}
      >
        <ItemVisual type={type} className={i < canceledCount ? canceledStyle : ''} />
      </div>
    ));
  };

  const leftCanceledXCount = Math.min(leftContent.posX, leftContent.negX);
  const leftCanceled1Count = Math.min(leftContent.pos1, leftContent.neg1);
  const rightCanceledXCount = Math.min(rightContent.posX, rightContent.negX);
  const rightCanceled1Count = Math.min(rightContent.pos1, rightContent.neg1);

  return (
    <div className="relative w-full max-w-4xl h-64 flex items-end justify-center mb-12">
      
      {/* Base / Fulcrum */}
      <div className="absolute bottom-0 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-amber-800 z-10"></div>
      <div className="absolute bottom-[20px] w-4 h-4 bg-amber-950 rounded-full z-20"></div>

      {/* Rotating Beam Container */}
      {/* We rotate the entire beam structure around the bottom center pivot */}
      <div 
        className="relative w-full h-full flex items-end justify-center transition-transform duration-700 ease-out origin-bottom"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* The Beam Plank */}
        <div className="w-[80%] h-6 bg-amber-600 border-2 border-amber-800 rounded-lg absolute bottom-[40px] shadow-lg flex justify-between items-center px-4">
           {/* Pivot detail */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-900 rounded-full opacity-50"></div>
        </div>

        {/* Left Pan Assembly */}
        <div className="absolute left-[10%] bottom-[40px] flex flex-col items-center" 
             style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: 'top center' }}>
           <div
             ref={leftNegativeDropRef}
             className="absolute left-1/2 -translate-x-1/2 -top-36 w-56 h-40 opacity-0 pointer-events-none"
             aria-hidden="true"
           ></div>
           <div
             ref={leftPositiveDropRef}
             className="absolute left-1/2 -translate-x-1/2 top-20 w-56 h-32 opacity-0 pointer-events-none"
             aria-hidden="true"
           ></div>
           <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pointer-events-none">
             <div className="flex gap-1 items-end pointer-events-auto">
               {renderNegativeGroup(leftContent.negX, '-x', 'left', leftCanceledXCount)}
               {renderNegativeGroup(leftContent.neg1, '-1', 'left', leftCanceled1Count)}
             </div>
           </div>
           {/* Vertical Rod */}
           <div className="w-1 h-24 bg-gray-400"></div>
           {/* The Pan */}
           <div ref={leftRef} className="w-56 h-40 flex items-end justify-center">
             <Pan 
                content={leftContent} 
                onMouseDownItem={(e, type) => onMouseDownPanItem('left', e, type)} 
             />
           </div>
        </div>

        {/* Right Pan Assembly */}
        <div className="absolute right-[10%] bottom-[40px] flex flex-col items-center"
             style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: 'top center' }}>
           <div
             ref={rightNegativeDropRef}
             className="absolute left-1/2 -translate-x-1/2 -top-36 w-56 h-40 opacity-0 pointer-events-none"
             aria-hidden="true"
           ></div>
           <div
             ref={rightPositiveDropRef}
             className="absolute left-1/2 -translate-x-1/2 top-20 w-56 h-32 opacity-0 pointer-events-none"
             aria-hidden="true"
           ></div>
           <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pointer-events-none">
             <div className="flex gap-1 items-end pointer-events-auto">
               {renderNegativeGroup(rightContent.negX, '-x', 'right', rightCanceledXCount)}
               {renderNegativeGroup(rightContent.neg1, '-1', 'right', rightCanceled1Count)}
             </div>
           </div>
           {/* Vertical Rod */}
           <div className="w-1 h-24 bg-gray-400"></div>
           {/* The Pan */}
           <div ref={rightRef} className="w-56 h-40 flex items-end justify-center">
             <Pan 
                content={rightContent} 
                onMouseDownItem={(e, type) => onMouseDownPanItem('right', e, type)} 
             />
           </div>
        </div>

      </div>
    </div>
  );
};
