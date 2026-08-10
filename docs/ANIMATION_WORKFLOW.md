# Project Neko: Asset Pipeline & Animation Workflow

This document outlines the standard workflow for designing, slicing, and registering new pets and animations for **Project Neko**. All community contributors must adhere to these guidelines to ensure visual consistency, performance, and adherence to our originality policy.

---

## 1. Originality Policy

In accordance with Project Neko's strict open-source policy, **all pixel art, character designs, sprite sheets, and animations must be created completely from scratch**. 

- Do **NOT** trace, extract, or adapt assets from existing software (such as Comnyang or commercial desktop pets).
- Every pet must possess its own unique personality, proportions, color palette, and animation timing.
- All artwork must be legally distributable under the **MIT License**.

---

## 2. Canvas & Frame Specifications

To maintain a unified visual style across all desktop pets in the engine, artists must follow these strict grid dimensions:

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Grid Resolution** | $128 \times 128$ pixels per frame | Scalable via engine configuration |
| **Color Palette** | Custom defined per pet (max 64 colors) | No dither-heavy gradients; clean pixel shading |
| **Background** | Fully transparent (`RGBA: 0,0,0,0`) | No background patterns or solid fills |
| **Pivot Point** | Bottom-center (`anchor.set(0.5, 1.0)`) | Ensures correct floor positioning |
| **Layout** | Horizontal strip | Frames arranged sequentially from left to right |

---

## 3. Required Animation States

Every pet integrated into Project Neko must implement the following base animation states:

1. **`idle`**: Resting posture, blinking, or subtle breathing (recommended: 4 frames, 6 FPS, looping).
2. **`walk`**: Lateral walking cycle across the desktop (recommended: 6 frames, 8 FPS, looping).
3. **`sleep`**: Curled or resting posture during low energy states (recommended: 4 frames, 3 FPS, looping).
4. **`stretch`**: Back arching and paw extension transition (recommended: 4 frames, 6 FPS, non-looping).
5. **`look`**: Head turning to observe surroundings (recommended: 4 frames, 6 FPS, looping).

---

## 4. Asset Pipeline Tooling

Project Neko includes an internal automated asset processing script (`process_sprites.py`) built with Python and Pillow. 

### How to Process Raw Sprite Sheets:
1. Place raw horizontal sprite sheets into `src/assets/pets/{pet_id}/sprites/`.
2. Configure frame counts and target resolutions in the processing script.
3. Run the processing utility:
   ```bash
   python3 process_sprites.py
   ```
4. The script automatically crops excess boundaries, normalizes transparency, scales to the standardized $128 \times 128$ grid per frame, and outputs clean production-ready sprite sheets (`_final.png`).

---

## 5. Pet Manifest Configuration (`manifest.json`)

Each pet requires a `manifest.json` file defining its metadata, scale, sound mappings, and animation configurations:

```json
{
  "id": "neko",
  "name": "Neko the Cat",
  "version": "1.0.0",
  "author": "Project Neko Contributors",
  "defaultScale": 1.0,
  "animations": {
    "idle": {
      "path": "sprites/neko_idle_final.png",
      "config": { "frameWidth": 128, "frameHeight": 128, "totalFrames": 4, "fps": 6, "loop": true }
    }
  },
  "personalityDefaults": {
    "energy": 100,
    "hunger": 0,
    "happiness": 100,
    "sleepiness": 0,
    "curiosity": 0.8,
    "playfulness": 0.7
  }
}
```

---

## 6. References

- [1] PixiJS Documentation. [Spritesheet Parsing & Animation Rendering](https://pixijs.com/).
- [2] Electron Open Source Desktop Standards. [Transparent Frameless Window Overlay Architecture](https://www.electronjs.org/docs/latest).
