export interface State {
  name: string;
  enter?: (payload?: any) => void;
  update?: (dt: number) => void;
  exit?: () => void;
}

export class FiniteStateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  private stateTimer: number = 0;

  addState(state: State): void {
    this.states.set(state.name, state);
  }

  changeState(name: string, payload?: any): boolean {
    if (!this.states.has(name)) {
      console.warn(`State "${name}" does not exist in FSM.`);
      return false;
    }

    if (this.currentState) {
      if (this.currentState.exit) {
        this.currentState.exit();
      }
    }

    const nextState = this.states.get(name)!;
    this.currentState = nextState;
    this.stateTimer = 0;

    if (nextState.enter) {
      nextState.enter(payload);
    }

    return true;
  }

  update(dt: number): void {
    this.stateTimer += dt;
    if (this.currentState && this.currentState.update) {
      this.currentState.update(dt);
    }
  }

  getCurrentStateName(): string {
    return this.currentState ? this.currentState.name : 'None';
  }

  getStateTimer(): number {
    return this.stateTimer;
  }
}
