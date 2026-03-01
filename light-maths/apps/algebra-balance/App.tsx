import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateProblem, formatEquation } from './equationUtils';
import { EquationProblem, PanContent, TermType, DragState } from './types';
import { Beam } from './components/Beam';
import { ItemVisual } from './components/ItemVisual';
import { Trash2, RefreshCcw } from 'lucide-react';

const CJK_UI_FONT_STACK = '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", "Roboto", "Droid Sans Fallback", "WenQuanYi Micro Hei", sans-serif';

const INITIAL_PAN: PanContent = { posX: 0, pos1: 0, negX: 0, neg1: 0 };
type EditableProblemFields = {
  leftX: string;
  leftC: string;
  rightX: string;
  rightC: string;
  xValue: string;
};

const App: React.FC = () => {
  // Game State
  const [problem, setProblem] = useState<EquationProblem | null>(null);
  const [leftPan, setLeftPan] = useState<PanContent>(INITIAL_PAN);
  const [rightPan, setRightPan] = useState<PanContent>(INITIAL_PAN);
  const [beamRotation, setBeamRotation] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFields, setEditFields] = useState<EditableProblemFields>({
    leftX: '0',
    leftC: '0',
    rightX: '0',
    rightC: '0',
    xValue: '1',
  });

  // Drag State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    type: null,
    origin: 'bin',
    x: 0,
    y: 0,
  });

  // Refs for drop zones
  const leftPanRef = useRef<HTMLDivElement>(null);
  const rightPanRef = useRef<HTMLDivElement>(null);
  const leftPositiveDropRef = useRef<HTMLDivElement>(null);
  const rightPositiveDropRef = useRef<HTMLDivElement>(null);
  const leftNegativeDropRef = useRef<HTMLDivElement>(null);
  const rightNegativeDropRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    handleNewProblem();
  }, []);

  // Update Beam Physics
  useEffect(() => {
    if (!problem) return;

    const calculateWeight = (pan: PanContent) => {
      // Logic:
      // Weight of '1' = 1
      // Weight of '-1' = -1 (lifts up)
      // Weight of 'x' = problem.xValue
      // Weight of '-x' = -problem.xValue (lifts up)
      return (
        (pan.posX * problem.xValue) +
        (pan.pos1 * 1) +
        (pan.negX * -problem.xValue) +
        (pan.neg1 * -1)
      );
    };

    const leftWeight = calculateWeight(leftPan);
    const rightWeight = calculateWeight(rightPan);
    const diff = rightWeight - leftWeight;

    // Calculate rotation angle
    // Clamp between -20 and 20 degrees
    const maxAngle = 15;
    const sensitivity = 2; // Degrees per unit of weight difference
    const targetRotation = Math.max(-maxAngle, Math.min(maxAngle, diff * sensitivity));

    setBeamRotation(targetRotation);

  }, [leftPan, rightPan, problem]);

  const handleNewProblem = () => {
    const newProblem = generateProblem();
    setProblem(newProblem);
    setLeftPan(INITIAL_PAN);
    setRightPan(INITIAL_PAN);
    setEditFields({
      leftX: String(newProblem.left.x),
      leftC: String(newProblem.left.c),
      rightX: String(newProblem.right.x),
      rightC: String(newProblem.right.c),
      xValue: String(newProblem.xValue),
    });
    setEditError('');
    setIsEditorOpen(false);
  };

  const openEditor = () => {
    if (!problem) return;
    setEditFields({
      leftX: String(problem.left.x),
      leftC: String(problem.left.c),
      rightX: String(problem.right.x),
      rightC: String(problem.right.c),
      xValue: String(problem.xValue),
    });
    setEditError('');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditError('');
    setIsEditorOpen(false);
  };

  const applyEditedProblem = () => {
    const parseInteger = (raw: string) => {
      if (raw.trim() === '') return null;
      const num = Number(raw);
      if (!Number.isInteger(num)) return null;
      return num;
    };

    const leftX = parseInteger(editFields.leftX);
    const leftC = parseInteger(editFields.leftC);
    const rightX = parseInteger(editFields.rightX);
    const rightC = parseInteger(editFields.rightC);
    const xValue = parseInteger(editFields.xValue);

    if ([leftX, leftC, rightX, rightC, xValue].some(v => v === null)) {
      setEditError('Please enter integers only.');
      return;
    }

    const leftValue = (leftX as number) * (xValue as number) + (leftC as number);
    const rightValue = (rightX as number) * (xValue as number) + (rightC as number);
    if (leftValue !== rightValue) {
      setEditError('This x value does not satisfy the equation.');
      return;
    }

    setProblem({
      left: { x: leftX as number, c: leftC as number },
      right: { x: rightX as number, c: rightC as number },
      xValue: xValue as number,
    });
    setLeftPan(INITIAL_PAN);
    setRightPan(INITIAL_PAN);
    setEditError('');
    setIsEditorOpen(false);
  };

  const clearPans = () => {
    setLeftPan(INITIAL_PAN);
    setRightPan(INITIAL_PAN);
  };

  const updatePan = (side: 'left' | 'right', type: TermType, delta: number) => {
    const setter = side === 'left' ? setLeftPan : setRightPan;
    setter(prev => {
      const key = type === 'x' ? 'posX' 
                : type === '1' ? 'pos1'
                : type === '-x' ? 'negX'
                : 'neg1';
      return { ...prev, [key]: Math.max(0, prev[key] + delta) };
    });
  };

  // --- Drag & Drop Handlers ---

  const handleMouseDownBin = (e: React.MouseEvent, type: TermType) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      type,
      origin: 'bin',
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseDownPanItem = (side: 'left' | 'right', e: React.MouseEvent, type: TermType) => {
    e.stopPropagation(); // Prevent pan drag if any
    e.preventDefault();
    
    // Remove one item from the source pan immediately (visual feedback)
    // We will add it back if dropped invalidly, or keep it removed if dropped in trash/other pan
    // Actually, safer pattern: Don't remove yet. Just set dragging. 
    // BUT visual feedback is better if it moves. 
    // Let's decrement immediately for "move" effect.
    updatePan(side, type, -1);

    setDragState({
      isDragging: true,
      type,
      origin: side === 'left' ? 'left-pan' : 'right-pan',
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging) {
      setDragState(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  }, [dragState.isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.type) return;

    const isInDropZone = (
      rect: DOMRect | undefined,
      pointX: number,
      pointY: number,
      padding = { top: 0, right: 0, bottom: 0, left: 0 }
    ) => {
      if (!rect) return false;
      return (
        pointX >= rect.left - padding.left &&
        pointX <= rect.right + padding.right &&
        pointY >= rect.top - padding.top &&
        pointY <= rect.bottom + padding.bottom
      );
    };

    // Hit Testing
    const leftPositiveDropRect = leftPositiveDropRef.current?.getBoundingClientRect();
    const rightPositiveDropRect = rightPositiveDropRef.current?.getBoundingClientRect();
    const leftNegativeDropRect = leftNegativeDropRef.current?.getBoundingClientRect();
    const rightNegativeDropRect = rightNegativeDropRef.current?.getBoundingClientRect();

    const x = e.clientX;
    const y = e.clientY;
    const isNegativeType = dragState.type.startsWith('-');

    let handled = false;

    // Hidden rectangular zones for hanging negatives.
    if (isNegativeType && isInDropZone(leftNegativeDropRect, x, y, { top: 20, right: 20, bottom: 20, left: 20 })) {
      updatePan('left', dragState.type, 1);
      handled = true;
    }
    else if (isNegativeType && isInDropZone(rightNegativeDropRect, x, y, { top: 20, right: 20, bottom: 20, left: 20 })) {
      updatePan('right', dragState.type, 1);
      handled = true;
    }
    // Hidden rectangular zones for positives on pans.
    else if (!isNegativeType && isInDropZone(leftPositiveDropRect, x, y, { top: 20, right: 20, bottom: 20, left: 20 })) {
      updatePan('left', dragState.type, 1);
      handled = true;
    }
    else if (!isNegativeType && isInDropZone(rightPositiveDropRect, x, y, { top: 20, right: 20, bottom: 20, left: 20 })) {
      updatePan('right', dragState.type, 1);
      handled = true;
    }

    // If not handled, item is considered taken out (removed) when dragging from a pan.
    // For bin-origin drags, dropping outside zones simply does not add the item.

    setDragState({ isDragging: false, type: null, origin: 'bin', x: 0, y: 0 });

  }, [dragState]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col select-none overflow-hidden"
      style={{ fontFamily: CJK_UI_FONT_STACK }}
    >
      
      {/* --- Drag Overlay --- */}
      {dragState.isDragging && dragState.type && (
        <div 
          className="fixed pointer-events-none z-50 opacity-80"
          style={{ left: dragState.x, top: dragState.y, transform: 'translate(-50%, -50%)' }}
        >
          <ItemVisual type={dragState.type} />
        </div>
      )}

      {/* --- Header & Equation --- */}
      <header className="bg-white p-4 shadow-sm text-center">
        <h1 className="text-xl text-gray-500 mb-2 font-bold tracking-wide" style={{ fontFamily: CJK_UI_FONT_STACK }}>
          Algebra Balance Beam
        </h1>
        <div className="text-4xl font-serif text-slate-800 tracking-wider">
          {problem ? formatEquation(problem) : 'Loading...'}
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Drag items to pans to represent the equation.
        </p>
        <div className="mt-3">
          {!isEditorOpen ? (
            <button
              onClick={openEditor}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Edit Problem
            </button>
          ) : (
            <button
              onClick={closeEditor}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
        {isEditorOpen && (
          <div className="mt-4 mx-auto max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <label className="text-left">
                <span className="block text-xs text-slate-500 mb-1">Left x</span>
                <input
                  type="number"
                  value={editFields.leftX}
                  onChange={(e) => setEditFields(prev => ({ ...prev, leftX: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-left">
                <span className="block text-xs text-slate-500 mb-1">Left c</span>
                <input
                  type="number"
                  value={editFields.leftC}
                  onChange={(e) => setEditFields(prev => ({ ...prev, leftC: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-left">
                <span className="block text-xs text-slate-500 mb-1">Right x</span>
                <input
                  type="number"
                  value={editFields.rightX}
                  onChange={(e) => setEditFields(prev => ({ ...prev, rightX: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-left">
                <span className="block text-xs text-slate-500 mb-1">Right c</span>
                <input
                  type="number"
                  value={editFields.rightC}
                  onChange={(e) => setEditFields(prev => ({ ...prev, rightC: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="text-left">
                <span className="block text-xs text-slate-500 mb-1">x value</span>
                <input
                  type="number"
                  value={editFields.xValue}
                  onChange={(e) => setEditFields(prev => ({ ...prev, xValue: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
            {editError && (
              <div className="mt-3 text-sm text-red-600">{editError}</div>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={closeEditor}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyEditedProblem}
                className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </header>

      {/* --- Main Workspace --- */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4">
        
        {/* --- Bins (Source of Items) --- */}
        <div className="flex gap-6 p-4 bg-slate-200 rounded-xl shadow-inner mb-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-red-500 uppercase">Negatives</span>
            <div className="flex gap-4">
               <div 
                 className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                 onMouseDown={(e) => handleMouseDownBin(e, '-1')}
               >
                 <ItemVisual type="-1" />
               </div>
               <div 
                 className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                 onMouseDown={(e) => handleMouseDownBin(e, '-x')}
               >
                 <ItemVisual type="-x" />
               </div>
            </div>
          </div>
          
          <div className="w-px bg-slate-400"></div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-blue-500 uppercase">Positives</span>
            <div className="flex gap-4 items-center h-full">
               <div 
                 className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                 onMouseDown={(e) => handleMouseDownBin(e, '1')}
               >
                 <ItemVisual type="1" />
               </div>
               <div 
                 className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                 onMouseDown={(e) => handleMouseDownBin(e, 'x')}
               >
                 <ItemVisual type="x" />
               </div>
            </div>
          </div>
        </div>

        {/* --- Balance Beam Area --- */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          <Beam 
            leftContent={leftPan}
            rightContent={rightPan}
            rotation={beamRotation}
            onMouseDownPanItem={handleMouseDownPanItem}
            leftRef={leftPanRef}
            rightRef={rightPanRef}
            leftPositiveDropRef={leftPositiveDropRef}
            rightPositiveDropRef={rightPositiveDropRef}
            leftNegativeDropRef={leftNegativeDropRef}
            rightNegativeDropRef={rightNegativeDropRef}
          />

          {/* Balance Indicator/Feedback */}
          {Math.abs(beamRotation) < 0.5 && (
             <div className="absolute top-10 bg-green-100 text-green-700 px-4 py-2 rounded-full border border-green-300 font-bold animate-bounce">
               Balanced!
             </div>
          )}
        </div>

        {/* --- Controls Footer --- */}
        <div className="w-full max-w-4xl flex justify-between items-center mt-auto pb-6 px-8">
           <button 
             onClick={clearPans}
             className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold shadow-sm"
           >
             <Trash2 size={20} /> Clear Pans
           </button>

           <button 
             onClick={handleNewProblem}
             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
           >
             <RefreshCcw size={20} /> New Problem
           </button>
        </div>
      </main>

    </div>
  );
};

export default App;
