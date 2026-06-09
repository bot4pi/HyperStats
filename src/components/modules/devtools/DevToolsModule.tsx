import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { DevTool } from '../../../lib/mock-stats';
import { MOCK_DEV_TOOLS } from '../../../lib/mock-stats';
import { useI18n } from '../../../i18n';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const CAT_KEY: Record<string, string> = {
  runtime: 'cat_runtime', lang: 'cat_lang', pkg: 'cat_pkg',
  ide: 'cat_ide', vcs: 'cat_vcs', ops: 'cat_ops', build: 'cat_build', media: 'cat_media',
};

const CAT_COLORS: Record<string, string> = {
  runtime: '#3fb950',
  lang:    '#58a6ff',
  pkg:     '#bc8cff',
  ide:     '#00d9ff',
  vcs:     '#ff8c3c',
  ops:     '#d29922',
  build:   '#a8dadc',
  media:   '#ff5080',
};

function ToolRow({ tool, i }: { tool: DevTool; i: number }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.025 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 hover:bg-[var(--surface2)] transition-colors"
      style={{ borderColor: 'var(--border)' }}>

      {tool.installed
        ? <CheckCircle2 size={14} style={{ color: '#3fb950', flexShrink: 0 }} />
        : <XCircle     size={14} style={{ color: 'var(--border)', flexShrink: 0 }} />}

      <span className="flex-1 text-[12px] font-medium"
        style={{ color: tool.installed ? 'var(--text)' : 'var(--muted)' }}>
        {tool.name}
      </span>

      {tool.version ? (
        <span className="text-[10px] tabular-nums px-2 py-0.5 rounded-md"
          style={{
            background: '#3fb95018',
            color: '#3fb950',
            border: '1px solid #3fb95030',
          }}>
          {tool.version
          .replace(/^[a-z][\w\-]* /i, '')
          .replace(/\s*\([^)]*\)/g, '')
          .replace(/^v/i, '')
          .trim() || tool.version}
        </span>
      ) : (
        <span className="text-[10px] px-2 py-0.5 rounded-md"
          style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
          {t('not_found')}
        </span>
      )}
    </motion.div>
  );
}

export function DevToolsModule() {
  const { t } = useI18n();
  const [tools, setTools]   = useState<DevTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'installed' | 'missing'>('all');

  const load = async () => {
    setLoading(true);
    try {
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/core');
        const result = await invoke<DevTool[]>('detect_dev_tools');
        setTools(result);
      } else {
        await new Promise(r => setTimeout(r, 600)); // simulate scan
        setTools(MOCK_DEV_TOOLS);
      }
    } catch {
      setTools(MOCK_DEV_TOOLS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const visible = tools.filter(t =>
    filter === 'all'       ? true :
    filter === 'installed' ? t.installed :
    !t.installed
  );

  const grouped: Record<string, DevTool[]> = {};
  for (const t of visible) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }

  const installedCount = tools.filter(t => t.installed).length;

  return (
    <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex-1 flex items-center gap-2 text-[12px]">
          {loading ? (
            <span style={{ color: 'var(--muted)' }}>{t('devtools_scanning')}</span>
          ) : (
            <span style={{ color: 'var(--muted)' }}>
              {t('devtools_installed_of', { n: installedCount, total: tools.length })}
            </span>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(['all', 'installed', 'missing'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-[11px] font-medium transition-colors"
              style={{
                background: filter === f ? '#58a6ff22' : 'transparent',
                color:      filter === f ? '#58a6ff'   : 'var(--muted)',
                border:     `1px solid ${filter === f ? '#58a6ff44' : 'var(--border)'}`,
              }}>
              {t(f)}
            </button>
          ))}
        </div>

        <button onClick={load}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--surface2)]"
          style={{ border: '1px solid var(--border)' }}>
          <RefreshCw size={13}
            className={loading ? 'animate-spin' : ''}
            style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Content — outer div is the scroll container, inner div grows to content height */}
      <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Code2 size={36} style={{ color: 'var(--muted)', opacity: 0.4 }} />
            <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
              {t('devtools_probing')}
            </div>
            <div className="flex gap-1 mt-1">
              {[0,1,2].map(i => (
                <motion.div key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#58a6ff' }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-3">
            <AnimatePresence>
              {Object.keys(CAT_KEY)
                .filter(cat => grouped[cat]?.length)
                .map(cat => (
                  <motion.div key={cat}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border overflow-hidden"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', flexShrink: 0 }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: CAT_COLORS[cat] ?? '#666' }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: CAT_COLORS[cat] ?? 'var(--muted)' }}>{t(CAT_KEY[cat])}</span>
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        ({grouped[cat].filter(tool => tool.installed).length}/{grouped[cat].length})
                      </span>
                    </div>
                    {grouped[cat].map((tool, i) => (
                      <ToolRow key={tool.name} tool={tool} i={i} />
                    ))}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
