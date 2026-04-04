const BASE_WIDTH = 28;
const BASE_HEIGHT = 20;

export function PixelDogSprite({
  x,
  y,
  size = 18,
  facingLeft = false,
}: {
  x: number;
  y: number;
  size?: number;
  facingLeft?: boolean;
}) {
  const scale = size / BASE_WIDTH;
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const translateX = facingLeft ? x + width / 2 : x - width / 2;
  const translateY = y - height / 2;
  const dirScale = facingLeft ? -scale : scale;

  return (
    <g transform={`translate(${translateX} ${translateY}) scale(${dirScale} ${scale})`}>
      <ellipse cx={12} cy={18.2} rx={8} ry={1.8} fill="rgba(28,25,23,0.12)" />

      <path
        d="M6 10 C3 9, 2 7, 3 5"
        fill="none"
        stroke="#6B4428"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <ellipse cx={12} cy={11} rx={7.4} ry={4.8} fill="#9C6A43" />
      <circle cx={20} cy={9.2} r={5.1} fill="#9C6A43" />

      <path d="M17.2 5.6 L19.6 1.8 L21.8 5.8 Z" fill="#6B4428" />
      <ellipse cx={22.8} cy={10.8} rx={3.4} ry={2.5} fill="#F4D8B0" />
      <circle cx={24.8} cy={10.2} r={0.85} fill="#2C1A10" />
      <circle cx={20.8} cy={8.2} r={0.8} fill="#2C1A10" />

      <rect x={15.4} y={10.1} width={2.2} height={3.1} rx={0.6} fill="#D84A3A" />

      <rect x={8.2} y={13.6} width={2.1} height={4.2} rx={0.8} fill="#F4D8B0" />
      <rect x={12.4} y={13.8} width={2.1} height={4} rx={0.8} fill="#F4D8B0" />
      <rect x={18.2} y={13.6} width={2.1} height={4.2} rx={0.8} fill="#F4D8B0" />
    </g>
  );
}
