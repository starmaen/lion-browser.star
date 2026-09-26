import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { LionVpn } from './lionVpn';
import { isNativeApp } from './lionWebView';
import type { VpnState } from '../types';

/** يزامن حالة VPN الحقيقية (WireGuard) مع حالة التطبيق: الشريط العلوي، البطاقة، الأزرار. */
export function useWireGuardSync(setVpnState: Dispatch<SetStateAction<VpnState>>) {
  useEffect(() => {
    if (!isNativeApp) return;
    let stopped = false;
    const tick = async () => {
      try {
        const r = await LionVpn.status();
        if (stopped) return;
        const up = r.state === 'up';
        setVpnState((prev) => {
          if (prev.isConnected === up && (!up || (prev.bytesDown === r.rx && prev.bytesUp === r.tx))) return prev;
          return {
            ...prev,
            isConnected: up,
            connectedSince: up ? prev.connectedSince ?? Date.now() : null,
            bytesDown: up ? r.rx : prev.bytesDown,
            bytesUp: up ? r.tx : prev.bytesUp,
          };
        });
      } catch {
        /* الإضافة غير جاهزة بعد */
      }
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, []);
}
