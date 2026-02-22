import { useState, useRef, useCallback, useEffect } from 'react';

interface PatternLockProps {
  onSuccess: () => void;
}

// The correct pattern: define as node indices (0-8) in order
// Default pattern: L-shape (top-left down then right) → 0,3,6,7,8
const CORRECT_PATTERN = [0, 3, 6, 7, 8];

const NODE_POSITIONS = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
];

const PatternLock = ({ onSuccess }: PatternLockProps) => {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const SIZE = 280;
  const PADDING = 50;
  const GAP = (SIZE - PADDING * 2) / 2;

  const getNodeCenter = (index: number) => {
    const { row, col } = NODE_POSITIONS[index];
    return {
      x: PADDING + col * GAP,
      y: PADDING + row * GAP,
    };
  };

  const getNodeFromPoint = (x: number, y: number): number | null => {
    for (let i = 0; i < 9; i++) {
      const center = getNodeCenter(i);
      const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
      if (dist < 28) return i;
    }
    return null;
  };

  const getSVGPoint = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * SIZE,
      y: ((clientY - rect.top) / rect.height) * SIZE,
    };
  }, [SIZE]);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setError(false);
    setSuccess(false);
    const pt = getSVGPoint(e);
    if (!pt) return;
    const node = getNodeFromPoint(pt.x, pt.y);
    if (node !== null) {
      setIsDrawing(true);
      setSelectedNodes([node]);
      setCurrentPos(pt);
    }
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pt = getSVGPoint(e);
    if (!pt) return;
    setCurrentPos(pt);
    const node = getNodeFromPoint(pt.x, pt.y);
    if (node !== null && !selectedNodes.includes(node)) {
      setSelectedNodes(prev => [...prev, node]);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentPos(null);

    if (selectedNodes.length < 3) {
      setError(true);
      setTimeout(() => { setSelectedNodes([]); setError(false); }, 600);
      return;
    }

    const isCorrect =
      selectedNodes.length === CORRECT_PATTERN.length &&
      selectedNodes.every((n, i) => n === CORRECT_PATTERN[i]);

    if (isCorrect) {
      setSuccess(true);
      setTimeout(() => onSuccess(), 400);
    } else {
      setError(true);
      setTimeout(() => { setSelectedNodes([]); setError(false); }, 600);
    }
  };

  // Build the path lines
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < selectedNodes.length; i++) {
    const from = getNodeCenter(selectedNodes[i - 1]);
    const to = getNodeCenter(selectedNodes[i]);
    lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });
  }

  const lineColor = error
    ? 'hsl(0, 72%, 51%)'
    : success
      ? 'hsl(152, 60%, 42%)'
      : 'hsl(var(--primary))';

  const nodeStroke = error
    ? 'hsl(0, 72%, 51%)'
    : success
      ? 'hsl(152, 60%, 42%)'
      : 'hsl(var(--primary))';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">A/L Study Tracker</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Draw your pattern to unlock
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="touch-none select-none cursor-pointer"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Lines between selected nodes */}
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={lineColor}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}

          {/* Active drawing line */}
          {isDrawing && currentPos && selectedNodes.length > 0 && (
            <line
              x1={getNodeCenter(selectedNodes[selectedNodes.length - 1]).x}
              y1={getNodeCenter(selectedNodes[selectedNodes.length - 1]).y}
              x2={currentPos.x}
              y2={currentPos.y}
              stroke={lineColor}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.5}
            />
          )}

          {/* Nodes */}
          {NODE_POSITIONS.map((_, i) => {
            const center = getNodeCenter(i);
            const isSelected = selectedNodes.includes(i);
            return (
              <g key={i}>
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={22}
                  fill="transparent"
                  stroke={isSelected ? nodeStroke : 'hsl(var(--border))'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                {isSelected && (
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={8}
                    fill={nodeStroke}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {error && (
          <p className="text-center text-sm text-destructive mt-3 animate-fade-in">
            Wrong pattern. Try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default PatternLock;
