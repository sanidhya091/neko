# Project Neko: Open-Source Desktop Pet Engine

> A production-quality, cross-platform, extensible desktop pet engine built with Electron [1], React, TypeScript, Vite, and PixiJS [2].

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28.2-brightgreen.svg)
![PixiJS](https://img.shields.io/badge/PixiJS-7.3-orange.svg)

---

## 🌟 Overview

**Project Neko** is a modular, high-performance desktop pet engine designed to bring life, personality, and interactivity to your operating system. Unlike traditional static desktop companions, Project Neko is engineered as a robust software engine supporting custom pets, Finite State Machine (FSM) AI behaviors, internal mood/energy stats, sound integration, and an event-driven plugin architecture.

Shipped with an original, handcrafted pixel-art cat (*Neko*) and licensed under the permissive **MIT License**, the engine serves as both a delightful desktop utility and a vibrant open-source playground for developers and digital artists.

---

## 🚀 Key Features

- **GPU-Accelerated Rendering**: Powered by PixiJS [2] with optimized sprite-sheet batching, transparent window overlays, and low idle CPU usage.
- **Finite State Machine (FSM) AI**: Non-hardcoded behavior trees controlling idle states, walking, sleeping, stretching, and looking around.
- **Personality & Mood Systems**: Dynamic stats for energy, hunger, happiness, and sleepiness that influence pet behavior in real time.
- **Extensible Plugin Architecture**: Event-driven bridge allowing third-party integrations (IDE build statuses, music players, battery monitors, productivity timers).
- **Modding Support**: Easily add new pets, custom sprite sheets, and sound effects via external JSON manifests without altering core engine code.
- **Strict Originality Policy**: 100% original artwork, codebase, and documentation free from copyrighted or extracted assets.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Wrapper** | Electron [1] | Transparent, frameless always-on-top desktop overlay |
| **UI Framework** | React [3] + Vite | Modern renderer UI and settings management |
| **Language** | TypeScript [4] | Strict type safety across main and renderer processes |
| **Graphics Engine** | PixiJS [2] | High-performance WebGL sprite rendering and animation |
| **State Management**| Zustand [5] | Lightweight reactive state management |

---

## ⚙️ Installation & Development

To run Project Neko locally from source, ensure you have **Node.js (>= 18)** and **pnpm** installed.

```bash
# Clone the repository
git clone https://github.com/project-neko/project-neko.git
cd project-neko

# Install dependencies
pnpm install

# Start development server and Electron overlay
pnpm dev
```

---

## 📂 Project Structure

```tree
project-neko/
├── src/
│   ├── main/          # Electron main process (overlay window management)
│   ├── renderer/      # React renderer UI & PixiJS integration
│   │   ├── engine/    # Core engine (FSM, Animation, Behavior, EventBus, AssetManager)
│   │   ├── store/     # State management
│   │   └── plugins/   # Plugin system hooks
│   ├── shared/        # Shared TypeScript types and IPC contracts
│   └── assets/        # Pet assets, sprite sheets, and manifests
├── docs/              # Architecture, contributing, and animation guides
└── package.json
```

---

## 🤝 Contributing

We warmly welcome contributions from developers, animators, and designers! Please review our [Contributing Guide](docs/CONTRIBUTING.md) and [Animation Workflow](docs/ANIMATION_WORKFLOW.md) before submitting pull requests. All new pets and code must adhere to our strict originality policy.

---

## 📄 License

Project Neko is open-source software released under the [MIT License](LICENSE).

---

## 📚 References

- [1] Electron Documentation. [Process Model and Frameless Transparent Windows](https://www.electronjs.org/docs/latest).
- [2] PixiJS API Reference. [WebGL 2D Rendering and AnimatedSprite Handling](https://pixijs.com/).
- [3] React Documentation. [Declarative UI Component Architecture](https://react.dev/).
- [4] TypeScript Documentation. [Typed JavaScript at Any Scale](https://www.typescriptlang.org/).
- [5] Zustand Documentation. [Small, Fast, and Scalable State-Management Solution](https://github.com/pmndrs/zustand).
