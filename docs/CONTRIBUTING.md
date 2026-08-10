# Contributing to Project Neko

Thank you for your interest in contributing to **Project Neko**! We welcome contributions from developers, animators, and open-source enthusiasts.

---

## Code of Conduct & Originality Policy

By participating in this project, you agree to abide by our strict **Originality Policy**:
- All code, scripts, documentation, and pixel-art assets **must be created from scratch**.
- Do **NOT** copy or extract assets from proprietary software or existing desktop pets (such as Comnyang).
- All contributions are licensed under the **MIT License**.

---

## How to Contribute

### 1. Adding a New Pet
To add a new pet (e.g., a fox or penguin) to the engine:
1. Create a new directory under `src/assets/pets/{pet_id}/`.
2. Generate or handcraft your original sprite sheets following the specifications in [Animation Workflow](ANIMATION_WORKFLOW.md).
3. Create a `manifest.json` file defining metadata, scales, and animation configurations.
4. Register the pet in the engine configuration.

### 2. Developing Plugins
Plugins communicate with the engine via the centralized `EventBus`. To create a plugin:
1. Implement the `Plugin` interface in `src/renderer/plugins/`.
2. Register event listeners for engine hooks (e.g., `plugin:loaded`, pet state changes).
3. Submit your plugin via a Pull Request.

---

## Pull Request Guidelines
1. Fork the repository and create your feature branch (`git checkout -b feature/amazing-pet`).
2. Ensure strict TypeScript type safety (`pnpm lint`).
3. Commit your changes with clear, descriptive commit messages.
4. Open a Pull Request detailing your implementation.
