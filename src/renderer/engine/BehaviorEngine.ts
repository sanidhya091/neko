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
  personality: 'lazy' | 'chaotic' | 'curious' | 'shy' | 'playful';
}

export class BehaviorEngine {
  private fsm: FiniteStateMachine;
  private anim: AnimationEngine;
  private context: PetContext;

  constructor(anim: AnimationEngine) {
    this.fsm = new FiniteStateMachine();
    this.anim = anim;
    this.context = {
      x: window.innerWidth / 2,
      y: window.innerHeight - 100,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight - 100,
      cursorX: 0,
      cursorY: 0,
      isDragging: false,
      energy: 100,
      happiness: 80,
      sleepiness: 10,
      personality: 'curious',
    };

    this.initStates();
  }

  private initStates(): void {
    // Idle State
    this.fsm.addState({
      name: 'idle',
      enter: () => {
        this.anim.play('idle', 'neko_idle', 6, true);
      },
      update: () => {
        // Random transition based on personality and timer
        if (this.fsm.getStateTimer() > 4.0 + Math.random() * 4.0) {
          const rand = Math.random();
          if (rand < 0.3) {
            this.fsm.changeState('stretching');
          } else if (rand < 0.6) {
            this.fsm.changeState('looking_around');
          } else {
            this.setRandomWalkTarget();
            this.fsm.changeState('walking');
          }
        }
      },
    });

    // Walking State
    this.fsm.addState({
      name: 'walking',
      enter: () => {
        this.anim.play('walk', 'neko_walk', 8, true);
      },
      update: (dt: number) => {
        const dx = this.context.targetX - this.context.x;
        const speed = 60 * dt; // 60 pixels per second
        if (Math.abs(dx) > 5) {
          const dir = Math.sign(dx);
          this.context.x += dir * speed;
          this.anim.setFacing(dir > 0);
        } else {
          this.fsm.changeState('idle');
        }
      },
    });

    // Sleeping State
    this.fsm.addState({
      name: 'sleeping',
      enter: () => {
        this.anim.play('sleep', 'neko_sleep', 3, true);
      },
      update: () => {
        if (this.context.energy > 80 || Math.random() < 0.005) {
          this.fsm.changeState('stretching');
        }
      },
    });

    // Stretching State
    this.fsm.addState({
      name: 'stretching',
      enter: () => {
        this.anim.play('stretch', 'neko_stretch', 6, false);
      },
      update: () => {
        if (this.fsm.getStateTimer() > 2.0) {
          this.fsm.changeState('idle');
        }
      },
    });

    // Looking Around State
    this.fsm.addState({
      name: 'looking_around',
      enter: () => {
        this.anim.play('look', 'neko_look', 6, true);
      },
      update: () => {
        if (this.fsm.getStateTimer() > 3.0) {
          this.fsm.changeState('idle');
        }
      },
    });

    // Initial state
    this.fsm.changeState('idle');
  }

  private setRandomWalkTarget(): void {
    const margin = 100;
    const target = margin + Math.random() * (window.innerWidth - margin * 2);
    this.context.targetX = target;
  }

  update(dt: number): void {
    this.fsm.update(dt);
  }

  getContext(): PetContext {
    return this.context;
  }
}
