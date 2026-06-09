import { Monitor } from 'lucide-react';
import { useStore } from '../../../store';
import { Ring, BarGauge } from '../../shared/Charts';
import { formatBytes } from '../../../lib/mock-stats';
import { useI18n } from '../../../i18n';

export function GpuModule() {
  const { snapshot } = useStore();
  const { t } = useI18n();
  const gpus = snapshot?.gpus ?? [];

  if (gpus.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
        <Monitor size={40} style={{ opacity: 0.3 }} />
        <div className="text-[13px]">{t('no_gpu')}</div>
        <div className="text-[11px]">{t('gpu_no_adapter')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>
      {gpus.map((gpu) => {
        const vramPct = gpu.vram_total > 0 ? (gpu.vram_used / gpu.vram_total) * 100 : 0;
        const vramFree = gpu.vram_total - gpu.vram_used;
        const color = '#ff5080';

        return (
          <div key={gpu.index}>
            {/* Header card */}
            <div className="rounded-2xl border p-5 flex items-center gap-6 mb-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Ring value={vramPct} size={100} color={color} strokeWidth={7}>
                <span className="text-[18px] font-bold tabular-nums" style={{ color }}>
                  {vramPct.toFixed(0)}
                </span>
                <span className="text-[9px] font-semibold" style={{ color: 'var(--muted)' }}>%</span>
              </Ring>

              <div className="flex flex-col gap-2 flex-1">
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: 'var(--muted)' }}>GPU {gpu.index}</div>
                  <div className="text-[15px] font-bold mt-0.5" style={{ color: 'var(--text)' }}>
                    {gpu.name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {[
                    { l: t('vram_used'),  v: formatBytes(gpu.vram_used),  c: color },
                    { l: t('vram_free'),  v: formatBytes(vramFree),       c: '#3fb950' },
                    { l: t('vram_total'), v: formatBytes(gpu.vram_total), c: 'var(--text)' },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="rounded-xl p-3 border"
                      style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                      <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{l}</div>
                      <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* VRAM bar breakdown */}
            <div className="rounded-2xl border p-5 flex flex-col gap-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--muted)' }}>{t('vram_allocation')}</div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: 'var(--muted)' }}>{t('used')}</span>
                  <span className="font-semibold tabular-nums" style={{ color }}>
                    {formatBytes(gpu.vram_used)} / {formatBytes(gpu.vram_total)}
                  </span>
                </div>
                <BarGauge value={vramPct} color={color} height={12} />
                <div className="flex justify-between text-[9px] tabular-nums"
                  style={{ color: 'var(--muted)' }}>
                  <span>0</span>
                  <span>{formatBytes(gpu.vram_total / 2)}</span>
                  <span>{formatBytes(gpu.vram_total)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                {[
                  { label: t('used'),      bytes: gpu.vram_used,  color },
                  { label: t('available'), bytes: vramFree,       color: '#3fb950' },
                ].map(({ label, bytes, color: c }) => (
                  <div key={label} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span className="font-semibold tabular-nums" style={{ color: c }}>
                      {formatBytes(bytes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
