import * as PIXI from 'pixi.js';

export interface AnimationConfig {
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  fps: number;
  loop?: boolean;
}

export interface PetManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  defaultScale: number;
  animations: Record<string, { path: string; config: AnimationConfig }>;
  sounds?: Record<string, string>;
  personalityDefaults: {
    energy: number;
    hunger: number;
    happiness: number;
    sleepiness: number;
    curiosity: number;
    playfulness: number;
  };
}

export class AssetManager {
  private static spriteSheets: Map<string, PIXI.Spritesheet> = new Map();
  private static manifests: Map<string, PetManifest> = new Map();

  static async loadPetManifest(manifestUrl: string): Promise<PetManifest> {
    const response = await fetch(manifestUrl);
    const manifest: PetManifest = await response.json();
    this.manifests.set(manifest.id, manifest);
    return manifest;
  }

  static async loadSpriteSheet(key: string, imageUrl: string, config: AnimationConfig): Promise<PIXI.Spritesheet> {
    if (this.spriteSheets.has(key)) {
      return this.spriteSheets.get(key)!;
    }

    const baseTexture = PIXI.BaseTexture.from(imageUrl);
    const frames: Record<string, any> = {};

    for (let i = 0; i < config.totalFrames; i++) {
      const frameKey = `${key}_frame_${i}`;
      frames[frameKey] = {
        frame: {
          x: i * config.frameWidth,
          y: 0,
          w: config.frameWidth,
          h: config.frameHeight,
        },
        sourceSize: { w: config.frameWidth, h: config.frameHeight },
        spriteSourceSize: { x: 0, y: 0, w: config.frameWidth, h: config.frameHeight },
      };
    }

    const sheetData = {
      frames,
      animations: {
        [key]: Object.keys(frames),
      },
      meta: {
        image: imageUrl,
        size: { w: config.frameWidth * config.totalFrames, h: config.frameHeight },
        scale: '1',
      },
    };

    const spritesheet = new PIXI.Spritesheet(baseTexture, sheetData);
    await spritesheet.parse();
    this.spriteSheets.set(key, spritesheet);
    return spritesheet;
  }

  static getSpritesheet(key: string): PIXI.Spritesheet | undefined {
    return this.spriteSheets.get(key);
  }

  static getManifest(petId: string): PetManifest | undefined {
    return this.manifests.get(petId);
  }
}
