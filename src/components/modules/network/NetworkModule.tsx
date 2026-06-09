import { ArrowDown, ArrowUp, Wifi } from 'lucide-react';
import { useStore } from '../../../store';
import { Sparkline } from '../../shared/Charts';
import { formatBytes } from '../../../lib/mock-stats';

function SpeedPanel({
  label, value, history, color, icon,
}: {
  label: string; value: number; history: number[]; color: string; icon: import('react').ReactNode;
}) {
  return (
    <div className="flex-1 rounded-2xl border flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: color + '18' }}>
          {icon}
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>{label}</div>
          <div className="text-[18px] font-bold tabular-nums leading-none" style={{ color }}>
            {formatBytes(value)}<span className="text-[11px] font-normal ml-1" style={{ color: 'var(--muted)' }}>/s</span>
          </div>
        </div>
      </div>
      <div className="flex-1 px-0 py-0 min-h-[90px]">
        <Sparkline data={history} color={color} height={96} />
      </div>
      <div className="flex justify-between px-4 pb-2 text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>
        <span>60s ago</span><span>now</span>
      </div>
    </div>
  );
}

export function NetworkModule() {
  const { snapshot, rxHistory, txHistory } = useStore();
  const s = snapshot;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      {/* Speed cards */}
      <div className="flex gap-4" style={{ minHeight: 200 }}>
        <SpeedPanel
          label="Download"
          value={s?.net.rx_sec ?? 0}
          history={rxHistory}
          color="#d29922"
          icon={<ArrowDown size={14} style={{ color: '#d29922' }} />} />
        <SpeedPanel
          label="Upload"
          value={s?.net.tx_sec ?? 0}
          history={txHistory}
          color="#58a6ff"
          icon={<ArrowUp size={14} style={{ color: '#58a6ff' }} />} />
      </div>

      {/* Interface + totals */}
      <div className="rounded-2xl border p-5 flex items-center gap-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#d2992218' }}>
          <Wifi size={22} style={{ color: '#d29922' }} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Active Interface</div>
          <div className="text-[16px] font-bold mt-0.5" style={{ color: 'var(--text)' }}>
            {s?.net.iface ?? '—'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {[
            { label: 'Total received',  value: s ? formatBytes(s.net.total_rx) : '—', color: '#d29922' },
            { label: 'Total sent',      value: s ? formatBytes(s.net.total_tx) : '—', color: '#58a6ff' },
            { label: 'Rx speed',        value: s ? `${formatBytes(s.net.rx_sec)}/s` : '—', color: '#d29922' },
            { label: 'Tx speed',        value: s ? `${formatBytes(s.net.tx_sec)}/s` : '—', color: '#58a6ff' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
              <div className="text-[13px] font-bold tabular-nums" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Throughput bar */}
      {s && (s.net.rx_sec > 0 || s.net.tx_sec > 0) && (() => {
        const peak = Math.max(s.net.rx_sec, s.net.tx_sec, 1);
        const rxPct = (s.net.rx_sec / peak) * 100;
        const txPct = (s.net.tx_sec / peak) * 100;
        return (
          <div className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Relative throughput</div>

            {[
              { label: 'Download', pct: rxPct, color: '#d29922', bytes: s.net.rx_sec },
              { label: 'Upload',   pct: txPct, color: '#58a6ff', bytes: s.net.tx_sec },
            ].map(({ label, pct, color, bytes }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span className="font-semibold tabular-nums" style={{ color }}>
                    {formatBytes(bytes)}/s
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-400"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
