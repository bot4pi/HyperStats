import { motion } from 'framer-motion';
import { HardDrive, ArrowDown, ArrowUp } from 'lucide-react';
import { useStore } from '../../../store';
import { formatBytes } from '../../../lib/mock-stats';
import { BarGauge } from '../../shared/Charts';

export function DiskModule() {
  const { snapshot } = useStore();
  const s = snapshot;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      {s ? s.disks.map((disk, i) => {
        const pct  = disk.total > 0 ? (disk.used / disk.total) * 100 : 0;
        const free = disk.total - disk.used;
        const color = pct > 85 ? '#ff5050' : pct > 65 ? '#d29922' : '#3fb950';

        return (
          <motion.div key={disk.mount}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color + '18' }}>
                  <HardDrive size={18} style={{ color }} />
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{disk.mount}</div>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{disk.fs}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold tabular-nums leading-none" style={{ color }}>
                  {pct.toFixed(1)}%
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>used</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex flex-col gap-1.5">
              <BarGauge value={pct} color={color} height={10} />
              <div className="flex justify-between text-[10px] tabular-nums" style={{ color: 'var(--muted)' }}>
                <span>{formatBytes(disk.used)} used</span>
                <span>{formatBytes(free)} free</span>
                <span>{formatBytes(disk.total)} total</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total',     value: formatBytes(disk.total),  color: 'var(--text)' },
                { label: 'Used',      value: formatBytes(disk.used),   color               },
                { label: 'Available', value: formatBytes(free),        color: '#3fb950'    },
              ].map(({ label, value, color: c }) => (
                <div key={label} className="rounded-xl p-3 border"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
                  <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: c }}>{value}</div>
                </div>
              ))}
            </div>

            {/* I/O speeds */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Read speed',  value: disk.read_sec,  color: '#58a6ff', Icon: ArrowDown },
                { label: 'Write speed', value: disk.write_sec, color: '#ff8c3c', Icon: ArrowUp   },
              ].map(({ label, value, color: c, Icon }) => (
                <div key={label} className="rounded-xl p-3 border flex items-center gap-3"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: c + '18' }}>
                    <Icon size={13} style={{ color: c }} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
                    <div className="text-[13px] font-bold tabular-nums mt-0.5" style={{ color: c }}>
                      {formatBytes(value)}/s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      }) : (
        <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'var(--muted)' }}>
          Loading disk information…
        </div>
      )}
    </div>
  );
}
