import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../../store';
import { formatBytes } from '../../../lib/mock-stats';

type SortKey = 'cpu' | 'mem';

export function ProcessesModule() {
  const { snapshot } = useStore();
  const [sort, setSort]     = useState<SortKey>('cpu');
  const [query, setQuery]   = useState('');
  const [killing, setKilling] = useState<number | null>(null);

  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const kill = async (pid: number) => {
    if (!isTauri) return;
    setKilling(pid);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('kill_process', { pid });
    } catch {}
    setKilling(null);
  };

  const procs = (snapshot?.processes ?? [])
    .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'cpu' ? b.cpu - a.cpu : b.memory - a.memory);

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort(k)}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors"
      style={{
        background: sort === k ? '#58a6ff22' : 'transparent',
        color: sort === k ? '#58a6ff' : 'var(--muted)',
        border: `1px solid ${sort === k ? '#58a6ff44' : 'var(--border)'}`,
      }}>
      {label}
      {sort === k ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
    </button>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter processes…"
            className="w-full rounded-xl py-1.5 pl-8 pr-8 text-[12px] outline-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }} />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted)' }}>
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Sort by</span>
          <SortBtn k="cpu" label="CPU" />
          <SortBtn k="mem" label="RAM" />
        </div>

        <div className="text-[11px] tabular-nums ml-2" style={{ color: 'var(--muted)' }}>
          {procs.length} processes
        </div>
      </div>

      {/* Table header */}
      <div className="grid px-5 py-2 text-[9.5px] font-bold uppercase tracking-widest shrink-0"
        style={{ gridTemplateColumns: '1fr 80px 80px 80px 40px', color: 'var(--muted)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <span>Name</span>
        <span className="text-center">PID</span>
        <span className={`text-right ${sort === 'cpu' ? '' : ''}`} style={{ color: sort === 'cpu' ? '#58a6ff' : undefined }}>CPU</span>
        <span className="text-right" style={{ color: sort === 'mem' ? '#58a6ff' : undefined }}>RAM</span>
        <span />
      </div>

      {/* Process rows */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {procs.map((p) => (
            <motion.div key={p.pid}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="grid items-center px-5 py-2.5 border-b group hover:bg-[var(--surface2)] transition-colors"
              style={{ gridTemplateColumns: '1fr 80px 80px 80px 40px', borderColor: 'var(--border)' }}>

              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: p.cpu > 20 ? '#ff8c3c' : p.cpu > 5 ? '#d29922' : '#3fb95066' }} />
                <span className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</span>
              </div>

              <div className="text-center text-[10px] tabular-nums" style={{ color: 'var(--muted)' }}>{p.pid}</div>

              <div className="text-right text-[12px] font-semibold tabular-nums"
                style={{ color: p.cpu > 20 ? '#ff8c3c' : p.cpu > 5 ? '#d29922' : 'var(--text)' }}>
                {p.cpu.toFixed(1)}%
              </div>

              <div className="text-right text-[12px] tabular-nums" style={{ color: 'var(--muted)' }}>
                {formatBytes(p.memory)}
              </div>

              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                {isTauri && (
                  <button
                    onClick={() => kill(p.pid)}
                    disabled={killing === p.pid}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-colors"
                    style={{
                      background: killing === p.pid ? 'rgba(255,80,80,0.08)' : 'rgba(255,80,80,0.12)',
                      color: '#ff5050',
                      border: '1px solid rgba(255,80,80,0.25)',
                    }}
                    title="Kill process">
                    {killing === p.pid ? '…' : '✕'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {procs.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16 text-[12px]" style={{ color: 'var(--muted)' }}>
            {query ? 'No matching processes' : 'Loading…'}
          </div>
        )}
      </div>
    </div>
  );
}
