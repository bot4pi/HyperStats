<div align="center">

<img src="src-tauri/icons/icon.png" width="96" alt="HyperStats icon"/>

# HyperStats

**A sleek, fast system monitor for Windows — built with Tauri 2 + React**

[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)](https://github.com/bot4pi/HyperStats/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4?style=flat-square&logo=windows&logoColor=white)](https://github.com/bot4pi/HyperStats/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-2021-CE422B?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)

</div>

---

## Features

| Module | Description |
|---|---|
| **Overview** | Live CPU, RAM, Disk and Network summary at a glance |
| **CPU** | Per-core usage, frequency, thread count, uptime |
| **Memory** | Used / Free / Available with live bar chart |
| **GPU** | VRAM usage, adapter info via DXGI — real hardware data |
| **Disk** | Read / Write speeds, total space per volume |
| **Network** | Upload / Download throughput, interface info |
| **Processes** | Running process list with CPU and memory usage |
| **Sensors** | Temperature sensors, hottest component, battery status |
| **Dev Tools** | Scan installed runtimes, languages, IDEs and CLI tools |
| **Files** | Quick file browser with sorting and grouping |
| **AI** | Claude Code token tracker + API key manager for Claude & OpenAI |

### Highlights

- **Native performance** — Rust backend via Tauri, no Electron overhead
- **Live charts** — smooth animated graphs powered by Framer Motion
- **Real GPU stats** — VRAM used/free via Windows DXGI API
- **Battery & thermal** — sensor readings with battery time remaining
- **Dev tool scanner** — detects Node, Python, Go, Rust, Git, Docker and 30+ more
- **i18n** — full translations: 🇬🇧 EN · 🇷🇺 RU · 🇺🇦 UK · 🇨🇳 ZH · 🇯🇵 JA · 🇮🇳 HI
- **Dark UI** — minimal dark theme, native window chrome

---

## Tech Stack

<div align="center">

[![My Skills](https://skillicons.dev/icons?i=tauri,rust,react,ts,tailwind,vite&theme=dark)](https://skillicons.dev)

</div>

| Layer | Technology |
|---|---|
| Shell | [Tauri 2](https://tauri.app) |
| Backend | Rust · `sysinfo` · `battery` · `windows` (DXGI) |
| Frontend | React 19 · TypeScript · Tailwind CSS 4 · Vite 7 |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) (stable)
- Windows 10 / 11
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) runtime (pre-installed on Windows 11)

> **Windows GNU toolchain users:** if you use `stable-x86_64-pc-windows-gnu` you need [MSYS2](https://www.msys2.org) with `mingw-w64-x86_64-gcc` installed. Create `.cargo/config.toml` locally (it is git-ignored) pointing to your GCC:
> ```toml
> [target.x86_64-pc-windows-gnu]
> linker = "C:\\msys64\\mingw64\\bin\\gcc.exe"
> ar     = "C:\\msys64\\mingw64\\bin\\ar.exe"
> ```

### Install & Run

```bash
# Clone
git clone https://github.com/bot4pi/HyperStats.git
cd HyperStats

# Install JS dependencies
npm install

# Development (hot-reload)
npm run tauri dev

# Production build
npm run tauri build
```

Built installers will appear in `src-tauri/target/release/bundle/`:
- `*.msi` — Windows Installer
- `*-setup.exe` — NSIS installer

---

## Project Structure

```
HyperStats/
├── src/                        # React frontend
│   ├── components/
│   │   ├── layout/             # Sidebar, TopBar
│   │   ├── modules/            # One folder per module (cpu, gpu, memory…)
│   │   └── shared/             # Charts, reusable UI
│   ├── i18n/                   # Translation strings (EN/RU/UK/ZH/JA/HI)
│   ├── store/                  # Zustand global state
│   └── lib/                    # Mock data for browser dev
├── src-tauri/
│   ├── src/
│   │   └── lib.rs              # All Tauri commands (stats, GPU, dev tools…)
│   ├── icons/                  # App icons
│   └── tauri.conf.json         # Tauri configuration
├── public/
├── package.json
└── vite.config.ts
```

---

## Localization

HyperStats ships with built-in translations for 6 languages. The language switcher is in the top bar — selection is persisted to `localStorage`.

To add a new language, extend the `DICT` object in `src/i18n/index.tsx`.

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
Made with Tauri + Rust + React
</div>
