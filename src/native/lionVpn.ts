import { registerPlugin } from '@capacitor/core';

export interface VpnStatus {
  state: 'up' | 'down';
  name: string;
  rx: number;
  tx: number;
}

export interface LionVpnPlugin {
  listConfigs(): Promise<{ configsJson: string }>;
  saveConfig(o: { name: string; config: string }): Promise<void>;
  deleteConfig(o: { name: string }): Promise<void>;
  connect(o: { name: string }): Promise<void>;
  disconnect(): Promise<void>;
  status(): Promise<VpnStatus>;
}

export const LionVpn = registerPlugin<LionVpnPlugin>('LionVpn');
