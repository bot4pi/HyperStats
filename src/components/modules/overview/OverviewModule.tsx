import { motion } from 'framer-motion';
import { Cpu, MemoryStick, HardDrive, Wifi } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../../store';
import { Ring, Sparkline, BarGauge } from '../../shared/Charts';
import { formatBytes } from '../../../lib/mock-stats';

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  color: string;
  pct?: number;
  history: number[];
  onClick?: () => void;
}

function StatCard({ Icon, label, value, sub, color, pct, history, onClick }: StatCardProps) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex flex-col rounded-2xl border overflow-hidden text-left w-full transition-all duration-100"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '18' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</div>
          <div className="text-[22px] font-bold tabular-nums leading-none mt-0.5" style={{ color }}>{value}</div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{sub}</div>
        </div>
        {pct !== undefined && (
          <Ring value={pct} size={52} color={color} strokeWidth={5}>
            <span className="text-[9px] font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
          </Ring>
        )}
      </div>

      <div className="px-0 pb-0">
        <Sparkline data={history} color={color} height={44} />
      </div>
    </motion.button>
  );
}

export function OverviewModule() {
  const { snapshot, cpuHistory, memHistory, rxHistory, setModule } = useStore();
  const s = snapshot;

  const memPct  = s ? (s.mem.used / s.mem.total) * 100 : 0;
  const diskMain = s?.disks.find(d => d.mount === 'C:\\') ?? s?.disks[0];
  const diskPct  = diskMain ? (diskMain.used / diskMain.total) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          Icon={Cpu} label="CPU" color="#ff8c3c"
          value={s ? `${s.cpu.total.toFixed(1)}%` : '—'}
          sub={s ? `${s.cpu.name.split(' ').slice(0, 3).join(' ')} · ${s.cpu.freq} MHz` : 'Loading…'}
          pct={s?.cpu.total ?? 0}
          history={cpuHistory}
          onClick={() => setModule('cpu')} />

        <StatCard
          Icon={MemoryStick} label="Memory" color="#bc8cff"
          value={s ? formatBytes(s.mem.used) : '—'}
          sub={s ? `of ${formatBytes(s.mem.total)} · ${memPct.toFixed(0)}% used` : 'Loading…'}
          pct={memPct}
          history={memHistory}
          onClick={() => setModule('memory')} />

        <StatCard
          Icon={HardDrive} label="Disk" color="#3fb950"
          value={diskMain ? formatBytes(diskMain.used) : '—'}
          sub={diskMain ? `of ${formatBytes(diskMain.total)} (${diskMain.mount})` : 'Loading…'}
          pct={diskPct}
          history={Array(60).fill(diskPct)}
          onClick={() => setModule('disk')} />

        <StatCard
          Icon={Wifi} label="Network" color="#d29922"
          value={s ? `↓ ${formatBytes(s.net.rx_sec)}/s` : '—'}
          sub={s ? `↑ ${formatBytes(s.net.tx_sec)}/s · ${s.net.iface}` : 'Loading…'}
          history={rxHistory}
          onClick={() => setModule('network')} />
      </div>

      {/* Bottom two panels */}
      <div className="flex gap-3 flex-1 min-h-0">

        {/* CPU cores */}
        <div className="flex-1 rounded-2xl border p-4 flex flex-col gap-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>CPU Cores</span>
            <span className="text-[11px] tabular-nums" style={{ color: '#ff8c3c' }}>
              {s?.cpu.cores.length ?? 0} logical
            </span>
          </div>
          {s ? (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(s.cpu.cores.length, 8)}, 1fr)` }}>
              {s.cpu.cores.map((v, i) => (
                <div key={i} className="flex flex-col gap-1 rounded-xl p-2 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                  <div className="text-[8.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>C{i}</div>
                  <BarGauge value={v} color="#ff8c3c" height={4} />
                  <div className="text-[10px] font-bold tabular-nums text-right" style={{ color: '#ff8c3c' }}>{v.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[11px]" style={{ color: 'var(--muted)' }}>Loading…</div>
          )}
        </div>

        {/* Top processes */}
        <div className="w-[360px] shrink-0 rounded-2xl border flex flex-col overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Top Processes</span>
            <button onClick={() => setModule('processes')}
              className="text-[10px] transition-colors hover:text-[var(--text)]" style={{ color: 'var(--muted)' }}>
              View all →
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {s?.processes.slice(0, 8).map((p, i) => (
              <motion.div key={p.pid}
                initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-2 border-b last:border-0 hover:bg-[var(--surface2)] transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                  <div className="text-[9px]" style={{ color: 'var(--muted)' }}>PID {p.pid}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-bold tabular-nums" style={{ color: p.cpu > 10 ? '#ff8c3c' : 'var(--text)' }}>
                    {p.cpu.toFixed(1)}%
                  </div>
                  <div className="text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>{formatBytes(p.memory)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
