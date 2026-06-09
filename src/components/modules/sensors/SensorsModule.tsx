import { Thermometer, BatteryCharging, Battery, BatteryLow } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store';
import { tempColor } from '../../../lib/mock-stats';
import { BarGauge } from '../../shared/Charts';
import { useI18n } from '../../../i18n';

function TempBar({ label, temp, max, critical }: { label: string; temp: number; max: number; critical: number | null }) {
  const color  = tempColor(temp);
  const ceil   = critical ?? 105;
  const pct    = Math.min((temp / ceil) * 100, 100);
  const maxPct = Math.min((max  / ceil) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span style={{ color: 'var(--text)' }} className="font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span className="tabular-nums text-[10px]" style={{ color: 'var(--muted)' }}>
            max {max.toFixed(0)}°C
          </span>
          <span className="tabular-nums font-bold text-[13px]" style={{ color }}>
            {temp.toFixed(1)}°C
          </span>
        </div>
      </div>
      <div className="relative h-2">
        <BarGauge value={pct} color={color} height={8} />
        <div className="absolute top-0 bottom-0 w-0.5 rounded-full opacity-60"
          style={{ left: `${maxPct}%`, background: '#666e7a' }} />
      </div>
      {critical && (
        <div className="flex justify-end text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>
          crit {critical}°C
        </div>
      )}
    </div>
  );
}

function BatteryCard({ percentage, charging, time_remaining_secs }: {
  percentage: number; charging: boolean; time_remaining_secs: number | null;
}) {
  const { t } = useI18n();
  const color = percentage < 15 ? '#ff5050' : percentage < 30 ? '#d29922' : '#3fb950';
  const Icon = charging ? BatteryCharging : percentage < 15 ? BatteryLow : Battery;

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="rounded-2xl border p-4 flex items-center gap-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '18' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{t('battery')}</span>
          <span className="text-[20px] font-bold tabular-nums" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="mt-1.5">
          <BarGauge value={percentage} color={color} height={6} />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[10px]"
          style={{ color: 'var(--muted)' }}>
          <span>{charging ? t('charging') : t('discharging')}</span>
          {time_remaining_secs && (
            <span className="tabular-nums">
              {charging
                ? t('battery_full_in', { time: fmtTime(time_remaining_secs) })
                : t('battery_remaining', { time: fmtTime(time_remaining_secs) })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const CATEGORIES: Record<string, string[]> = {
  'CPU':    ['CPU', 'Core', 'Package', 'Processor'],
  'GPU':    ['GPU', 'Video', 'Graphics'],
  'Drive':  ['SSD', 'HDD', 'NVMe', 'Drive', 'Disk', 'M.2'],
  'System': ['Board', 'System', 'Ambient', 'Motherboard', 'Chipset'],
};

function categorize(label: string): string {
  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    if (kws.some(kw => label.toLowerCase().includes(kw.toLowerCase()))) return cat;
  }
  return 'Other';
}

export function SensorsModule() {
  const { snapshot } = useStore();
  const { t } = useI18n();
  const sensors  = snapshot?.sensors ?? [];
  const battery  = snapshot?.battery ?? null;

  const grouped: Record<string, typeof sensors> = {};
  for (const s of sensors) {
    const cat = categorize(s.label);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  const catColors: Record<string, string> = {
    CPU: '#ff8c3c', GPU: '#ff5080', Drive: '#3fb950', System: '#58a6ff', Other: '#bc8cff',
  };

  const hottest = sensors.length > 0
    ? sensors.reduce((a, b) => a.temp > b.temp ? a : b)
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ background: 'var(--bg)' }}>

      {/* Summary row */}
      {sensors.length > 0 && hottest && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('hottest_sensor'), value: `${hottest.temp.toFixed(1)}°C`, sub: hottest.label, color: tempColor(hottest.temp) },
            { label: t('total_sensors'),  value: `${sensors.length}`,            sub: t('components_monitored'), color: '#58a6ff' },
            { label: t('max_recorded'),   value: `${Math.max(...sensors.map(s => s.max)).toFixed(0)}°C`, sub: t('peak_temperature'), color: '#d29922' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl border p-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</div>
              <div className="text-[20px] font-bold tabular-nums mt-1" style={{ color }}>{value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Battery */}
      {battery && (
        <BatteryCard
          percentage={battery.percentage}
          charging={battery.charging}
          time_remaining_secs={battery.time_remaining_secs} />
      )}

      {/* Sensor groups */}
      {sensors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ color: 'var(--muted)' }}>
          <Thermometer size={40} style={{ opacity: 0.3 }} />
          <div className="text-[13px]">{t('no_sensors')}</div>
          <div className="text-[11px]">{t('sensors_drivers')}</div>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="rounded-2xl border p-5 flex flex-col gap-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: catColors[cat] ?? '#666' }} />
              <span className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: catColors[cat] ?? 'var(--muted)' }}>{cat}</span>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>({items.length})</span>
            </div>
            {items.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}>
                <TempBar
                  label={s.label}
                  temp={s.temp}
                  max={s.max}
                  critical={s.critical} />
              </motion.div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
