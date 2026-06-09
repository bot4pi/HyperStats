use serde::Serialize;
use sysinfo::{System, Disks, Networks, Components, ProcessesToUpdate};
use std::sync::Mutex;

// ── Data types ─────────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct CpuStats {
    pub cores: Vec<f32>,
    pub total: f32,
    pub freq:  u64,
    pub name:  String,
}

#[derive(Serialize, Clone)]
pub struct MemStats {
    pub total:      u64,
    pub used:       u64,
    pub available:  u64,
    pub swap_total: u64,
    pub swap_used:  u64,
}

#[derive(Serialize, Clone)]
pub struct NetStats {
    pub rx_sec:   u64,
    pub tx_sec:   u64,
    pub total_rx: u64,
    pub total_tx: u64,
    pub iface:    String,
}

#[derive(Serialize, Clone)]
pub struct DiskInfo {
    pub name:      String,
    pub mount:     String,
    pub fs:        String,
    pub total:     u64,
    pub used:      u64,
    pub removable: bool,
    pub read_sec:  u64,
    pub write_sec: u64,
}

#[derive(Serialize, Clone)]
pub struct ProcessInfo {
    pub pid:    u32,
    pub name:   String,
    pub cpu:    f32,
    pub memory: u64,
}

#[derive(Serialize, Clone)]
pub struct ThermalSensor {
    pub label:    String,
    pub temp:     f32,
    pub max:      f32,
    pub critical: Option<f32>,
}

#[derive(Serialize, Clone)]
pub struct GpuInfo {
    pub name:       String,
    pub vram_total: u64,
    pub vram_used:  u64,
    pub index:      u32,
}

#[derive(Serialize, Clone)]
pub struct BatteryInfo {
    pub percentage:          f32,
    pub charging:            bool,
    pub time_remaining_secs: Option<u64>,
}

#[derive(Serialize, Clone)]
pub struct SystemSnapshot {
    pub cpu:           CpuStats,
    pub mem:           MemStats,
    pub net:           NetStats,
    pub disks:         Vec<DiskInfo>,
    pub processes:     Vec<ProcessInfo>,
    pub sensors:       Vec<ThermalSensor>,
    pub gpus:          Vec<GpuInfo>,
    pub battery:       Option<BatteryInfo>,
    pub process_count: u32,
    pub uptime:        u64,
    pub os:            String,
    pub hostname:      String,
}

#[derive(Serialize, Clone)]
pub struct DevTool {
    pub name:      String,
    pub category:  String,
    pub version:   Option<String>,
    pub installed: bool,
}

#[derive(Serialize, Clone)]
pub struct FileEntry {
    pub name:     String,
    pub path:     String,
    pub size:     u64,
    pub is_dir:   bool,
    pub ext:      String,
    pub modified: u64,
    pub created:  u64,
}

// ── State ──────────────────────────────────────────────────────────────────

pub struct SysState {
    sys:            Mutex<System>,
    nets:           Mutex<Networks>,
    disks:          Mutex<Disks>,
    components:     Mutex<Components>,
    prev_rx:        Mutex<u64>,
    prev_tx:        Mutex<u64>,
    poll_count:     Mutex<u64>,
    cached_gpus:    Mutex<Vec<GpuInfo>>,
    cached_battery: Mutex<Option<BatteryInfo>>,
}

impl Default for SysState {
    fn default() -> Self {
        let mut sys = System::new_all();
        sys.refresh_all();
        SysState {
            sys:            Mutex::new(sys),
            nets:           Mutex::new(Networks::new_with_refreshed_list()),
            disks:          Mutex::new(Disks::new_with_refreshed_list()),
            components:     Mutex::new(Components::new_with_refreshed_list()),
            prev_rx:        Mutex::new(0),
            prev_tx:        Mutex::new(0),
            poll_count:     Mutex::new(0),
            cached_gpus:    Mutex::new(vec![]),
            cached_battery: Mutex::new(None),
        }
    }
}

// ── GPU via DXGI (Windows only) ────────────────────────────────────────────

// PowerShell on Windows can output UTF-16 LE (with BOM) when piped.
// This helper handles both UTF-16 LE (BOM: FF FE) and plain UTF-8/ANSI.
fn parse_output(bytes: &[u8]) -> String {
    if bytes.len() >= 2 && bytes[0] == 0xFF && bytes[1] == 0xFE {
        let words: Vec<u16> = bytes[2..].chunks(2)
            .filter(|c| c.len() == 2)
            .map(|c| u16::from_le_bytes([c[0], c[1]]))
            .collect();
        String::from_utf16_lossy(&words).to_string()
    } else {
        String::from_utf8_lossy(bytes).to_string()
    }
}

#[cfg(target_os = "windows")]
fn get_gpus() -> Vec<GpuInfo> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    // Force UTF-8 output so parse_output works reliably even on localized Windows
    let ps_script =
        "[Console]::OutputEncoding = [Text.Encoding]::UTF8; Get-WmiObject Win32_VideoController | ForEach-Object { \"$($_.Name)|$($_.AdapterRAM)\" }";
    if let Ok(out) = std::process::Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", ps_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
    {
        if out.status.success() {
            let text = parse_output(&out.stdout);
            let gpus: Vec<GpuInfo> = text.lines()
                .enumerate()
                .filter_map(|(i, line)| {
                    let mut parts = line.splitn(2, '|');
                    let name = parts.next()?.trim().to_string();
                    if name.is_empty() { return None; }
                    let vram_total = parts.next()
                        .and_then(|s| s.trim().parse::<u64>().ok())
                        .unwrap_or(0);
                    Some(GpuInfo { name, vram_total, vram_used: 0, index: i as u32 })
                })
                .collect();
            if !gpus.is_empty() {
                // Try to fill vram_used via DXGI for each GPU
                return enrich_gpu_usage(gpus);
            }
        }
    }
    vec![]
}

#[cfg(target_os = "windows")]
fn enrich_gpu_usage(mut gpus: Vec<GpuInfo>) -> Vec<GpuInfo> {
    use windows::Win32::Graphics::Dxgi::*;
    use windows::core::Interface;
    let Ok(factory): windows::core::Result<IDXGIFactory1> =
        (unsafe { CreateDXGIFactory1() }) else { return gpus; };
    let mut idx = 0u32;
    loop {
        let Ok(adapter): windows::core::Result<IDXGIAdapter1> =
            (unsafe { factory.EnumAdapters1(idx) }) else { break; };
        if let Ok(a3) = adapter.cast::<IDXGIAdapter3>() {
            let mut local = DXGI_QUERY_VIDEO_MEMORY_INFO::default();
            if unsafe { a3.QueryVideoMemoryInfo(0, DXGI_MEMORY_SEGMENT_GROUP_LOCAL, &mut local) }.is_ok()
                && local.CurrentUsage > 0
            {
                if let Some(g) = gpus.get_mut(idx as usize) {
                    g.vram_used = local.CurrentUsage;
                }
            }
        }
        idx += 1;
    }
    gpus
}

#[cfg(not(target_os = "windows"))]
fn get_gpus() -> Vec<GpuInfo> { vec![] }

// ── Battery ────────────────────────────────────────────────────────────────

fn get_battery() -> Option<BatteryInfo> {
    use battery::units::ratio::percent;
    use battery::units::time::second;
    let manager = battery::Manager::new().ok()?;
    let b = manager.batteries().ok()?.next()?.ok()?;
    let pct = b.state_of_charge().get::<percent>();
    if pct.is_nan() { return None; }
    Some(BatteryInfo {
        percentage: pct.clamp(0.0, 100.0),
        charging:   b.state() == battery::State::Charging,
        time_remaining_secs: match b.state() {
            battery::State::Discharging => b.time_to_empty()
                .map(|t| t.get::<second>() as u64),
            battery::State::Charging => b.time_to_full()
                .map(|t| t.get::<second>() as u64),
            _ => None,
        },
    })
}

// ── Commands ───────────────────────────────────────────────────────────────

#[tauri::command]
fn get_snapshot(state: tauri::State<'_, SysState>) -> SystemSnapshot {
    let mut sys        = state.sys.lock().unwrap();
    let mut nets       = state.nets.lock().unwrap();
    let mut disks      = state.disks.lock().unwrap();
    let mut components = state.components.lock().unwrap();

    sys.refresh_cpu_all();
    sys.refresh_memory();
    sys.refresh_processes(ProcessesToUpdate::All);
    nets.refresh();
    disks.refresh();
    components.refresh();

    // CPU
    let cpus  = sys.cpus();
    let cores: Vec<f32> = cpus.iter().map(|c| c.cpu_usage()).collect();
    let total = if cores.is_empty() { 0.0 } else { cores.iter().sum::<f32>() / cores.len() as f32 };
    let freq  = cpus.first().map(|c| c.frequency()).unwrap_or(0);
    let name  = cpus.first().map(|c| c.brand().to_string()).unwrap_or_default();

    // Memory
    let mem = MemStats {
        total:      sys.total_memory(),
        used:       sys.used_memory(),
        available:  sys.available_memory(),
        swap_total: sys.total_swap(),
        swap_used:  sys.used_swap(),
    };

    // Network
    let (rx_total, tx_total): (u64, u64) = nets.iter()
        .map(|(_, d)| (d.total_received(), d.total_transmitted()))
        .fold((0, 0), |(a, b), (x, y)| (a + x, b + y));
    let iface = nets.iter()
        .max_by_key(|(_, d)| d.total_received())
        .map(|(n, _)| n.clone())
        .unwrap_or_else(|| "—".to_string());
    let prev_rx = *state.prev_rx.lock().unwrap();
    let prev_tx = *state.prev_tx.lock().unwrap();
    let rx_sec = rx_total.saturating_sub(prev_rx);
    let tx_sec = tx_total.saturating_sub(prev_tx);
    *state.prev_rx.lock().unwrap() = rx_total;
    *state.prev_tx.lock().unwrap() = tx_total;

    // Disks
    let disk_list: Vec<DiskInfo> = disks.iter().map(|d| {
        let total     = d.total_space();
        let available = d.available_space();
        DiskInfo {
            name:      d.name().to_string_lossy().to_string(),
            mount:     d.mount_point().to_string_lossy().to_string(),
            fs:        d.file_system().to_string_lossy().to_string(),
            total,
            used:      total.saturating_sub(available),
            removable: d.is_removable(),
            read_sec:  0,
            write_sec: 0,
        }
    }).collect();

    // Processes
    let process_count = sys.processes().len() as u32;
    let mut procs: Vec<ProcessInfo> = sys.processes().values().map(|p| ProcessInfo {
        pid:    p.pid().as_u32(),
        name:   p.name().to_string_lossy().to_string(),
        cpu:    p.cpu_usage(),
        memory: p.memory(),
    }).collect();
    procs.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap_or(std::cmp::Ordering::Equal));
    procs.truncate(25);

    // Thermal sensors
    let sensors: Vec<ThermalSensor> = components.iter().map(|c| ThermalSensor {
        label:    c.label().to_string(),
        temp:     c.temperature(),
        max:      c.max(),
        critical: c.critical(),
    }).collect();

    // GPU + battery — refresh every 5s (slow-changing)
    let poll = {
        let mut c = state.poll_count.lock().unwrap();
        *c += 1;
        *c
    };

    let gpus = if poll % 5 == 1 {
        let g = get_gpus();
        *state.cached_gpus.lock().unwrap() = g.clone();
        g
    } else {
        state.cached_gpus.lock().unwrap().clone()
    };

    let battery = if poll % 30 == 1 {
        let b = get_battery();
        *state.cached_battery.lock().unwrap() = b.clone();
        b
    } else {
        state.cached_battery.lock().unwrap().clone()
    };

    SystemSnapshot {
        cpu: CpuStats { cores, total, freq, name },
        mem,
        net: NetStats { rx_sec, tx_sec, total_rx: rx_total, total_tx: tx_total, iface },
        disks: disk_list,
        processes: procs,
        sensors,
        gpus,
        battery,
        process_count,
        uptime:   System::uptime(),
        os:       System::long_os_version().unwrap_or_default(),
        hostname: System::host_name().unwrap_or_default(),
    }
}

#[tauri::command]
fn kill_process(pid: u32, state: tauri::State<'_, SysState>) -> Result<(), String> {
    let sys = state.sys.lock().unwrap();
    let p   = sysinfo::Pid::from_u32(pid);
    match sys.process(p) {
        Some(proc) => { proc.kill(); Ok(()) }
        None => Err(format!("Process {pid} not found")),
    }
}

// ── Dev Tools detection ────────────────────────────────────────────────────

fn probe(cmd: &str, args: &[&str]) -> Option<String> {
    // On Windows: use cmd /C (resolves .cmd/.bat) and CREATE_NO_WINDOW (no flashing console)
    #[cfg(target_os = "windows")]
    let result = {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let mut cmd_args = vec!["/C", cmd];
        cmd_args.extend_from_slice(args);
        std::process::Command::new("cmd")
            .args(&cmd_args)
            .creation_flags(CREATE_NO_WINDOW)
            .output()
    };
    #[cfg(not(target_os = "windows"))]
    let result = std::process::Command::new(cmd).args(args).output();

    result.ok()
        .filter(|o| o.status.success())
        .map(|o| {
            let out = if !o.stdout.is_empty() {
                String::from_utf8_lossy(&o.stdout).to_string()
            } else {
                String::from_utf8_lossy(&o.stderr).to_string()
            };
            out.lines().next().unwrap_or("").trim().to_string()
        })
        .filter(|s| !s.is_empty())
}

#[tauri::command]
async fn detect_dev_tools() -> Vec<DevTool> {
    // (display_name, category, cmd, args)
    let specs: &[(&str, &str, &str, &[&str])] = &[
        ("Node.js",        "runtime",  "node",        &["--version"]),
        ("npm",            "pkg",      "npm",         &["--version"]),
        ("yarn",           "pkg",      "yarn",        &["--version"]),
        ("pnpm",           "pkg",      "pnpm",        &["--version"]),
        ("Bun",            "runtime",  "bun",         &["--version"]),
        ("Deno",           "runtime",  "deno",        &["--version"]),
        ("Python",         "lang",     "python",      &["--version"]),
        ("Python3",        "lang",     "python3",     &["--version"]),
        ("Rust",           "lang",     "rustc",       &["--version"]),
        ("Cargo",          "pkg",      "cargo",       &["--version"]),
        ("Go",             "lang",     "go",          &["version"]),
        ("Java",           "lang",     "java",        &["-version"]),
        ("Ruby",           "lang",     "ruby",        &["--version"]),
        ("PHP",            "lang",     "php",         &["--version"]),
        ("Kotlin",         "lang",     "kotlinc",     &["-version"]),
        ("Swift",          "lang",     "swift",       &["--version"]),
        ("Git",            "vcs",      "git",         &["--version"]),
        ("GitHub CLI",     "vcs",      "gh",          &["--version"]),
        ("Docker",         "ops",      "docker",      &["--version"]),
        ("kubectl",        "ops",      "kubectl",     &["version", "--client", "--short"]),
        ("Terraform",      "ops",      "terraform",   &["version", "-json"]),
        ("AWS CLI",        "ops",      "aws",         &["--version"]),
        ("VS Code",        "ide",      "code",        &["--version"]),
        ("Cursor",         "ide",      "cursor",      &["--version"]),
        ("Neovim",         "ide",      "nvim",        &["--version"]),
        ("Vim",            "ide",      "vim",         &["--version"]),
        ("Make",           "build",    "make",        &["--version"]),
        ("CMake",          "build",    "cmake",       &["--version"]),
        ("Ninja",          "build",    "ninja",       &["--version"]),
        ("ffmpeg",         "media",    "ffmpeg",      &["-version"]),
    ];

    specs.iter().map(|(name, cat, cmd, args)| {
        let version = probe(cmd, args);
        DevTool {
            name:      name.to_string(),
            category:  cat.to_string(),
            installed: version.is_some(),
            version,
        }
    }).collect()
}

// ── File sorter ────────────────────────────────────────────────────────────

#[tauri::command]
async fn scan_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let rd = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut entries = vec![];
    for e in rd.flatten() {
        let meta = match e.metadata() {
            Ok(m) => m,
            Err(_) => continue,
        };
        let name = e.file_name().to_string_lossy().to_string();
        let ext = if meta.is_file() {
            std::path::Path::new(&name)
                .extension()
                .map(|x| x.to_string_lossy().to_lowercase().to_string())
                .unwrap_or_default()
        } else {
            String::new()
        };
        let modified = meta.modified().ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs()).unwrap_or(0);
        let created = meta.created().ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs()).unwrap_or(0);
        entries.push(FileEntry {
            path:    e.path().to_string_lossy().to_string(),
            size:    if meta.is_file() { meta.len() } else { 0 },
            is_dir:  meta.is_dir(),
            modified,
            created,
            ext,
            name,
        });
    }
    Ok(entries)
}

#[tauri::command]
async fn move_file(from: String, to: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&to).parent() {
        std::fs::create_dir_all(parent).ok();
    }
    std::fs::rename(&from, &to).map_err(|e| e.to_string())
}

#[tauri::command]
async fn make_dir(path: String) -> Result<(), String> {
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())
}

// ── AI stats ──────────────────────────────────────────────────────────────

#[derive(Serialize, Clone, Default)]
pub struct ClaudeCodeStats {
    pub input_tokens:          u64,
    pub output_tokens:         u64,
    pub cache_read_tokens:     u64,
    pub cache_creation_tokens: u64,
    pub session_count:         u64,
    pub project_count:         u64,
}

#[tauri::command]
fn get_claude_code_stats() -> ClaudeCodeStats {
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_default();
    let projects_dir = std::path::Path::new(&home).join(".claude").join("projects");

    let mut stats = ClaudeCodeStats::default();
    let Ok(projects) = std::fs::read_dir(&projects_dir) else { return stats; };

    for project in projects.flatten() {
        if !project.path().is_dir() { continue; }
        stats.project_count += 1;
        let Ok(sessions) = std::fs::read_dir(project.path()) else { continue; };
        for session in sessions.flatten() {
            let path = session.path();
            if path.extension().and_then(|e| e.to_str()) != Some("jsonl") { continue; }
            stats.session_count += 1;
            let Ok(content) = std::fs::read_to_string(&path) else { continue; };
            for line in content.lines() {
                let Ok(val) = serde_json::from_str::<serde_json::Value>(line) else { continue; };
                let usage = val.pointer("/message/usage")
                    .or_else(|| val.pointer("/usage"));
                let Some(u) = usage else { continue; };
                stats.input_tokens          += u.get("input_tokens").and_then(|v| v.as_u64()).unwrap_or(0);
                stats.output_tokens         += u.get("output_tokens").and_then(|v| v.as_u64()).unwrap_or(0);
                stats.cache_read_tokens     += u.get("cache_read_input_tokens").and_then(|v| v.as_u64()).unwrap_or(0);
                stats.cache_creation_tokens += u.get("cache_creation_input_tokens").and_then(|v| v.as_u64()).unwrap_or(0);
            }
        }
    }
    stats
}

fn keys_file() -> std::path::PathBuf {
    let base = std::env::var("APPDATA").unwrap_or_default();
    std::path::Path::new(&base).join("HyperStats").join("keys.json")
}

#[tauri::command]
fn save_api_key(service: String, key: String) -> Result<(), String> {
    let path = keys_file();
    std::fs::create_dir_all(path.parent().unwrap()).ok();
    let mut map: std::collections::HashMap<String, String> =
        std::fs::read_to_string(&path).ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();
    if key.is_empty() { map.remove(&service); } else { map.insert(service, key); }
    let json = serde_json::to_string(&map).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_api_keys() -> std::collections::HashMap<String, String> {
    std::fs::read_to_string(keys_file()).ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

// ── Entrypoint ─────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SysState::default())
        .invoke_handler(tauri::generate_handler![
            get_snapshot,
            kill_process,
            detect_dev_tools,
            scan_dir,
            move_file,
            make_dir,
            get_claude_code_stats,
            save_api_key,
            load_api_keys,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
