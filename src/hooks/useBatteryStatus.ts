import { useState, useEffect } from 'react';

export interface BatteryInfo {
  level: number; // 0 to 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSupported: boolean;
  health: 'good' | 'normal' | 'fair';
  temperatureC: number;
}

export function useBatteryStatus(batterySaverEnabled: boolean = false) {
  const [battery, setBattery] = useState<BatteryInfo>({
    level: 88,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    isSupported: false,
    health: 'good',
    temperatureC: 29.5,
  });

  useEffect(() => {
    let isMounted = true;
    let batteryManager: any = null;

    // Check if Battery API is supported
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((manager: any) => {
          if (!isMounted) return;
          batteryManager = manager;

          const updateBattery = () => {
            const currentLevel = Math.round(manager.level * 100);
            setBattery({
              level: Math.max(1, Math.min(100, currentLevel)),
              charging: Boolean(manager.charging),
              chargingTime: manager.chargingTime || 0,
              dischargingTime: manager.dischargingTime || 0,
              isSupported: true,
              health: 'good',
              temperatureC: manager.charging ? 32.4 : 28.6,
            });
          };

          updateBattery();
          manager.addEventListener('levelchange', updateBattery);
          manager.addEventListener('chargingchange', updateBattery);
        })
        .catch(() => {
          // If Battery API failed or was blocked by permissions
          initSimulatedBattery();
        });
    } else {
      initSimulatedBattery();
    }

    function initSimulatedBattery() {
      // Load saved battery level or realistic starting level
      const saved = localStorage.getItem('lion_browser_battery_level');
      const savedLevel = saved ? parseInt(saved, 10) : 87;
      const initialLevel = isNaN(savedLevel) ? 87 : Math.max(15, Math.min(99, savedLevel));

      setBattery((prev) => ({
        ...prev,
        level: initialLevel,
        isSupported: false,
      }));
    }

    // Dynamic background simulation if Battery API is not native or static
    // Battery naturally decreases slowly when browsing, or increases if charging
    const interval = setInterval(() => {
      setBattery((prev) => {
        if (prev.isSupported) return prev; // If real API active, let real events drive it

        let newLevel = prev.level;
        if (prev.charging) {
          // Charging up
          newLevel = Math.min(100, prev.level + 1);
        } else {
          // Draining: slower if battery saver is enabled
          const drainChance = batterySaverEnabled ? 0.08 : 0.25;
          if (Math.random() < drainChance) {
            newLevel = Math.max(5, prev.level - 1);
            localStorage.setItem('lion_browser_battery_level', newLevel.toString());
          }
        }

        return {
          ...prev,
          level: newLevel,
          temperatureC: prev.charging ? 31.8 : 28.2 + (Math.random() * 0.8),
        };
      });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (batteryManager) {
        try {
          batteryManager.removeEventListener('levelchange');
          batteryManager.removeEventListener('chargingchange');
        } catch {}
      }
    };
  }, [batterySaverEnabled]);

  // Allow manual toggles for user inspection / testing
  const toggleCharging = () => {
    setBattery((prev) => ({
      ...prev,
      charging: !prev.charging,
      temperatureC: !prev.charging ? 32.5 : 28.4,
    }));
  };

  const setManualLevel = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(newLevel)));
    localStorage.setItem('lion_browser_battery_level', clamped.toString());
    setBattery((prev) => ({
      ...prev,
      level: clamped,
    }));
  };

  return {
    ...battery,
    toggleCharging,
    setManualLevel,
  };
}
