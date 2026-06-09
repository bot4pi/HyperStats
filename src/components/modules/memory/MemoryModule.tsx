import { useStore } from '../../../store';
import { Ring, Sparkline, BarGauge } from '../../shared/Charts';
import { formatBytes } from '../../../lib/mock-stats';

function MemRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span className="tabular-nums font-semibold" style={{ color }}>{formatBytes(value)}</span>
      </div>
      <BarGauge value={pct} color={color} height={6} />
      <div className="text-[9px] tabular-nums text-right" style={{ color: 'var(--muted)' }}>
        {pct.toFixed(1)}% of {formatBytes(total)}
      </div>
    </div>
  );
}

export function MemoryModule() {
  const { snapshot, memHistory } = useStore();
  const s = snapshot;

  const memPct  = s ? (s.mem.used / s.mem.total) * 100 : 0;
  const swapPct = s && s.mem.swap_total > 0 ? (s.mem.swap_used / s.mem.swap_total) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      <div className="flex gap-4">
        {/* Ring */}
        <div className="rounded-2xl border p-5 flex items-center gap-6 shrink-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Ring value={memPct} size={100} color="#bc8cff" strokeWidth={7}>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: '#bc8cff' }}>
              {memPct.toFixed(0)}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--muted)' }}>%</span>
          </Ring>
          <div className="flex flex-col gap-2 min-w-[160px]">
            <div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Used</div>
              <div className="text-[20px] font-bold tabular-nums" style={{ color: '#bc8cff' }}>
                {s ? formatBytes(s.mem.used) : '—'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              {[
                { l: 'Total',     v: s ? formatBytes(s.mem.total) : '—' },
                { l: 'Available', v: s ? formatBytes(s.mem.available) : '—' },
                { l: 'Swap',      v: s ? formatBytes(s.mem.swap_used) : '—' },
                { l: 'Swap max',  v: s ? formatBytes(s.mem.swap_total) : '—' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{l}</div>
                  <div className="font-semibold tabular-nums" style={{ color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="flex-1 rounded-2xl border p-4 flex flex-col gap-2"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Memory Usage (60s)</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: '#bc8cff' }}>
              {memPct.toFixed(1)}%
            </span>
          </div>
          <div className="flex-1 min-h-[80px]">
            <Sparkline data={memHistory} color="#bc8cff" height={90} />
          </div>
          <div className="flex justify-between text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>
            <span>60s ago</span><span>30s</span><span>now</span>
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Breakdown</div>
        {s ? (
          <>
            <MemRow label="RAM used"       value={s.mem.used}       total={s.mem.total}      color="#bc8cff" />
            <MemRow label="RAM available"  value={s.mem.available}  total={s.mem.total}      color="#58a6ff" />
            <MemRow label="Swap used"      value={s.mem.swap_used}  total={s.mem.swap_total} color="#d29922" />
          </>
        ) : (
          <div className="text-center text-[12px] py-4" style={{ color: 'var(--muted)' }}>Loading…</div>
        )}
      </div>

      {/* Swap info */}
      {s && s.mem.swap_total > 0 && (
        <div className="rounded-2xl border p-4 flex items-center gap-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Ring value={swapPct} size={64} color="#d29922" strokeWidth={5}>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: '#d29922' }}>{swapPct.toFixed(0)}%</span>
          </Ring>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>Swap / Page file</div>
            <div className="text-[11px] tabular-nums mt-0.5" style={{ color: 'var(--muted)' }}>
              {formatBytes(s.mem.swap_used)} of {formatBytes(s.mem.swap_total)} used
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
