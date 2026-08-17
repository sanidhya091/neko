import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const idleSpriteSheet = new URL(
  '../../assets/pets/neko/sprites/neko_idle_transparent.png',
  import.meta.url
).href;

const walkSpriteSheet = new URL(
  '../../assets/pets/neko/sprites/neko_walk_transparent.png',
  import.meta.url
).href;

const lookSpriteSheet = new URL(
  '../../assets/pets/neko/sprites/neko_look_transparent.png',
  import.meta.url
).href;

const stretchSpriteSheet = new URL(
  '../../assets/pets/neko/sprites/neko_stretch_transparent.png',
  import.meta.url
).href;

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;

const IDLE_FRAMES = 6;
const WALK_FRAMES = 6;
const LOOK_FRAMES = 4;
const STRETCH_FRAMES = 4;

const IDLE_FPS = 6;
const WALK_FPS = 8;
const LOOK_FPS = 6;
const STRETCH_FPS = 6;

const NEKO_SCALE = 0.65;
const WALK_SPEED = 90;
const EDGE_MARGIN = 100;

type PetState =
  | 'idle'
  | 'walking'
  | 'looking'
  | 'stretching';

export default function App() {
  const canvasContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    let destroyed = false;

    /*
     * Electron IPC.
     *
     * We keep the window click-through normally.
     * When the cursor enters Neko's bounds,
     * Electron becomes interactive so she can
     * receive pointer events.
     */
    const electron = (
      window as unknown as {
        require: (
          module: string
        ) => {
          ipcRenderer: {
            send: (
              channel: string,
              ...args: unknown[]
            ) => void;
          };
        };
      }
    ).require('electron');

    const ipcRenderer =
      electron.ipcRenderer;

    const setWindowInteractive = (
      interactive: boolean
    ) => {
      if (interactive) {
        ipcRenderer.send(
          'set-ignore-mouse-events',
          false
        );
      } else {
        ipcRenderer.send(
          'set-ignore-mouse-events',
          true,
          { forward: true }
        );
      }
    };

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      antialias: false,
      autoDensity: true,
      resolution:
        window.devicePixelRatio || 1,
    });

    canvasContainerRef.current.appendChild(
      app.view as unknown as HTMLCanvasElement
    );

    const createTextures = (
      baseTexture: PIXI.BaseTexture,
      frameCount: number
    ): PIXI.Texture[] => {
      const textures: PIXI.Texture[] = [];

      for (let i = 0; i < frameCount; i++) {
        textures.push(
          new PIXI.Texture(
            baseTexture,
            new PIXI.Rectangle(
              i * FRAME_WIDTH,
              0,
              FRAME_WIDTH,
              FRAME_HEIGHT
            )
          )
        );
      }

      return textures;
    };

    const loadNeko = async () => {
      const [
        idleTexture,
        walkTexture,
        lookTexture,
        stretchTexture,
      ] = await Promise.all([
        PIXI.Assets.load(idleSpriteSheet),
        PIXI.Assets.load(walkSpriteSheet),
        PIXI.Assets.load(lookSpriteSheet),
        PIXI.Assets.load(stretchSpriteSheet),
      ]);

      if (destroyed) return;

      idleTexture.baseTexture.scaleMode =
        PIXI.SCALE_MODES.NEAREST;

      walkTexture.baseTexture.scaleMode =
        PIXI.SCALE_MODES.NEAREST;

      lookTexture.baseTexture.scaleMode =
        PIXI.SCALE_MODES.NEAREST;

      stretchTexture.baseTexture.scaleMode =
        PIXI.SCALE_MODES.NEAREST;

      const idleTextures =
        createTextures(
          idleTexture.baseTexture,
          IDLE_FRAMES
        );

      const walkTextures =
        createTextures(
          walkTexture.baseTexture,
          WALK_FRAMES
        );

      const lookTextures =
        createTextures(
          lookTexture.baseTexture,
          LOOK_FRAMES
        );

      const stretchTextures =
        createTextures(
          stretchTexture.baseTexture,
          STRETCH_FRAMES
        );

      const neko =
        new PIXI.AnimatedSprite(
          idleTextures
        );

      neko.anchor.set(0.5);
      neko.scale.set(NEKO_SCALE);

      neko.x =
        window.innerWidth / 2;

      neko.y =
        window.innerHeight - 70;

      neko.animationSpeed =
        IDLE_FPS / 60;

      neko.loop = true;
      neko.play();

      /*
       * Neko receives pointer events once
       * Electron temporarily becomes interactive.
       */
      neko.eventMode = 'static';
      neko.cursor = 'grab';

      app.stage.addChild(neko);

      let state: PetState = 'idle';

      let targetX = neko.x;
      let targetY = neko.y;

      let stateTimer = 0;
      let stateDuration = 1;

      /*
       * Dragging state.
       */
      let isDragging = false;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      /*
       * Prevent repeatedly switching Electron
       * between interactive and click-through.
       */
      let windowInteractive = false;

      // Petting / reaction state
      let isPetting = false;
      let petTimer = 0;
      let petCooldown = 0;
      let petCount = 0;
      let dragDistance = 0;

      type HeartParticle = {
        sprite: PIXI.Text;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
      };

      const heartParticles: HeartParticle[] = [];

      const spawnHearts = (count = 1) => {
        for (let i = 0; i < count; i++) {
          const heart = new PIXI.Text(
            Math.random() < 0.7 ? '♥' : '❤',
            {
              fontFamily: 'Arial',
              fontSize: 16 + Math.random() * 7,
              fontWeight: 'bold',
              fill: 0xff6fae,
              stroke: 0x000000,
              strokeThickness: 2,
            }
          );

          heart.anchor.set(0.5);
          heart.x = neko.x + (Math.random() - 0.5) * 55;
          heart.y = neko.y - 35 - Math.random() * 20;
          heart.alpha = 1;
          heart.scale.set(0.7 + Math.random() * 0.4);

          app.stage.addChild(heart);

          const particle: HeartParticle = {
            sprite: heart,
            vx: (Math.random() - 0.5) * 0.45,
            vy: -0.8 - Math.random() * 0.7,
            life: 0.9 + Math.random() * 0.5,
            maxLife: 0.9 + Math.random() * 0.5,
          };

          heartParticles.push(particle);
        }
      };

      const reaction = new PIXI.Text(
        '',
        {
          fontFamily: 'Arial',
          fontSize: 18,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: 0x000000,
          strokeThickness: 4,
        }
      );

      reaction.anchor.set(0.5, 1);
      reaction.visible = false;
      reaction.x = 0;
      reaction.y = -75;
      neko.addChild(reaction);

      const showReaction = (text: string) => {
        reaction.text = text;
        reaction.visible = true;
        reaction.alpha = 1;
        window.setTimeout(() => {
          if (!destroyed) reaction.visible = false;
        }, 800);
      };

      const startPetting = () => {
        if (isDragging || petCooldown > 0) return;
        isPetting = true;
        petTimer = 0;
        neko.stop();
        state = 'idle';
        stateTimer = 0;
        setAnimation(idleTextures, IDLE_FPS, true);
        petCount++;

        spawnHearts(petCount % 4 === 0 ? 2 : 1);

        showReaction(
          petCount % 5 === 0
            ? '♥♥♥'
            : Math.random() < 0.65
              ? '♥'
              : 'purr~'
        );
      };

      const stopPetting = () => {
        if (!isPetting) return;
        isPetting = false;
        petCooldown = 0.25;
        startIdle();
      };

      /*
       * Neko's visual bounds are slightly smaller
       * than the full 320x320 sprite area.
       */
      const getNekoHitBounds =
        (): PIXI.Rectangle => {
          const bounds =
            neko.getBounds();

          const padding = 12;

          return new PIXI.Rectangle(
            bounds.x - padding,
            bounds.y - padding,
            bounds.width +
              padding * 2,
            bounds.height +
              padding * 2
          );
        };

      /*
       * Detect the mouse while the Electron
       * window is click-through.
       *
       * Because index.ts uses:
       *
       * setIgnoreMouseEvents(true, {
       *   forward: true
       * });
       *
       * mouse movement still reaches the
       * renderer.
       */
      app.stage.eventMode = 'static';

      const handleGlobalPointerMove = (
        event: PIXI.FederatedPointerEvent
      ) => {
        if (destroyed || isDragging) {
          return;
        }

        const bounds =
          getNekoHitBounds();

        const inside =
          bounds.contains(
            event.global.x,
            event.global.y
          );

        if (
          inside &&
          !windowInteractive
        ) {
          windowInteractive = true;

          setWindowInteractive(
            true
          );
        } else if (
          !inside &&
          windowInteractive
        ) {
          windowInteractive = false;

          setWindowInteractive(
            false
          );
        }
      };

      app.stage.on(
        'globalpointermove',
        handleGlobalPointerMove
      );

      const chooseIdleDuration =
        (): number => {
          /*
           * Most idle periods:
           * 0.5 - 1 second
           *
           * Occasionally:
           * 2 - 3 seconds
           */
          if (Math.random() < 0.18) {
            return (
              2 + Math.random()
            );
          }

          return (
            0.5 +
            Math.random() * 0.5
          );
        };

      const setAnimation = (
        textures: PIXI.Texture[],
        fps: number,
        loop: boolean
      ) => {
        neko.textures = textures;
        neko.animationSpeed =
          fps / 60;

        neko.loop = loop;
        neko.gotoAndPlay(0);
      };

      const chooseNewDestination =
        () => {
          targetX =
            EDGE_MARGIN +
            Math.random() *
              Math.max(
                1,
                window.innerWidth -
                  EDGE_MARGIN * 2
              );

          targetY =
            EDGE_MARGIN +
            Math.random() *
              Math.max(
                1,
                window.innerHeight -
                  EDGE_MARGIN * 2
              );

          state = 'walking';
          stateTimer = 0;

          setAnimation(
            walkTextures,
            WALK_FPS,
            true
          );
        };

      const startIdle = () => {
        state = 'idle';
        stateTimer = 0;

        stateDuration =
          chooseIdleDuration();

        setAnimation(
          idleTextures,
          IDLE_FPS,
          true
        );
      };

      const startLooking = () => {
        state = 'looking';
        stateTimer = 0;

        stateDuration =
          1.2 +
          Math.random() * 0.8;

        setAnimation(
          lookTextures,
          LOOK_FPS,
          true
        );
      };

      const startStretching = () => {
        state = 'stretching';
        stateTimer = 0;

        stateDuration =
          1.2 +
          Math.random() * 0.4;

        setAnimation(
          stretchTextures,
          STRETCH_FPS,
          false
        );
      };

      const chooseNextBehavior =
        () => {
          const random =
            Math.random();

          /*
           * 35% look
           */
          if (random < 0.35) {
            startLooking();
          }

          /*
           * 35% stretch
           */
          else if (random < 0.70) {
            startStretching();
          }

          /*
           * 30% walk
           */
          else {
            chooseNewDestination();
          }
        };

      /*
       * =========================
       * DRAGGING
       * =========================
       */

      const onPetPointerDown = () => {
        startPetting();
      };

      const onPetPointerUp = () => {
        stopPetting();
      };

      const onPetPointerMove = () => {
        if (!isPetting || isDragging) return;
        petTimer += 1 / 60;
        if (petTimer > 0.7 && Math.random() < 0.02) {
          showReaction(Math.random() < 0.5 ? '♥♥' : 'hehe~');
          petTimer = 0;
        }
      };

      const onPointerDown = (
        event: PIXI.FederatedPointerEvent
      ) => {
        if (destroyed) return;

        isDragging = true;
        isPetting = false;
        dragDistance = 0;

        /*
         * Make absolutely sure Electron
         * stays interactive while dragging.
         */
        if (!windowInteractive) {
          windowInteractive = true;

          setWindowInteractive(
            true
          );
        }

        neko.cursor = 'grabbing';

        /*
         * Stop current animation.
         */
        neko.stop();

        /*
         * Remember where inside Neko
         * the mouse grabbed her.
         */
        dragOffsetX =
          neko.x -
          event.global.x;

        dragOffsetY =
          neko.y -
          event.global.y;

        /*
         * Stop autonomous behavior.
         */
        state = 'idle';
        stateTimer = 0;

        /*
         * Keep idle animation while held.
         */
        setAnimation(
          idleTextures,
          IDLE_FPS,
          true
        );
      };

      const onPointerMove = (
        event: PIXI.FederatedPointerEvent
      ) => {
        if (
          !isDragging ||
          destroyed
        ) {
          return;
        }

        const oldX = neko.x;

        const movementX = Math.abs(
          event.global.x - (neko.x - dragOffsetX)
        );
        const movementY = Math.abs(
          event.global.y - (neko.y - dragOffsetY)
        );
        dragDistance += movementX + movementY;

        let newX =
          event.global.x +
          dragOffsetX;

        let newY =
          event.global.y +
          dragOffsetY;

        /*
         * Keep Neko inside the screen.
         */
        newX = Math.max(
          EDGE_MARGIN,
          Math.min(
            window.innerWidth -
              EDGE_MARGIN,
            newX
          )
        );

        newY = Math.max(
          EDGE_MARGIN,
          Math.min(
            window.innerHeight -
              EDGE_MARGIN,
            newY
          )
        );

        neko.x = newX;
        neko.y = newY;

        /*
         * If Neko has been dragged around a lot,
         * occasionally show an annoyed reaction.
         */
        if (dragDistance > 900) {
          showReaction(Math.random() < 0.5 ? 'hey!' : '😾');
          dragDistance = 0;
        }

        /*
         * Face the direction she's
         * being dragged.
         */
        const dx =
          newX - oldX;

        if (Math.abs(dx) > 1) {
          neko.scale.x =
            dx > 0
              ? NEKO_SCALE
              : -NEKO_SCALE;
        }
      };

      const onPointerUp = () => {
        if (!isDragging) {
          return;
        }

        isDragging = false;

        neko.cursor = 'grab';

        /*
         * Update autonomous target to
         * wherever Neko was dropped.
         */
        targetX = neko.x;
        targetY = neko.y;

        /*
         * Give her a fresh idle period.
         */
        startIdle();

        /*
         * Return the desktop to normal.
         */
        windowInteractive = false;

        setWindowInteractive(
          false
        );
      };

      neko.on('pointerdown', onPetPointerDown);
      neko.on('pointerup', onPetPointerUp);
      neko.on('pointerupoutside', onPetPointerUp);
      neko.on('globalpointermove', onPetPointerMove);

      neko.on(
        'pointerdown',
        onPointerDown
      );

      neko.on(
        'globalpointermove',
        onPointerMove
      );

      neko.on(
        'pointerup',
        onPointerUp
      );

      neko.on(
        'pointerupoutside',
        onPointerUp
      );

      /*
       * =========================
       * AI TICKER
       * =========================
       */

      const ticker = (
        delta: number
      ) => {
        if (destroyed || isDragging) return;

        const dt = delta / 60;

        if (petCooldown > 0) {
          petCooldown = Math.max(0, petCooldown - dt);
        }

        if (isPetting) return;

        stateTimer += dt;

        /*
         * IDLE
         */
        if (state === 'idle') {
          if (
            stateTimer >=
            stateDuration
          ) {
            chooseNextBehavior();
          }

          return;
        }

        /*
         * LOOKING
         */
        if (
          state === 'looking'
        ) {
          if (
            stateTimer >=
            stateDuration
          ) {
            /*
             * Usually continue wandering,
             * sometimes sit again.
             */
            if (
              Math.random() < 0.25
            ) {
              startIdle();
            } else {
              chooseNewDestination();
            }
          }

          return;
        }

        /*
         * STRETCHING
         */
        if (
          state === 'stretching'
        ) {
          if (
            stateTimer >=
            stateDuration
          ) {
            /*
             * Usually walk after stretching.
             */
            if (
              Math.random() < 0.80
            ) {
              chooseNewDestination();
            } else {
              startIdle();
            }
          }

          return;
        }

        /*
         * WALKING
         */
        const dx =
          targetX - neko.x;

        const dy =
          targetY - neko.y;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        if (distance < 4) {
          neko.x = targetX;
          neko.y = targetY;

          startIdle();

          return;
        }

        const movement =
          WALK_SPEED * dt;

        neko.x +=
          (dx / distance) *
          movement;

        neko.y +=
          (dy / distance) *
          movement;

        /*
         * Face walking direction.
         */
        if (
          Math.abs(dx) > 0.5
        ) {
          neko.scale.x =
            dx > 0
              ? NEKO_SCALE
              : -NEKO_SCALE;
        }
      };

      app.ticker.add(ticker);

      /*
       * Start idle.
       */
      startIdle();

      /*
       * Begin wandering after 1 second.
       */
      const initialDelay =
        window.setTimeout(() => {
          if (!destroyed) {
            chooseNewDestination();
          }
        }, 1000);

      return () => {
        window.clearTimeout(
          initialDelay
        );

        neko.off('pointerdown', onPetPointerDown);
        neko.off('pointerup', onPetPointerUp);
        neko.off('pointerupoutside', onPetPointerUp);
        neko.off('globalpointermove', onPetPointerMove);

        neko.off(
          'pointerdown',
          onPointerDown
        );

        neko.off(
          'globalpointermove',
          onPointerMove
        );

        neko.off(
          'pointerup',
          onPointerUp
        );

        neko.off(
          'pointerupoutside',
          onPointerUp
        );

        app.stage.off(
          'globalpointermove',
          handleGlobalPointerMove
        );

        app.ticker.remove(
          ticker
        );

        for (const particle of heartParticles) {
          particle.sprite.destroy();
        }
        heartParticles.length = 0;

        /*
         * Always restore click-through
         * when the component is destroyed.
         */
        setWindowInteractive(
          false
        );
      };
    };

    let cleanupNeko:
      | (() => void)
      | undefined;

    loadNeko()
      .then((cleanup) => {
        cleanupNeko = cleanup;
      })
      .catch((error) => {
        console.error(
          'Failed to load Neko:',
          error
        );
      });

    const handleResize = () => {
      app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      );

      const neko =
        app.stage.children[0] as
          | PIXI.AnimatedSprite
          | undefined;

      if (!neko) return;

      neko.x = Math.max(
        EDGE_MARGIN,
        Math.min(
          window.innerWidth -
            EDGE_MARGIN,
          neko.x
        )
      );

      neko.y = Math.max(
        EDGE_MARGIN,
        Math.min(
          window.innerHeight -
            EDGE_MARGIN,
          neko.y
        )
      );
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      destroyed = true;

      cleanupNeko?.();

      window.removeEventListener(
        'resize',
        handleResize
      );

      app.destroy(true);
    };
  }, []);

  return (
    <div
      ref={canvasContainerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
}