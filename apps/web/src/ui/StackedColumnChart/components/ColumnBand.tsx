type ColumnBandProps = {
  maxWidth: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export function ColumnBand({ maxWidth, x = 0, y = 0, width = 0, height = 0 }: ColumnBandProps) {
  const bandWidth = Math.min(width, maxWidth);

  return (
    <rect
      x={x + (width - bandWidth) / 2}
      y={y}
      width={bandWidth}
      height={height}
      fill="var(--color-row-hover)"
    />
  );
}
