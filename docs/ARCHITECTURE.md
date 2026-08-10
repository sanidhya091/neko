# Project Neko: Architecture & System Design

This document details the software architecture, core subsystems, and design patterns powering **Project Neko**.

---

## 1. Architectural Philosophy

Project Neko is structured as a decoupled **Desktop Pet Engine** rather than a monolithic application. The core engine is agnostic of specific pet species, skins, or plugins. Pets, animations, moods, and integrations interact with the engine via well-defined interfaces, event buses, and JSON manifests.

```
┌─────────────────────────────────────────────────────────────┐
│                        Electron Shell                       │
│  (Transparent, Frameless, Always-on-Top Desktop Overlay)    │
└──────────────┬───────────────────────────────┬──────────────┘
               │ IPC                           │ Renderer
┌──────────────▼──────────────┐       ┌────────▼──────────────┐
│       Main Process          │       │    Renderer Process   │
│  - Window Management        │       │  - React UI Overlays  │
│  - System Tray / IPC        │       │  - PixiJS WebGL Canvas│
└─────────────────────────────┘       └────────┬──────────────┘
                                               │
               ┌───────────────────────────────┴───────────────┐
               │              Core Engine Systems              │
               ├──────────────────┬────────────────────────────┤
               │ AssetManager     │ Loads sprite sheets & json │
               │ AnimationEngine  │ Handles frames, fps, scale │
               │ FiniteStateMachine│ Manages pet behavioral FSM│
               │ BehaviorEngine   │ AI decision making & path  │
               │ PluginManager    │ Event-driven integrations  │
               │ SoundManager     │ Audio feedback & triggers  │
               └──────────────────┴────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Rendering Engine (`AnimationEngine.ts`, `AssetManager.ts`)
Built on **PixiJS**, the rendering engine bypasses DOM manipulation entirely, utilizing hardware-accelerated WebGL rendering for zero-lag sprite animation. It supports dynamic scaling, sprite flipping (facing direction), frame interpolation, and automatic idle FPS throttling to minimize CPU usage.

### B. Finite State Machine & AI Behavior (`FSM.ts`, `BehaviorEngine.ts`)
Pets operate on a robust **Finite State Machine (FSM)**. Behaviors such as `idle`, `walking`, `sleeping`, `stretching`, and `looking_around` are encapsulated as discrete state objects with lifecycle hooks (`enter`, `update`, `exit`). Transition rules are evaluated based on internal mood stats, timer durations, and probabilistic personality weights.

### C. Personality & Mood Systems (`PluginSystem.ts`)
Every pet maintains internal state variables (`energy`, `hunger`, `happiness`, `sleepiness`) that evolve over time. Personality profiles (`lazy`, `chaotic`, `curious`, `shy`, `playful`) modulate transition weights and movement velocities, ensuring that no two pets behave identically.

### D. Event Bus & Plugin Architecture (`EventBus.ts`, `PluginManager.ts`)
The engine features a centralized pub/sub **Event Bus**. Third-party plugins (such as IDE build status monitors, music player sync, or battery trackers) can emit and listen to events without coupling directly to the rendering or core pet logic.

---

## 3. References

- [1] Gamma, E., et al. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. (State Pattern & Event-Driven Architecture).
- [2] PixiJS Documentation. [High-Performance 2D WebGL Rendering Pipeline](https://pixijs.com/).
