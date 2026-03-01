export type TermType = 'x' | '1' | '-x' | '-1';

export interface EquationSide {
  x: number;
  c: number;
}

export interface EquationProblem {
  left: EquationSide;
  right: EquationSide;
  xValue: number; // The hidden value of x that makes the equation true
}

export interface PanContent {
  posX: number;
  pos1: number;
  negX: number;
  neg1: number;
}

export interface DragState {
  isDragging: boolean;
  type: TermType | null;
  origin: 'bin' | 'left-pan' | 'right-pan';
  x: number;
  y: number;
}
