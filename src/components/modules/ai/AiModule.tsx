import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Key, CheckCircle2, XCircle, RefreshCw, Zap, MessageSquare, FolderOpen, Bot } from 'lucide-react';
import { useI18n } from '../../../i18n';

function ClaudeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 581 581" fill="none">
      <path d="M113.972 386.365L228.296 322.258L230.219 316.691L228.296 313.594H222.725L203.619 312.418L138.296 310.654L81.6445 308.301L26.7565 305.36L12.9469 302.42L0 285.364L1.33392 276.856L12.9469 269.052L29.5809 270.503L66.3436 273.013L121.504 276.816L161.522 279.168L220.803 285.324H230.219L231.553 281.521L228.336 279.168L225.826 276.816L168.742 238.155L106.95 197.3L74.5826 173.774L57.0839 161.855L48.2565 150.681L44.4513 126.293L60.3406 108.805L81.6826 110.255L87.1371 111.706L108.753 128.332L154.93 164.05L215.233 208.436L224.06 215.768L227.591 213.257L228.022 211.493L224.06 204.867L191.261 145.622L156.265 85.3577L140.69 60.3819L136.571 45.4044C135.118 39.249 134.059 34.0719 134.059 27.7604L152.146 3.21515L162.15 0L186.278 3.21515L196.439 12.0368L211.426 46.3066L235.712 100.257L273.376 173.618L284.399 195.379L290.284 215.532L292.482 221.687H296.287V218.158L299.387 176.833L305.114 126.097L310.685 60.814L312.609 42.4238L321.71 20.3887L339.797 8.46988L353.921 15.2135L365.533 31.8374L363.926 42.5817L357.02 87.4362L343.484 157.698L334.657 204.749H339.797L345.682 198.868L369.496 167.267L409.514 117.275L427.169 97.4345L447.766 75.5174L460.987 65.087H485.978L504.38 92.4154L496.141 120.646L470.403 153.267L449.061 180.91L418.459 222.079L399.351 255.015L401.117 257.643L405.669 257.211L474.797 242.508L512.146 235.764L556.716 228.119L576.881 237.529L579.078 247.095L571.154 266.661L523.486 278.424L467.579 289.599L384.327 309.281L383.306 310.026L384.483 311.476L421.99 315.005L438.036 315.869H477.309L550.438 321.318L569.544 333.943L581 349.393L579.078 361.155L549.654 376.133L509.95 366.723L417.282 344.687L385.504 336.766H381.108V339.394L407.59 365.272L456.123 409.068L516.894 465.529L519.993 479.487L512.186 490.505L503.947 489.329L450.55 449.18L429.953 431.103L383.306 391.854H380.207V395.971L390.956 411.695L447.726 496.975L450.668 523.127L446.549 531.635L431.837 536.772L415.673 533.831L382.443 487.212L348.152 434.71L320.493 387.659L317.12 389.582L300.799 565.276L293.148 574.256L275.493 581L260.781 569.825L252.974 551.749L260.781 516.031L270.197 469.41L277.847 432.358L284.753 386.327L288.873 371.036L288.598 370.015L285.224 370.447L250.502 418.086L197.694 489.407L155.911 534.105L145.907 538.066L128.566 529.086L130.175 513.05L139.865 498.779L197.694 425.262L232.573 379.7L255.092 353.391L254.936 349.589H253.601L100.004 449.258L72.6591 452.786L60.8892 441.768L62.3404 423.694L67.913 417.812L114.09 386.053L113.932 386.209L113.972 386.365Z" fill="#D87756"/>
    </svg>
  );
}

function OpenAIIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A5.985 5.985 0 004.614 3.45a5.984 5.984 0 00-3.990 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.048 6.048 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.049 6.049 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.048 6.048 0 00-.747-7.073zm-9.022 12.609a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zm-1.26-10.408a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );
}

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

interface ClaudeCodeStats {
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
  session_count: number;
  project_count: number;
}

type KeyStatus = 'idle' | 'checking' | 'ok' | 'fail';

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function fmtCost(n: number): string {
  return '$' + n.toFixed(2);
}

const PRICE = { input: 3, output: 15, cacheRead: 0.30, cacheCreate: 3.75 };

function estimateCost(s: ClaudeCodeStats): number {
  return (
    (s.input_tokens          / 1e6) * PRICE.input       +
    (s.output_tokens         / 1e6) * PRICE.output      +
    (s.cache_read_tokens     / 1e6) * PRICE.cacheRead   +
    (s.cache_creation_tokens / 1e6) * PRICE.cacheCreate
  );
}

interface ServiceCardProps {
  title: string;
  accent: string;
  icon: React.ReactNode;
  savedKey: string;
  status: KeyStatus;
  onSave: (key: string) => void;
  onCheck: (key: string) => void;
  children?: React.ReactNode;
}

function ServiceCard({ title, accent, icon, savedKey, status, onSave, onCheck, children }: ServiceCardProps) {
  const { t } = useI18n();
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput(savedKey ? '••••••••' + savedKey.slice(-4) : '');
  }, [savedKey]);

  const handleSave = () => {
    if (!input || input.startsWith('••')) return;
    onSave(input.trim());
  };

  const handleCheck = () => {
    if (savedKey) onCheck(savedKey);
  };

  return (
    <div className="rounded-2xl border flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      <div className="flex items-center gap-2.5 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: accent + '22', border: `1px solid ${accent}44` }}>
          {icon}
        </div>
        <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {status === 'checking' && (
            <RefreshCw size={12} className="animate-spin" style={{ color: accent }} />
          )}
          {status === 'ok' && <CheckCircle2 size={14} style={{ color: '#3fb950' }} />}
          {status === 'fail' && <XCircle size={14} style={{ color: '#f85149' }} />}
          {status !== 'idle' && (
            <span className="text-[10px] font-medium" style={{
              color: status === 'ok' ? '#3fb950' : status === 'fail' ? '#f85149' : accent,
            }}>
              {status === 'checking' ? t('ai_checking') : status === 'ok' ? t('ai_connected') : t('ai_invalid')}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <Key size={11} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            className="flex-1 bg-transparent outline-none placeholder:opacity-40 text-[11px]"
            style={{ color: 'var(--text)' }}
            type="password"
            placeholder={t('ai_key_placeholder', { service: title })}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => { if (input.startsWith('••')) setInput(''); }}
            onBlur={() => { if (!input && savedKey) setInput('••••••••' + savedKey.slice(-4)); }}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!input || input.startsWith('••')}
          className="px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
          style={{
            background: accent + '22',
            color: accent,
            border: `1px solid ${accent}44`,
            opacity: (!input || input.startsWith('••')) ? 0.4 : 1,
          }}>
          {t('save')}
        </button>
        {savedKey && (
          <button
            onClick={handleCheck}
            disabled={status === 'checking'}
            className="px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
            style={{
              background: 'var(--surface2)',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
            }}>
            {t('test')}
          </button>
        )}
      </div>

      {children && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

export function AiModule() {
  const { t } = useI18n();
  const [stats, setStats]       = useState<ClaudeCodeStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [keys, setKeys]         = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, KeyStatus>>({});

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/core');
        const s = await invoke<ClaudeCodeStats>('get_claude_code_stats');
        setStats(s);
      } else {
        setStats({
          input_tokens: 12_430_000, output_tokens: 3_210_000,
          cache_read_tokens: 8_100_000, cache_creation_tokens: 1_500_000,
          session_count: 142, project_count: 8,
        });
      }
    } catch { /* ignore */ }
    setLoadingStats(false);
  }, []);

  const loadKeys = useCallback(async () => {
    if (!isTauri) return;
    const { invoke } = await import('@tauri-apps/api/core');
    const k = await invoke<Record<string, string>>('load_api_keys');
    setKeys(k);
  }, []);

  useEffect(() => { loadStats(); loadKeys(); }, []);

  const saveKey = async (service: string, key: string) => {
    if (!isTauri) return;
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('save_api_key', { service, key });
    setKeys(prev => ({ ...prev, [service]: key }));
    setStatuses(prev => ({ ...prev, [service]: 'idle' }));
  };

  const checkKey = async (service: string, key: string) => {
    setStatuses(prev => ({ ...prev, [service]: 'checking' }));
    try {
      let ok = false;
      if (service === 'claude') {
        const r = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        });
        ok = r.ok;
      } else if (service === 'openai') {
        const r = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        ok = r.ok;
      }
      setStatuses(prev => ({ ...prev, [service]: ok ? 'ok' : 'fail' }));
    } catch {
      setStatuses(prev => ({ ...prev, [service]: 'fail' }));
    }
  };

  const cost = stats ? estimateCost(stats) : 0;
  const totalTokens = stats ? stats.input_tokens + stats.output_tokens : 0;

  return (
    <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>

      <div className="flex items-center gap-3 px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <Bot size={15} style={{ color: 'var(--muted)' }} />
        <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{t('ai_title')}</span>
        <button onClick={loadStats}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface2)] transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <RefreshCw size={11} className={loadingStats ? 'animate-spin' : ''} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      <div style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto' }}>
      <div className="p-4 flex flex-col gap-4">

        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

          <div className="flex items-center gap-2.5 px-4 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#a78bfa22', border: '1px solid #a78bfa44' }}>
              <ClaudeIcon size={13} />
            </div>
            <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>Claude Code</span>
            <span className="text-[10px] ml-1 px-2 py-0.5 rounded-md"
              style={{ background: '#a78bfa18', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
              {t('ai_local_scan')}
            </span>
            <span className="ml-auto text-[10px]" style={{ color: 'var(--muted)' }}>
              ~/.claude/projects/
            </span>
          </div>

          {loadingStats ? (
            <div className="flex items-center gap-2 px-4 py-6 text-[11px]" style={{ color: 'var(--muted)' }}>
              <RefreshCw size={12} className="animate-spin" />
              {t('ai_scanning')}
            </div>
          ) : stats ? (
            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t('ai_input_tokens'),  value: fmtTokens(stats.input_tokens),  color: '#58a6ff' },
                  { label: t('ai_output_tokens'), value: fmtTokens(stats.output_tokens), color: '#3fb950' },
                  { label: t('ai_est_cost'),       value: fmtCost(cost),                  color: '#f4d03f' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-3 border flex flex-col gap-1"
                    style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                    <div className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>{label}</div>
                    <div className="text-[18px] font-bold tabular-nums" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: t('ai_cache_read'),    value: fmtTokens(stats.cache_read_tokens),     color: '#bc8cff' },
                  { label: t('ai_cache_created'), value: fmtTokens(stats.cache_creation_tokens), color: '#ff8c3c' },
                  { label: t('ai_sessions'),      value: String(stats.session_count),             color: 'var(--text)' },
                  { label: t('ai_projects'),      value: String(stats.project_count),             color: 'var(--text)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl px-3 py-2 border flex flex-col gap-0.5"
                    style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                    <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</div>
                    <div className="text-[13px] font-bold tabular-nums" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>

              {totalTokens > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
                    <span>{t('ai_split')}</span>
                    <span className="tabular-nums">{fmtTokens(totalTokens)} {t('ai_total')}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.input_tokens / totalTokens) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #58a6ff, #3fb950)' }} />
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    {[
                      { dot: '#58a6ff', label: t('ai_input'),  val: fmtTokens(stats.input_tokens) },
                      { dot: '#3fb950', label: t('ai_output'), val: fmtTokens(stats.output_tokens) },
                    ].map(({ dot, label, val }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                        <span style={{ color: 'var(--muted)' }}>{label}</span>
                        <span className="font-semibold tabular-nums" style={{ color: dot }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[9px] pt-1 border-t" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                {t('ai_cost_note')}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-6 text-[11px]" style={{ color: 'var(--muted)' }}>
              <FolderOpen size={14} />
              {t('ai_no_sessions')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ServiceCard
            title="Claude API"
            accent="#a78bfa"
            icon={<ClaudeIcon size={14} />}
            savedKey={keys['claude'] ?? ''}
            status={statuses['claude'] ?? 'idle'}
            onSave={key => saveKey('claude', key)}
            onCheck={key => checkKey('claude', key)}>
            <div className="flex flex-col gap-1.5 text-[10px]" style={{ color: 'var(--muted)' }}>
              <div className="flex items-center gap-1.5">
                <Zap size={10} style={{ color: '#a78bfa' }} />
                <span>{t('ai_key_stored')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare size={10} style={{ color: '#a78bfa' }} />
                <span>{t('ai_get_key')} <span style={{ color: '#a78bfa' }}>console.anthropic.com</span></span>
              </div>
            </div>
          </ServiceCard>

          <ServiceCard
            title="OpenAI"
            accent="#10b981"
            icon={<OpenAIIcon size={14} />}
            savedKey={keys['openai'] ?? ''}
            status={statuses['openai'] ?? 'idle'}
            onSave={key => saveKey('openai', key)}
            onCheck={key => checkKey('openai', key)}>
            <div className="flex flex-col gap-1.5 text-[10px]" style={{ color: 'var(--muted)' }}>
              <div className="flex items-center gap-1.5">
                <Zap size={10} style={{ color: '#10b981' }} />
                <span>{t('ai_key_stored')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare size={10} style={{ color: '#10b981' }} />
                <span>{t('ai_get_key')} <span style={{ color: '#10b981' }}>platform.openai.com</span></span>
              </div>
            </div>
          </ServiceCard>
        </div>
      </div>
      </div>
    </div>
  );
}
