import { FiniteStateMachine } from './FSM';
import { AnimationEngine } from './AnimationEngine';

export interface PetContext {
  x: number;
  y: number;
  targetX: number;
  targetY: number;

  cursorX: number;
  cursorY: number;

  isDragging: boolean;

  energy: number;
  happiness: number;
  sleepiness: number;

  personality:
    | 'lazy'
    | 'chaotic'
    | 'curious'
    | 'shy'
    | 'playful';
}

export class BehaviorEngine {
  private fsm: FiniteStateMachine;
  private anim: AnimationEngine;
  private context: PetContext;

  private readonly floorY: number;

  constructor(anim: AnimationEngine) {
    this.fsm = new FiniteStateMachine();
    this.anim = anim;

    this.floorY = window.innerHeight - 30;

    this.context = {
      x: window.innerWidth / 2,
      y: this.floorY,

      targetX: window.innerWidth / 2,
      targetY: this.floorY,

      cursorX: 0,
      cursorY: 0,

      isDragging: false,

      energy: 100,
      happiness: 80,
      sleepiness: 10,

      personality: 'curious',
    };

    this.initStates();

    this.anim.setPosition(
      this.context.x,
      this.context.y
    );
  }

  private initStates(): void {
    /*
     * IDLE
     */
    this.fsm.addState({
      name: 'idle',

      enter: () => {
        void this.anim.play(
          'idle',
          'neko_idle',
          6,
          true
        );
      },

      update: () => {
        const time = this.fsm.getStateTimer();

        // Stay idle for at least 2 seconds.
        if (time < 2) return;

        // Sleep when tired.
        if (
          this.context.energy < 15 ||
          this.context.sleepiness > 90
        ) {
          this.fsm.changeState('sleeping');
          return;
        }

        const random = Math.random();

        // 20% stretch
        if (random < 0.20) {
          this.fsm.changeState('stretching');
        }

        // 15% look around
        else if (random < 0.35) {
          this.fsm.changeState('looking_around');
        }

        // 65% walk
        else {
          this.setRandomWalkTarget();
          this.fsm.changeState('walking');
        }
      },
    });

    /*
     * WALKING
     */
    this.fsm.addState({
      name: 'walking',

      enter: () => {
        void this.anim.play(
          'walk',
          'neko_walk',
          8,
          true
        );
      },

      update: (dt: number) => {
        const dx =
          this.context.targetX -
          this.context.x;

        const distance = Math.abs(dx);

        if (distance < 3) {
          this.context.x = this.context.targetX;

          this.anim.setPosition(
            this.context.x,
            this.context.y
          );

          this.fsm.changeState('idle');
          return;
        }

        const direction = Math.sign(dx);

        this.anim.setFacing(
          direction > 0
        );

        let speed = 55;

        if (
          this.context.personality ===
          'lazy'
        ) {
          speed = 35;
        }

        if (
          this.context.personality ===
          'chaotic'
        ) {
          speed = 85;
        }

        if (
          this.context.personality ===
          'playful'
        ) {
          speed = 65;
        }

        this.context.x +=
          direction *
          speed *
          dt;

        // Keep Neko inside the screen.
        const margin = 70;

        this.context.x = Math.max(
          margin,
          Math.min(
            window.innerWidth - margin,
            this.context.x
          )
        );

        this.anim.setPosition(
          this.context.x,
          this.context.y
        );

        // Walking consumes energy.
        this.context.energy = Math.max(
          0,
          this.context.energy -
            dt * 1.5
        );

        // Walking increases sleepiness.
        this.context.sleepiness =
          Math.min(
            100,
            this.context.sleepiness +
              dt * 0.8
          );
      },
    });

    /*
     * LOOKING AROUND
     */
    this.fsm.addState({
      name: 'looking_around',

      enter: () => {
        void this.anim.play(
          'look',
          'neko_look',
          6,
          true
        );
      },

      update: () => {
        if (
          this.fsm.getStateTimer() >
          3
        ) {
          this.fsm.changeState('idle');
        }
      },
    });

    /*
     * STRETCHING
     */
    this.fsm.addState({
      name: 'stretching',

      enter: () => {
        void this.anim.play(
          'stretch',
          'neko_stretch',
          6,
          false
        );
      },

      update: () => {
        if (
          this.fsm.getStateTimer() >
          2
        ) {
          this.fsm.changeState('idle');
        }
      },
    });

    /*
     * SLEEPING
     */
    this.fsm.addState({
      name: 'sleeping',

      enter: () => {
        void this.anim.play(
          'sleep',
          'neko_sleep',
          3,
          true
        );
      },

      update: (dt: number) => {
        // Restore energy while sleeping.
        this.context.energy =
          Math.min(
            100,
            this.context.energy +
              dt * 5
          );

        // Reduce sleepiness.
        this.context.sleepiness =
          Math.max(
            0,
            this.context.sleepiness -
              dt * 6
          );

        // Wake up after recovering.
        if (
          this.context.energy > 80 &&
          this.context.sleepiness < 25
        ) {
          this.fsm.changeState(
            'stretching'
          );
        }
      },
    });

    // Start Neko in idle.
    this.fsm.changeState('idle');
  }

  private setRandomWalkTarget(): void {
    const margin = 100;

    const availableWidth =
      Math.max(
        1,
        window.innerWidth -
          margin * 2
      );

    this.context.targetX =
      margin +
      Math.random() *
        availableWidth;

    this.context.targetY =
      this.floorY;
  }

  update(dt: number): void {
    this.fsm.update(dt);

    // Natural sleepiness increase.
    if (
      this.fsm.getCurrentStateName() !==
      'sleeping'
    ) {
      this.context.sleepiness =
        Math.min(
          100,
          this.context.sleepiness +
            dt * 0.2
        );
    }

    // Happiness slowly decreases.
    this.context.happiness =
      Math.max(
        0,
        this.context.happiness -
          dt * 0.03
      );
  }

  getContext(): PetContext {
    return this.context;
  }

  getState(): string {
    return this.fsm.getCurrentStateName();
  }
}