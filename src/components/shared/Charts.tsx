import { motion } from 'framer-motion';

// ── Sparkline area chart ────────────────────────────────────────────────────
export function Sparkline({ data, color, height = 40, className }: {
  data: number[]; color: string; height?: number; className?: string;
}) {
  if (data.length < 2) return <div style={{ height }} />;
  const W = 300;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    height - (v / max) * (height - 2) - 1,
  ]);
  const line  = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area  = `M0,${height} ${pts.map(([x, y]) => `L${x},${y}`).join(' ')} L${W},${height} Z`;
  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

// ── Ring gauge ──────────────────────────────────────────────────────────────
export function Ring({ value, size = 88, color, track = 'var(--border)', strokeWidth = 6, children }: {
  value: number; size?: number; color: string; track?: string;
  strokeWidth?: number; children?: React.ReactNode;
}) {
  const r     = (size - strokeWidth) / 2;
  const circ  = 2 * Math.PI * r;
  const filled = Math.min(Math.max(value / 100, 0), 1) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          animate={{ strokeDasharray: `${filled} ${circ}` }}
          initial={{ strokeDasharray: `0 ${circ}` }}
          transition={{ duration: 0.5, ease: 'easeOut' }} />
      </svg>
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  );
}

// ── Bar gauge (horizontal) ──────────────────────────────────────────────────
export function BarGauge({ value, color, height = 6, className }: {
  value: number; color: string; height?: number; className?: string;
}) {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`rounded-full overflow-hidden ${className ?? ''}`}
      style={{ background: 'var(--border)', height }}>
      <motion.div className="h-full rounded-full"
        style={{ background: color }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }} />
    </div>
  );
}

// ── Core usage grid cell ────────────────────────────────────────────────────
export function CoreCell({ value, index, color }: { value: number; index: number; color: string }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const alpha = 0.15 + (pct / 100) * 0.7;
  return (
    <div className="flex flex-col gap-1 rounded-xl p-2.5 border transition-colors"
      style={{ borderColor: 'var(--border)', background: `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` }}>
      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>C{index}</div>
      <BarGauge value={pct} color={color} height={4} />
      <div className="text-[11px] font-bold tabular-nums text-right" style={{ color }}>{pct.toFixed(0)}%</div>
    </div>
  );
}
