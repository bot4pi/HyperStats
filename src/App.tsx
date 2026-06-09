import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store';
import { MOCK_SNAPSHOT } from './lib/mock-stats';
import type { SystemSnapshot } from './lib/mock-stats';

import { Sidebar }          from './components/layout/Sidebar';
import { TopBar }           from './components/layout/TopBar';
import { OverviewModule }   from './components/modules/overview/OverviewModule';
import { CpuModule }        from './components/modules/cpu/CpuModule';
import { MemoryModule }     from './components/modules/memory/MemoryModule';
import { ProcessesModule }  from './components/modules/processes/ProcessesModule';
import { DiskModule }       from './components/modules/disk/DiskModule';
import { NetworkModule }    from './components/modules/network/NetworkModule';
import { GpuModule }        from './components/modules/gpu/GpuModule';
import { SensorsModule }    from './components/modules/sensors/SensorsModule';
import { DevToolsModule }   from './components/modules/devtools/DevToolsModule';
import { FilesModule }      from './components/modules/files/FilesModule';
import { AiModule }         from './components/modules/ai/AiModule';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const page = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.13, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -3, transition: { duration: 0.09 } },
};

export default function App() {
  const { activeModule, setSnapshot } = useStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let tick = 0;

    const poll = async () => {
      try {
        let data: SystemSnapshot;
        if (isTauri) {
          const { invoke } = await import('@tauri-apps/api/core');
          data = await invoke<SystemSnapshot>('get_snapshot');
        } else {
          tick++;
          data = {
            ...MOCK_SNAPSHOT,
            cpu: {
              ...MOCK_SNAPSHOT.cpu,
              total: 30 + Math.sin(tick * 0.15) * 20 + Math.random() * 8,
              cores: MOCK_SNAPSHOT.cpu.cores.map(c =>
                Math.max(0, Math.min(100, c + (Math.random() - 0.5) * 15))),
            },
            net: {
              ...MOCK_SNAPSHOT.net,
              rx_sec: Math.max(0, MOCK_SNAPSHOT.net.rx_sec + (Math.random() - 0.5) * 400_000),
              tx_sec: Math.max(0, MOCK_SNAPSHOT.net.tx_sec + (Math.random() - 0.5) * 100_000),
            },
            mem: {
              ...MOCK_SNAPSHOT.mem,
              used: MOCK_SNAPSHOT.mem.used + Math.floor((Math.random() - 0.5) * 50_000_000),
            },
            sensors: MOCK_SNAPSHOT.sensors.map(s => ({
              ...s,
              temp: Math.max(30, s.temp + (Math.random() - 0.5) * 3),
            })),
            gpus: MOCK_SNAPSHOT.gpus.map(g => ({
              ...g,
              vram_used: Math.max(0, g.vram_used + Math.floor((Math.random() - 0.5) * 50_000_000)),
            })),
            disks: MOCK_SNAPSHOT.disks.map(d => ({
              ...d,
              read_sec:  Math.max(0, d.read_sec  + Math.floor((Math.random() - 0.5) * 5_000_000)),
              write_sec: Math.max(0, d.write_sec + Math.floor((Math.random() - 0.5) * 2_000_000)),
            })),
            uptime: MOCK_SNAPSHOT.uptime + tick,
          };
        }
        setSnapshot(data);
      } catch (e) {
        console.error('poll error', e);
      }
    };

    poll();
    interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} className="absolute inset-0 flex overflow-hidden" {...page}>
              {activeModule === 'overview'  && <OverviewModule />}
              {activeModule === 'cpu'       && <CpuModule />}
              {activeModule === 'memory'    && <MemoryModule />}
              {activeModule === 'processes' && <ProcessesModule />}
              {activeModule === 'disk'      && <DiskModule />}
              {activeModule === 'network'   && <NetworkModule />}
              {activeModule === 'gpu'       && <GpuModule />}
              {activeModule === 'sensors'   && <SensorsModule />}
              {activeModule === 'devtools'  && <DevToolsModule />}
              {activeModule === 'files'     && <FilesModule />}
              {activeModule === 'ai'        && <AiModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
