import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useStore } from '../../store';
import { formatUptime } from '../../lib/mock-stats';
import { useI18n, LANG_NAMES, LANG_FLAGS, type Lang } from '../../i18n';

const MODULE_NAV_KEY: Record<string, string> = {
  overview: 'nav_overview', cpu: 'nav_cpu', memory: 'nav_memory',
  disk: 'nav_disk', network: 'nav_network', processes: 'nav_processes',
  gpu: 'nav_gpu', sensors: 'nav_sensors', devtools: 'nav_devtools',
  files: 'nav_files', ai: 'nav_ai',
};
const COLORS: Record<string, string> = {
  overview: '#00d9ff', cpu: '#ff8c3c', memory: '#bc8cff',
  processes: '#58a6ff', disk: '#3fb950', network: '#d29922',
  gpu: '#ff5080', sensors: '#ff6b35', devtools: '#a8dadc',
  files: '#f4d03f', ai: '#a78bfa',
};

export function TopBar() {
  const { activeModule, snapshot } = useStore();
  const { t, lang, setLang } = useI18n();
  const color = COLORS[activeModule] ?? '#00d9ff';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center justify-between h-11 px-5 shrink-0 border-b border-[var(--border)]"
      style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-2 text-[13px]">
        <span className="font-bold" style={{ color }}>HyperStats</span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span className="font-semibold" style={{ color }}>
          {t(MODULE_NAV_KEY[activeModule] ?? 'nav_overview')}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--muted)' }}>
        {snapshot && (
          <>
            <span className="tabular-nums">{snapshot.hostname}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{snapshot.os.replace('Windows ', 'Win ')}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="tabular-nums">{t('uptime_prefix')} {formatUptime(snapshot.uptime)}</span>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3fb950', boxShadow: '0 0 5px #3fb95088' }} />
          <span style={{ color: '#3fb950' }}>{t('live')}</span>
        </div>

        {/* Language switcher */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ border: '1px solid var(--border)' }}>
            <Globe size={11} style={{ color: 'var(--muted)' }} />
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text)' }}>
              {lang}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden shadow-lg"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', minWidth: 140 }}>
              {(Object.keys(LANG_NAMES) as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] transition-colors hover:bg-[var(--surface2)]"
                  style={{
                    color: l === lang ? '#58a6ff' : 'var(--text)',
                    background: l === lang ? '#58a6ff11' : 'transparent',
                  }}>
                  <span>{LANG_FLAGS[l]}</span>
                  <span className="font-medium">{LANG_NAMES[l]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
