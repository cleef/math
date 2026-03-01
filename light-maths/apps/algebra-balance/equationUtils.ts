import { EquationProblem, EquationSide } from './types';

export const getRandomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (): EquationProblem => {
  // 1. Pick a random X value (usually small positive integer for these demos)
  const xValue = getRandomInt(1, 5);

  // 2. Generate coefficients for Left side (ax + b)
  const a = getRandomInt(-4, 4);
  const b = getRandomInt(-5, 5);

  // 3. Generate coefficient 'c' for Right side (cx + d)
  // Ensure 'a' and 'c' are different so x doesn't cancel out immediately
  let c = getRandomInt(-4, 4);
  while (c === a) {
    c = getRandomInt(-4, 4);
  }

  // 4. Calculate 'd' such that ax + b = cx + d is valid for xValue
  // ax + b = cx + d  =>  ax - cx + b = d  =>  (a-c)x + b = d
  const d = (a - c) * xValue + b;

  // Retry if d is too large (keep it visually manageable)
  if (Math.abs(d) > 8) {
    return generateProblem();
  }

  return {
    left: { x: a, c: b },
    right: { x: c, c: d },
    xValue
  };
};

export const formatEquation = (problem: EquationProblem): string => {
  const formatSide = (side: EquationSide) => {
    let parts = [];
    if (side.x !== 0) {
      if (side.x === 1) parts.push('x');
      else if (side.x === -1) parts.push('-x');
      else parts.push(`${side.x}x`);
    }
    
    if (side.c !== 0) {
      if (side.c > 0 && parts.length > 0) parts.push(`+ ${side.c}`);
      else if (side.c < 0 && parts.length > 0) parts.push(`- ${Math.abs(side.c)}`);
      else parts.push(`${side.c}`);
    } else if (parts.length === 0) {
      parts.push('0');
    }
    return parts.join(' ');
  };

  return `${formatSide(problem.left)} = ${formatSide(problem.right)}`;
};
