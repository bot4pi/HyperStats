import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FolderInput, ArrowUp, ArrowDown, ArrowUpDown,
  Grid3X3, List, LayoutList, Folder, File,
  ChevronRight, RefreshCw, HardDrive,
} from 'lucide-react';
import type { FileEntry } from '../../../lib/mock-stats';
import {
  formatBytes, fileTypeCategory, FILE_TYPE_COLOR,
} from '../../../lib/mock-stats';
import { useI18n } from '../../../i18n';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

type SortKey   = 'name' | 'size' | 'modified' | 'created' | 'ext' | 'type';
type SortOrder = 'asc' | 'desc';
type GroupBy   = 'none' | 'ext' | 'type' | 'month' | 'size_tier';
type ViewMode  = 'list' | 'compact' | 'grid';

const SIZE_TIER = (n: number) =>
  n === 0     ? 'Folders' :
  n >= 1e9    ? '> 1 GB'  :
  n >= 100e6  ? '100 MB – 1 GB' :
  n >= 10e6   ? '10 – 100 MB' :
  n >= 1e6    ? '1 – 10 MB' :
  n >= 1e3    ? '< 1 MB' : '< 1 KB';

const MONTH_OF = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const MONTH_LABEL = (key: string) => {
  const [y, m] = key.split('-');
  return new Date(+y, +m - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
};

const QUICK_PATHS = [
  { key: 'files_desktop',   dir: 'Desktop' },
  { key: 'files_downloads', dir: 'Downloads' },
  { key: 'files_documents', dir: 'Documents' },
];

const MOCK_FILES: FileEntry[] = [
  { name: 'Projects',     path: 'C:\\Users\\User\\Projects',     size: 0,         is_dir: true,  ext: '', modified: Date.now()/1000 - 3600,   created: Date.now()/1000 - 86400*30 },
  { name: 'screenshot.png', path: '…', size: 2.4e6,  is_dir: false, ext: 'png', modified: Date.now()/1000 - 7200,   created: Date.now()/1000 - 7200 },
  { name: 'report.pdf',   path: '…', size: 1.8e6,  is_dir: false, ext: 'pdf', modified: Date.now()/1000 - 86400,   created: Date.now()/1000 - 86400 },
  { name: 'backup.zip',   path: '…', size: 540e6,  is_dir: false, ext: 'zip', modified: Date.now()/1000 - 86400*3, created: Date.now()/1000 - 86400*3 },
  { name: 'video.mp4',    path: '…', size: 2.1e9,  is_dir: false, ext: 'mp4', modified: Date.now()/1000 - 86400*7, created: Date.now()/1000 - 86400*7 },
  { name: 'notes.md',     path: '…', size: 8400,   is_dir: false, ext: 'md',  modified: Date.now()/1000 - 1800,    created: Date.now()/1000 - 86400*2 },
  { name: 'app.exe',      path: '…', size: 15e6,   is_dir: false, ext: 'exe', modified: Date.now()/1000 - 86400*14, created: Date.now()/1000 - 86400*14 },
];

const FILE_ICON_EMOJI: Record<string, string> = {
  image: '🖼', video: '🎬', audio: '🎵', doc: '📄', archive: '📦',
  code: '📝', config: '⚙', binary: '⚡', dir: '📁', other: '📄',
};

function FileRow({ entry, view }: { entry: FileEntry; view: ViewMode }) {
  const cat   = entry.is_dir ? 'dir' : fileTypeCategory(entry.ext);
  const color = FILE_TYPE_COLOR[cat];
  const emoji = FILE_ICON_EMOJI[cat];

  if (view === 'grid') {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-default"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <span className="text-[22px]">{emoji}</span>
        <span className="text-[10px] text-center truncate w-full font-medium"
          style={{ color: 'var(--text)' }}>
          {entry.name}
        </span>
        {!entry.is_dir && (
          <span className="text-[9px] tabular-nums" style={{ color: 'var(--muted)' }}>
            {formatBytes(entry.size)}
          </span>
        )}
      </motion.div>
    );
  }

  const compact = view === 'compact';
  return (
    <div className={`flex items-center gap-3 border-b last:border-0 hover:bg-[var(--surface2)] transition-colors cursor-default ${compact ? 'px-4 py-1.5' : 'px-4 py-2.5'}`}
      style={{ borderColor: 'var(--border)' }}>

      <div className={`${compact ? 'w-5 h-5 text-[13px]' : 'w-6 h-6 text-[15px]'} flex items-center justify-center shrink-0`}>
        {entry.is_dir
          ? <Folder size={compact ? 13 : 15} style={{ color: '#d29922' }} />
          : <File   size={compact ? 13 : 15} style={{ color }} />}
      </div>

      <span className={`flex-1 truncate ${compact ? 'text-[11px]' : 'text-[12px]'} font-medium`}
        style={{ color: 'var(--text)' }}>{entry.name}</span>

      {!compact && (
        <span className="text-[10px] w-16 text-center rounded-md px-1.5 py-0.5"
          style={{ background: color + '18', color, border: `1px solid ${color}30` }}>
          {entry.is_dir ? 'folder' : (entry.ext || '—')}
        </span>
      )}

      <span className="text-[10px] tabular-nums w-20 text-right" style={{ color: 'var(--muted)' }}>
        {entry.is_dir ? '—' : formatBytes(entry.size)}
      </span>

      {!compact && (
        <span className="text-[9px] tabular-nums w-28 text-right" style={{ color: 'var(--muted)' }}>
          {new Date(entry.modified * 1000).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

export function FilesModule() {
  const { t } = useI18n();
  const [path, setPath]       = useState('');
  const [input, setInput]     = useState('');
  const [files, setFiles]     = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortOrder>('asc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [view, setView]       = useState<ViewMode>('list');
  const [filterExt, setFilterExt] = useState('');

  const userName = typeof window !== 'undefined' ? (window as { userName?: string }).userName ?? 'User' : 'User';
  const quickLinks = QUICK_PATHS.map(q => ({
    label: t(q.key),
    path: `C:\\Users\\${userName}\\${q.dir}`,
  })).concat([
    { label: 'C:\\', path: 'C:\\' },
    { label: 'D:\\', path: 'D:\\' },
  ]);

  const scan = useCallback(async (p: string) => {
    if (!p.trim()) return;
    setLoading(true);
    setError('');
    try {
      let entries: FileEntry[];
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/core');
        entries = await invoke<FileEntry[]>('scan_dir', { path: p.trim() });
      } else {
        await new Promise(r => setTimeout(r, 300));
        entries = MOCK_FILES;
      }
      setFiles(entries);
      setPath(p.trim());
      setInput(p.trim());
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, []);

  const sorted = [...files]
    .filter(f => !filterExt || f.ext === filterExt || (filterExt === '__dir' && f.is_dir))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name')     cmp = a.name.localeCompare(b.name);
      if (sortKey === 'size')     cmp = a.size - b.size;
      if (sortKey === 'modified') cmp = a.modified - b.modified;
      if (sortKey === 'created')  cmp = a.created - b.created;
      if (sortKey === 'ext')      cmp = a.ext.localeCompare(b.ext);
      if (sortKey === 'type')     cmp = fileTypeCategory(a.ext).localeCompare(fileTypeCategory(b.ext));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const makeGroups = (): Record<string, FileEntry[]> => {
    if (groupBy === 'none') return { '': sorted };
    const g: Record<string, FileEntry[]> = {};
    for (const f of sorted) {
      let key = '';
      if (groupBy === 'ext')      key = f.is_dir ? 'Folders' : (f.ext.toUpperCase() || 'No extension');
      if (groupBy === 'type')     key = f.is_dir ? 'Folders' : fileTypeCategory(f.ext);
      if (groupBy === 'month')    key = f.is_dir ? 'Folders' : MONTH_OF(f.modified);
      if (groupBy === 'size_tier') key = SIZE_TIER(f.is_dir ? 0 : f.size);
      if (!g[key]) g[key] = [];
      g[key].push(f);
    }
    return g;
  };
  const groups = makeGroups();

  const allExts = [...new Set(files.filter(f => !f.is_dir && f.ext).map(f => f.ext))].sort();

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => {
    const active = sortKey === k;
    const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button onClick={() => toggleSort(k)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors"
        style={{
          background: active ? '#58a6ff22' : 'transparent',
          color:      active ? '#58a6ff'   : 'var(--muted)',
          border:     `1px solid ${active ? '#58a6ff44' : 'var(--border)'}`,
        }}>
        {label} <Icon size={9} />
      </button>
    );
  };

  const GROUP_LABELS: Record<GroupBy, string> = {
    none: t('group_none'), ext: t('group_ext'), type: t('group_type'),
    month: t('group_month'), size_tier: t('group_size_tier'),
  };

  return (
    <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* Path bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <FolderInput size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && scan(input)}
          placeholder={t('files_placeholder')}
          className="flex-1 bg-transparent outline-none text-[12px]"
          style={{ color: 'var(--text)' }} />
        <button onClick={() => scan(input)}
          className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors"
          style={{ background: '#58a6ff22', color: '#58a6ff', border: '1px solid #58a6ff44' }}>
          {t('files_open')}
        </button>
        {path && (
          <button onClick={() => scan(input)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface2)]"
            style={{ border: '1px solid var(--border)' }}>
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--muted)' }} />
          </button>
        )}
      </div>

      {/* Quick links */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b shrink-0 overflow-x-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {quickLinks.map(q => (
          <button key={q.path} onClick={() => scan(q.path)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors hover:bg-[var(--surface2)]"
            style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
            <HardDrive size={9} />
            {q.label}
          </button>
        ))}
      </div>

      {!path ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ color: 'var(--muted)' }}>
          <FolderOpen size={44} style={{ opacity: 0.25 }} />
          <div className="text-[13px]">{t('files_empty_title')}</div>
          <div className="text-[11px]">{t('files_empty_sub')}</div>
        </div>
      ) : (
        <>
          {/* Sort & group toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0 overflow-x-auto"
            style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>

            <span className="text-[9px] uppercase tracking-wider shrink-0" style={{ color: 'var(--muted)' }}>{t('sort_by')}</span>
            <SortBtn k="name"     label={t('sort_name')} />
            <SortBtn k="size"     label={t('sort_size')} />
            <SortBtn k="modified" label={t('sort_modified')} />
            <SortBtn k="created"  label={t('sort_created')} />
            <SortBtn k="ext"      label={t('sort_ext')} />
            <SortBtn k="type"     label={t('sort_type')} />

            <div className="w-px h-4 mx-1 shrink-0" style={{ background: 'var(--border)' }} />
            <span className="text-[9px] uppercase tracking-wider shrink-0" style={{ color: 'var(--muted)' }}>{t('group_by')}</span>
            {(['none','ext','type','month','size_tier'] as GroupBy[]).map(g => (
              <button key={g} onClick={() => setGroupBy(g)}
                className="px-2 py-1 rounded-lg text-[10px] transition-colors whitespace-nowrap"
                style={{
                  background: groupBy === g ? '#bc8cff22' : 'transparent',
                  color:      groupBy === g ? '#bc8cff'   : 'var(--muted)',
                  border:     `1px solid ${groupBy === g ? '#bc8cff44' : 'var(--border)'}`,
                }}>
                {GROUP_LABELS[g]}
              </button>
            ))}

            <div className="w-px h-4 mx-1 shrink-0" style={{ background: 'var(--border)' }} />

            {allExts.length > 0 && (
              <select value={filterExt} onChange={e => setFilterExt(e.target.value)}
                className="rounded-lg text-[10px] px-2 py-1 outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                <option value="">{t('all_types')}</option>
                <option value="__dir">{t('files_folders_only')}</option>
                {allExts.map(e => <option key={e} value={e}>.{e}</option>)}
              </select>
            )}

            <div className="ml-auto flex gap-1 shrink-0">
              {([['list', List], ['compact', LayoutList], ['grid', Grid3X3]] as [ViewMode, typeof List][]).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: view === v ? '#58a6ff22' : 'transparent',
                    border: `1px solid ${view === v ? '#58a6ff44' : 'var(--border)'}`,
                  }}>
                  <Icon size={12} style={{ color: view === v ? '#58a6ff' : 'var(--muted)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 px-4 py-1.5 border-b shrink-0 text-[10px] tabular-nums"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
            <span>{sorted.length} items</span>
            <span>{sorted.filter(f => f.is_dir).length} folders</span>
            <span>{sorted.filter(f => !f.is_dir).length} files</span>
            <span>{formatBytes(sorted.reduce((s, f) => s + f.size, 0))} {t('total').toLowerCase()}</span>
          </div>

          {/* File list */}
          <div className={view === 'grid' ? 'p-4' : ''} style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[12px]"
                style={{ color: 'var(--muted)' }}>{t('files_loading')}</div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 text-[12px]"
                style={{ color: '#ff5050' }}>{error}</div>
            ) : sorted.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-[12px]"
                style={{ color: 'var(--muted)' }}>{t('files_empty_folder')}</div>
            ) : (
              <AnimatePresence>
                {Object.entries(groups).map(([groupKey, groupFiles]) => (
                  <div key={groupKey}>
                    {groupBy !== 'none' && groupKey && (
                      <div className="flex items-center gap-2 px-4 py-2 sticky top-0 z-10 border-b"
                        style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                        <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--muted)' }}>
                          {groupBy === 'month' ? MONTH_LABEL(groupKey) : groupKey}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                          ({groupFiles.length})
                        </span>
                      </div>
                    )}
                    {view === 'grid' ? (
                      <div className="grid grid-cols-6 gap-2 p-2">
                        {groupFiles.map(f => <FileRow key={f.path + f.name} entry={f} view="grid" />)}
                      </div>
                    ) : (
                      <div className={view === 'compact' ? 'rounded-none' : ''}>
                        {groupFiles.map(f => (
                          <motion.div key={f.path + f.name}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <FileRow entry={f} view={view} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}
    </div>
  );
}
