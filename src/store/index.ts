import { create } from 'zustand';
import type { SystemSnapshot } from '../lib/mock-stats';

export type Module =
  | 'overview' | 'cpu' | 'memory' | 'processes' | 'disk' | 'network'
  | 'gpu' | 'sensors' | 'devtools' | 'files' | 'ai';

const HISTORY_LEN = 60;

interface Store {
  activeModule: Module;
  setModule: (m: Module) => void;

  snapshot: SystemSnapshot | null;
  cpuHistory: number[];
  memHistory: number[];
  rxHistory:  number[];
  txHistory:  number[];
  setSnapshot: (s: SystemSnapshot) => void;

  sortProc: 'cpu' | 'mem';
  setSortProc: (s: 'cpu' | 'mem') => void;

  selectedPid: number | null;
  setSelectedPid: (pid: number | null) => void;
}

function pushHistory(arr: number[], val: number): number[] {
  const next = [...arr, val];
  if (next.length > HISTORY_LEN) next.shift();
  return next;
}

export const useStore = create<Store>((set, get) => ({
  activeModule: 'overview',
  setModule: (activeModule) => set({ activeModule }),

  snapshot:   null,
  cpuHistory: [],
  memHistory: [],
  rxHistory:  [],
  txHistory:  [],

  setSnapshot: (s) => {
    const { cpuHistory, memHistory, rxHistory, txHistory } = get();
    const memPct = s.mem.total > 0 ? (s.mem.used / s.mem.total) * 100 : 0;
    set({
      snapshot:   s,
      cpuHistory: pushHistory(cpuHistory, s.cpu.total),
      memHistory: pushHistory(memHistory, memPct),
      rxHistory:  pushHistory(rxHistory,  s.net.rx_sec),
      txHistory:  pushHistory(txHistory,  s.net.tx_sec),
    });
  },

  sortProc:       'cpu',
  setSortProc:    (sortProc) => set({ sortProc }),
  selectedPid:    null,
  setSelectedPid: (selectedPid) => set({ selectedPid }),
}));
