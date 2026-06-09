import { motion } from 'framer-motion';
import {
  LayoutDashboard, Cpu, MemoryStick, HardDrive, Wifi, List,
  Monitor, Thermometer, Code2, FolderOpen, Bot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../../store';
import type { Module } from '../../store';
import { useI18n } from '../../i18n';

interface NavItem { id: Module; labelKey: string; Icon: LucideIcon; color: string }

const NAV: NavItem[] = [
  { id: 'overview',  labelKey: 'nav_overview',  Icon: LayoutDashboard, color: '#00d9ff' },
  { id: 'cpu',       labelKey: 'nav_cpu',       Icon: Cpu,             color: '#ff8c3c' },
  { id: 'memory',    labelKey: 'nav_memory',    Icon: MemoryStick,     color: '#bc8cff' },
  { id: 'disk',      labelKey: 'nav_disk',      Icon: HardDrive,       color: '#3fb950' },
  { id: 'network',   labelKey: 'nav_network',   Icon: Wifi,            color: '#d29922' },
  { id: 'processes', labelKey: 'nav_processes', Icon: List,            color: '#58a6ff' },
  { id: 'gpu',       labelKey: 'nav_gpu',       Icon: Monitor,         color: '#ff5080' },
  { id: 'sensors',   labelKey: 'nav_sensors',   Icon: Thermometer,     color: '#ff6b35' },
  { id: 'devtools',  labelKey: 'nav_devtools',  Icon: Code2,           color: '#a8dadc' },
  { id: 'files',     labelKey: 'nav_files',     Icon: FolderOpen,      color: '#f4d03f' },
  { id: 'ai',        labelKey: 'nav_ai',        Icon: Bot,             color: '#a78bfa' },
];

export function Sidebar() {
  const { activeModule, setModule } = useStore();
  const { t } = useI18n();

  return (
    <nav className="flex flex-col w-[58px] shrink-0 border-r overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center justify-center h-11 shrink-0 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="1" width="8" height="8" rx="2"
            fill="#00d9ff" opacity="0.9"
            style={{ filter: 'drop-shadow(0 0 4px #00d9ff88)' }} />
          <rect x="13" y="1" width="8" height="8" rx="2" fill="#00d9ff" opacity="0.5" />
          <rect x="1" y="13" width="8" height="8" rx="2" fill="#00d9ff" opacity="0.5" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#00d9ff" opacity="0.3" />
        </svg>
      </div>

      {/* Nav items — scrollable */}
      <div className="flex-1 overflow-y-auto py-1 flex flex-col gap-0.5 px-1.5">
        {NAV.map(({ id, labelKey, Icon, color }) => {
          const active = activeModule === id;
          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModule(id)}
              title={t(labelKey)}
              className="relative w-full h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: active ? color + '1a' : 'transparent',
                border: `1px solid ${active ? color + '44' : 'transparent'}`,
              }}>
              <Icon
                size={16}
                style={{ color: active ? color : 'var(--muted)', transition: 'color 0.15s' }} />
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
