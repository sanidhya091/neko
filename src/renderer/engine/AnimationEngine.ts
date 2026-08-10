import * as PIXI from 'pixi.js';
import { AssetManager } from './AssetManager';

export class AnimationEngine {
  private container: PIXI.Container;
  private animatedSprite: PIXI.AnimatedSprite | null = null;
  private currentAnimKey: string = '';

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  async play(animKey: string, spritesheetKey: string, fps: number = 8, loop: boolean = true): Promise<void> {
    if (this.currentAnimKey === animKey && this.animatedSprite && this.animatedSprite.playing) {
      return;
    }

    const spritesheet = AssetManager.getSpritesheet(spritesheetKey);
    if (!spritesheet) {
      console.error(`Spritesheet not found for key: ${spritesheetKey}`);
      return;
    }

    const textures = spritesheet.animations[spritesheetKey];
    if (!textures) {
      console.error(`Animation frames not found in spritesheet for: ${spritesheetKey}`);
      return;
    }

    if (this.animatedSprite) {
      this.container.removeChild(this.animatedSprite);
      this.animatedSprite.destroy();
    }

    this.animatedSprite = new PIXI.AnimatedSprite(textures);
    this.animatedSprite.animationSpeed = fps / 60; // PixiJS base is 60fps
    this.animatedSprite.loop = loop;
    this.animatedSprite.anchor.set(0.5, 1.0); // Anchor at bottom-center for floor positioning
    this.animatedSprite.play();

    this.container.addChild(this.animatedSprite);
    this.currentAnimKey = animKey;
  }

  setFacing(facingRight: boolean): void {
    if (this.animatedSprite) {
      this.animatedSprite.scale.x = facingRight ? Math.abs(this.animatedSprite.scale.x) : -Math.abs(this.animatedSprite.scale.x);
    }
  }

  setScale(scale: number): void {
    if (this.animatedSprite) {
      const currentSignX = Math.sign(this.animatedSprite.scale.x) || 1;
      this.animatedSprite.scale.set(scale * currentSignX, scale);
    }
  }

  stop(): void {
    if (this.animatedSprite) {
      this.animatedSprite.stop();
    }
  }
}
