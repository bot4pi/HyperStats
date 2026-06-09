export interface CpuStats  { cores: number[]; total: number; freq: number; name: string }
export interface MemStats  { total: number; used: number; available: number; swap_total: number; swap_used: number }
export interface NetStats  { rx_sec: number; tx_sec: number; total_rx: number; total_tx: number; iface: string }
export interface DiskInfo  { name: string; mount: string; fs: string; total: number; used: number; removable: boolean; read_sec: number; write_sec: number }
export interface ProcessInfo { pid: number; name: string; cpu: number; memory: number }
export interface ThermalSensor { label: string; temp: number; max: number; critical: number | null }
export interface GpuInfo { name: string; vram_total: number; vram_used: number; index: number }
export interface BatteryInfo { percentage: number; charging: boolean; time_remaining_secs: number | null }
export interface SystemSnapshot {
  cpu: CpuStats; mem: MemStats; net: NetStats;
  disks: DiskInfo[]; processes: ProcessInfo[];
  sensors: ThermalSensor[]; gpus: GpuInfo[];
  battery: BatteryInfo | null;
  process_count: number;
  uptime: number; os: string; hostname: string;
}

export interface DevTool { name: string; category: string; version: string | null; installed: boolean }

export interface FileEntry {
  name: string; path: string; size: number;
  is_dir: boolean; ext: string; modified: number; created: number;
}

const GB = 1024 ** 3;
const MB = 1024 ** 2;

export const MOCK_SNAPSHOT: SystemSnapshot = {
  cpu: {
    cores: [45, 32, 78, 12, 56, 89, 34, 67, 22, 71, 44, 58, 19, 83, 37, 61],
    total: 52, freq: 3800, name: 'Intel Core i9-13900K',
  },
  mem: {
    total: 32 * GB, used: 19 * GB, available: 13 * GB,
    swap_total: 16 * GB, swap_used: 2 * GB,
  },
  net: {
    rx_sec: 1_258_000, tx_sec: 312_000,
    total_rx: 3_420_000_000, total_tx: 890_000_000, iface: 'Ethernet',
  },
  disks: [
    { name: 'C:\\', mount: 'C:\\', fs: 'NTFS', total: 512 * GB, used: 234 * GB, removable: false, read_sec: 15 * MB, write_sec: 8 * MB },
    { name: 'D:\\', mount: 'D:\\', fs: 'NTFS', total: 2048 * GB, used: 840 * GB, removable: false, read_sec: 2 * MB, write_sec: 512 * 1024 },
  ],
  processes: [
    { pid: 5124, name: 'chrome.exe',         cpu: 14.2, memory: 2.1 * GB },
    { pid: 6280, name: 'code.exe',            cpu: 8.7,  memory: 1.1 * GB },
    { pid: 3540, name: 'explorer.exe',        cpu: 2.1,  memory: 420 * MB },
    { pid: 7108, name: 'discord.exe',         cpu: 1.8,  memory: 380 * MB },
    { pid: 2312, name: 'Telegram.exe',        cpu: 1.2,  memory: 290 * MB },
    { pid: 8820, name: 'System',              cpu: 0.9,  memory: 180 * MB },
    { pid: 4412, name: 'node.exe',            cpu: 0.7,  memory: 230 * MB },
    { pid: 9240, name: 'WindowsTerminal.exe', cpu: 0.4,  memory: 120 * MB },
    { pid: 1256, name: 'svchost.exe',         cpu: 0.3,  memory: 85 * MB },
    { pid: 3888, name: 'taskhostw.exe',       cpu: 0.1,  memory: 62 * MB },
  ],
  sensors: [
    { label: 'CPU Package',  temp: 64, max: 82, critical: 100 },
    { label: 'CPU Core #0',  temp: 62, max: 80, critical: 100 },
    { label: 'CPU Core #1',  temp: 61, max: 79, critical: 100 },
    { label: 'CPU Core #2',  temp: 70, max: 88, critical: 100 },
    { label: 'CPU Core #3',  temp: 59, max: 76, critical: 100 },
    { label: 'GPU',          temp: 68, max: 84, critical: 110 },
    { label: 'NVMe SSD',     temp: 42, max: 51, critical: 70 },
    { label: 'System Board', temp: 33, max: 38, critical: 80 },
  ],
  gpus: [
    { name: 'NVIDIA GeForce RTX 4080', vram_total: 16 * GB, vram_used: 6.2 * GB, index: 0 },
  ],
  battery: null,
  process_count: 312,
  uptime:   86400 * 2 + 3600 * 6 + 1440,
  os:       'Windows 11 Pro 23H2',
  hostname: 'COUP-PC',
};

export const MOCK_DEV_TOOLS: DevTool[] = [
  { name: 'Node.js',    category: 'runtime', version: 'v20.11.0',        installed: true  },
  { name: 'npm',        category: 'pkg',     version: '10.2.4',          installed: true  },
  { name: 'pnpm',       category: 'pkg',     version: '8.15.1',          installed: true  },
  { name: 'yarn',       category: 'pkg',     version: null,              installed: false },
  { name: 'Bun',        category: 'runtime', version: '1.0.25',          installed: true  },
  { name: 'Deno',       category: 'runtime', version: null,              installed: false },
  { name: 'Python',     category: 'lang',    version: 'Python 3.12.1',   installed: true  },
  { name: 'Python3',    category: 'lang',    version: null,              installed: false },
  { name: 'Rust',       category: 'lang',    version: 'rustc 1.76.0',    installed: true  },
  { name: 'Cargo',      category: 'pkg',     version: 'cargo 1.76.0',    installed: true  },
  { name: 'Go',         category: 'lang',    version: null,              installed: false },
  { name: 'Java',       category: 'lang',    version: null,              installed: false },
  { name: 'Ruby',       category: 'lang',    version: null,              installed: false },
  { name: 'PHP',        category: 'lang',    version: null,              installed: false },
  { name: 'Kotlin',     category: 'lang',    version: null,              installed: false },
  { name: 'Swift',      category: 'lang',    version: null,              installed: false },
  { name: 'Git',        category: 'vcs',     version: 'git version 2.43.0', installed: true },
  { name: 'GitHub CLI', category: 'vcs',     version: 'gh version 2.43.1',  installed: true },
  { name: 'Docker',     category: 'ops',     version: null,              installed: false },
  { name: 'kubectl',    category: 'ops',     version: null,              installed: false },
  { name: 'Terraform',  category: 'ops',     version: null,              installed: false },
  { name: 'AWS CLI',    category: 'ops',     version: null,              installed: false },
  { name: 'VS Code',    category: 'ide',     version: '1.86.0',          installed: true  },
  { name: 'Cursor',     category: 'ide',     version: '0.36.0',          installed: true  },
  { name: 'Neovim',     category: 'ide',     version: null,              installed: false },
  { name: 'Vim',        category: 'ide',     version: null,              installed: false },
  { name: 'Make',       category: 'build',   version: null,              installed: false },
  { name: 'CMake',      category: 'build',   version: null,              installed: false },
  { name: 'Ninja',      category: 'build',   version: null,              installed: false },
  { name: 'ffmpeg',     category: 'media',   version: null,              installed: false },
];

export function formatBytes(b: number, decimals = 1): string {
  if (b >= GB) return `${(b / GB).toFixed(decimals)} GB`;
  if (b >= MB) return `${(b / MB).toFixed(decimals)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(decimals)} KB`;
  return `${b} B`;
}

export function formatUptime(s: number): string {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function tempColor(t: number): string {
  if (t >= 90) return '#ff5050';
  if (t >= 75) return '#ff8c3c';
  if (t >= 60) return '#d29922';
  return '#3fb950';
}

export function fileTypeCategory(ext: string): string {
  const e = ext.toLowerCase();
  if (['jpg','jpeg','png','gif','bmp','svg','webp','ico','tiff','raw','heic'].includes(e)) return 'image';
  if (['mp4','mkv','avi','mov','wmv','flv','webm','m4v','mpg'].includes(e)) return 'video';
  if (['mp3','wav','flac','aac','ogg','wma','m4a'].includes(e)) return 'audio';
  if (['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','md','rtf','odt','pages'].includes(e)) return 'doc';
  if (['zip','rar','7z','tar','gz','bz2','xz','zst'].includes(e)) return 'archive';
  if (['js','ts','jsx','tsx','py','rs','go','cpp','c','h','java','cs','rb','php','swift','kt','lua','sh','ps1','bat'].includes(e)) return 'code';
  if (['json','yaml','yml','toml','xml','ini','env','conf','cfg'].includes(e)) return 'config';
  if (['exe','msi','dmg','deb','rpm','appimage'].includes(e)) return 'binary';
  if (e === '') return 'dir';
  return 'other';
}

export const FILE_TYPE_COLOR: Record<string, string> = {
  image:   '#bc8cff',
  video:   '#ff8c3c',
  audio:   '#d29922',
  doc:     '#58a6ff',
  archive: '#ff5050',
  code:    '#3fb950',
  config:  '#00d9ff',
  binary:  '#ff8c3c',
  dir:     '#d29922',
  other:   '#666e7a',
};
