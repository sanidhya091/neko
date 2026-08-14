import * as PIXI from 'pixi.js';
import { AssetManager } from './AssetManager';

export class AnimationEngine {
  private container: PIXI.Container;
  private animatedSprite: PIXI.AnimatedSprite | null = null;
  private currentAnimKey = '';

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  async play(
    animKey: string,
    spritesheetKey: string,
    fps = 8,
    loop = true
  ): Promise<void> {
    if (
      this.currentAnimKey === animKey &&
      this.animatedSprite
    ) {
      this.animatedSprite.animationSpeed = fps / 60;
      this.animatedSprite.loop = loop;

      if (!this.animatedSprite.playing) {
        this.animatedSprite.play();
      }

      return;
    }

    const spritesheet = AssetManager.getSpritesheet(
      spritesheetKey
    );

    if (!spritesheet) {
      console.error(
        `Spritesheet not found: ${spritesheetKey}`
      );
      return;
    }

    const textures =
      spritesheet.animations[spritesheetKey];

    if (!textures) {
      console.error(
        `Animation frames not found: ${spritesheetKey}`
      );
      return;
    }

    if (this.animatedSprite) {
      this.container.removeChild(this.animatedSprite);
      this.animatedSprite.destroy();
      this.animatedSprite = null;
    }

    const sprite = new PIXI.AnimatedSprite(textures);

    sprite.animationSpeed = fps / 60;
    sprite.loop = loop;

    // Bottom-center = Neko's feet stay on the desktop floor.
    sprite.anchor.set(0.5, 1);

    // Initial desktop-pet size.
    sprite.scale.set(2.5);

    sprite.play();

    this.animatedSprite = sprite;
    this.currentAnimKey = animKey;

    this.container.addChild(sprite);
  }

  setPosition(x: number, y: number): void {
    if (!this.animatedSprite) return;

    this.animatedSprite.x = x;
    this.animatedSprite.y = y;
  }

  setFacing(facingRight: boolean): void {
    if (!this.animatedSprite) return;

    const scale = Math.abs(
      this.animatedSprite.scale.x
    );

    this.animatedSprite.scale.x =
      facingRight ? scale : -scale;
  }

  setScale(scale: number): void {
    if (!this.animatedSprite) return;

    const direction =
      Math.sign(this.animatedSprite.scale.x) || 1;

    this.animatedSprite.scale.set(
      scale * direction,
      scale
    );
  }

  getSprite(): PIXI.AnimatedSprite | null {
    return this.animatedSprite;
  }

  stop(): void {
    this.animatedSprite?.stop();
  }

  destroy(): void {
    if (!this.animatedSprite) return;

    this.container.removeChild(
      this.animatedSprite
    );

    this.animatedSprite.destroy();

    this.animatedSprite = null;
    this.currentAnimKey = '';
  }
}