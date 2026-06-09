import { useStore } from '../../../store';
import { Sparkline, Ring, BarGauge } from '../../shared/Charts';

export function CpuModule() {
  const { snapshot, cpuHistory } = useStore();
  const s = snapshot;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      {/* Header row */}
      <div className="flex gap-4">
        {/* Big ring */}
        <div className="rounded-2xl border p-5 flex items-center gap-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Ring value={s?.cpu.total ?? 0} size={100} color="#ff8c3c" strokeWidth={7}>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: '#ff8c3c' }}>
              {(s?.cpu.total ?? 0).toFixed(0)}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--muted)' }}>%</span>
          </Ring>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Processor</div>
              <div className="text-[14px] font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{s?.cpu.name ?? '—'}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Freq</div>
                <div className="text-[13px] font-bold tabular-nums" style={{ color: '#ff8c3c' }}>{s?.cpu.freq ?? 0} MHz</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Cores</div>
                <div className="text-[13px] font-bold tabular-nums" style={{ color: '#ff8c3c' }}>{s?.cpu.cores.length ?? 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* History chart */}
        <div className="flex-1 rounded-2xl border p-4 flex flex-col gap-2"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Utilisation (60s)</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: '#ff8c3c' }}>
              {(s?.cpu.total ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex-1 min-h-[80px]">
            <Sparkline data={cpuHistory} color="#ff8c3c" height={90} />
          </div>
          {/* Y-axis ticks */}
          <div className="flex justify-between text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>
            <span>60s ago</span><span>30s</span><span>now</span>
          </div>
        </div>
      </div>

      {/* Per-core grid */}
      <div className="rounded-2xl border p-4 flex flex-col gap-3"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Per-Core Usage
        </div>
        {s ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(s.cpu.cores.length, 8)}, 1fr)` }}>
            {s.cpu.cores.map((v, i) => (
              <div key={i} className="flex flex-col gap-1.5 rounded-xl p-3 border"
                style={{ borderColor: `rgba(255,140,60,${0.1 + (v / 100) * 0.3})`, background: `rgba(255,140,60,${0.04 + (v / 100) * 0.1})` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Core {i}</span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: '#ff8c3c' }}>{v.toFixed(0)}%</span>
                </div>
                <BarGauge value={v} color="#ff8c3c" height={5} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[12px] py-8" style={{ color: 'var(--muted)' }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
