import { EventBus } from './EventBus';

export interface PetMoods {
  energy: number;     // 0 - 100
  hunger: number;     // 0 - 100
  happiness: number;  // 0 - 100
  sleepiness: number; // 0 - 100
}

export type PersonalityType = 'lazy' | 'chaotic' | 'curious' | 'shy' | 'playful';

export interface PersonalityConfig {
  type: PersonalityType;
  sleepMultiplier: number;
  walkSpeedMultiplier: number;
  curiosityChance: number;
}

export const PERSONALITIES: Record<PersonalityType, PersonalityConfig> = {
  lazy: { type: 'lazy', sleepMultiplier: 1.5, walkSpeedMultiplier: 0.8, curiosityChance: 0.2 },
  chaotic: { type: 'chaotic', sleepMultiplier: 0.7, walkSpeedMultiplier: 1.3, curiosityChance: 0.8 },
  curious: { type: 'curious', sleepMultiplier: 1.0, walkSpeedMultiplier: 1.0, curiosityChance: 1.0 },
  shy: { type: 'shy', sleepMultiplier: 1.2, walkSpeedMultiplier: 1.1, curiosityChance: 0.4 },
  playful: { type: 'playful', sleepMultiplier: 0.8, walkSpeedMultiplier: 1.2, curiosityChance: 0.9 },
};

export interface Plugin {
  id: string;
  name: string;
  version: string;
  init: () => void;
  destroy?: () => void;
}

export class PluginManager {
  private static plugins: Map<string, Plugin> = new Map();

  static registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    plugin.init();
    EventBus.emit('plugin:loaded', plugin.id);
  }

  static unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      if (plugin.destroy) plugin.destroy();
      this.plugins.delete(pluginId);
      EventBus.emit('plugin:unloaded', pluginId);
    }
  }

  static getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
