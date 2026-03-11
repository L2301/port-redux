# Port

A desktop application for running and managing [Urbit](https://urbit.org) ships. Port lets you spin up, access, and manage comets, planets, moons, and stars without any command-line knowledge.

**Now updated for Vere v4.x** (the modern Urbit runtime) with builds for **Linux**, **macOS**, and **Windows**.

## Installing

Head over to [releases](https://github.com/L2301/port-redux/releases) and download the installer for your operating system.

| Platform | Format |
|----------|--------|
| macOS (Intel) | `.dmg` |
| macOS (Apple Silicon) | `.dmg` (arm64) |
| Linux | `.deb`, `.rpm`, `.zip` |
| Windows | `.exe` (Squirrel installer) |

## Development

### Requirements

- **Node.js** v20+ (see `.nvmrc`)
- **npm** (ships with Node.js)
- Build tools for native modules (`node-gyp`):
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `build-essential`, `python3`
  - **Windows**: Visual Studio Build Tools + Python 3

### Setup

```bash
# Clone the repository
git clone https://github.com/L2301/port-redux.git
cd port-redux

# Install dependencies
npm install

# Download Vere binaries for your platform
./get-vere.sh

# Start the development server
npm start
```

### Building

```bash
# Package for current platform
npm run package

# Build distributable for specific platforms
npm run make:mac        # macOS x64 (.dmg)
npm run make:mac-arm    # macOS ARM64 (.dmg)
npm run make:linux      # Linux x64 (.deb, .rpm, .zip)
npm run make:win        # Windows x64 (.exe)

# Build all platforms
npm run make:all
```

### Downloading Vere Binaries

The `get-vere.sh` script downloads [Vere](https://github.com/urbit/vere) (the Urbit runtime) binaries for all platforms:

```bash
# Download latest Vere binaries
./get-vere.sh

# Download a specific version
./get-vere.sh v4.3
```

Binaries are placed in `resources/{mac,linux,win}/` and bundled into the app during packaging.

## Architecture

Port uses a three-process Electron architecture based on [The Secret of Good Electron Apps](https://archive.jlongster.com/secret-of-good-electron-apps):

```
src/
├── main/                    # Electron main process
│   ├── index.ts             # App entry point, window lifecycle
│   ├── main-window.ts       # Main window creation and management
│   ├── terminal-service.ts  # PTY-based terminal windows
│   ├── os-service-helper.ts # IPC handlers for OS operations
│   ├── setting-service-helper.ts  # Keyboard shortcuts, protocol handling
│   ├── cleanup.ts           # Graceful shutdown
│   ├── helpers.ts           # Navigation, protocol links, zoom
│   ├── menu.ts              # Application menu
│   └── context-menu.ts      # Right-click context menus
│
├── background/              # Hidden background process (business logic)
│   ├── main.ts              # Service initialization, IPC server setup
│   ├── db/
│   │   └── index.ts         # NeDB database (settings, piers, logs)
│   ├── server/
│   │   ├── ipc.ts           # Node-IPC server for RPC communication
│   │   └── server.html      # Hidden window HTML shell
│   └── services/
│       ├── pier-service.ts      # Ship lifecycle (boot, stop, spawn Vere)
│       ├── os-service.ts        # OS interactions (dialogs, views)
│       └── settings-service.ts  # Settings persistence
│
├── renderer/                # React front-end
│   ├── renderer.tsx         # React 18 entry point
│   ├── App.tsx              # Root component, router, state
│   ├── client/
│   │   ├── preload.ts       # Preload script for IPC setup
│   │   ├── ipc.ts           # Client-side IPC wrapper
│   │   └── find-open-socket.ts  # IPC socket discovery
│   ├── pages/               # Top-level pages
│   ├── ship/                # Ship management components
│   ├── details/             # Ship setup forms
│   ├── shared/              # Reusable UI components
│   ├── terminal/            # Terminal window (xterm.js)
│   ├── alerts/              # Notification components
│   ├── icons/               # SVG icons
│   └── styles/              # CSS (Tailwind)
│
└── get-platform.js          # Platform detection utility
```

### Main Process (`src/main/`)

Creates and manages windows, handles OS-level features (menus, shortcuts, protocol links), and manages the app lifecycle. Delegates all business logic to the background process.

### Background Process (`src/background/`)

Runs in a hidden `BrowserWindow`. Contains all the heavy lifting:
- **PierService**: Manages ship lifecycle — spawning Vere processes, monitoring ports, handling boot/stop, error recovery
- **SettingsService**: Persists user preferences via NeDB
- **OSService**: Proxies OS operations (file dialogs, view management) to the main process
- **IPC Server**: Custom Node-IPC based RPC system connecting renderer <-> background <-> main

### Renderer (`src/renderer/`)

React 18 application using:
- **React Router v5** for navigation
- **React Query** for server state (pier data from background process)
- **Zustand** for client state
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives

### Urbit/Vere Integration

Port manages Urbit ships by:
1. Downloading platform-specific Vere binaries (`get-vere.sh`)
2. Spawning Vere as a child process with appropriate flags
3. Monitoring `.http.ports` file to detect when a ship is running
4. Communicating with running ships via the Dojo HTTP API (`localhost:{loopbackPort}`)
5. Supporting graceful shutdown via `+hood/exit`

### Data Flow

```
Renderer (React)  ──IPC──>  Background (Services)  ──spawn──>  Vere Process
     │                           │                                  │
     │<──push/reply──            │<──HTTP Dojo API──                │
     │                           │                                  │
     │                      NeDB Database                    .http.ports
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 33 |
| Build | Electron Forge 7 + Webpack |
| UI | React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 + React Query 3 |
| Database | NeDB (embedded) |
| IPC | Node-IPC |
| Terminal | xterm.js 5 + node-pty |
| Urbit Runtime | Vere v4.x |

## License

MIT
