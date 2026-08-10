type EventCallback = (...args: any[]) => void;

export class EventBus {
  private static listeners: Map<string, EventCallback[]> = new Map();

  static on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  static off(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) return;
    const filtered = this.listeners.get(event)!.filter((cb) => cb !== callback);
    this.listeners.set(event, filtered);
  }

  static emit(event: string, ...args: any[]): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach((callback) => {
      try {
        callback(...args);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }

  static clear(): void {
    this.listeners.clear();
  }
}
