import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LionVpn } from '../native/lionVpn';
import type { VpnStatus } from '../native/lionVpn';

interface Props {
  onClose: () => void;
}

interface Cfg {
  name: string;
  endpoint: string;
}

const fmtBytes = (b: number) => {
  if (!b || b < 1024) return `${b || 0} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const NAME_OK = /^[a-zA-Z0-9_=+.-]{1,15}$/;

export const WireGuardModal: React.FC<Props> = ({ onClose }) => {
  const [configs, setConfigs] = useState<Cfg[]>([]);
  const [status, setStatus] = useState<VpnStatus>({ state: 'down', name: '', rx: 0, tx: 0 });
  const [busy, setBusy] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [ip, setIp] = useState<string>('');
  const [ipLoading, setIpLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const l = await LionVpn.listConfigs();
      setConfigs(JSON.parse(l.configsJson || '[]'));
      setStatus(await LionVpn.status());
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(async () => {
      try {
        setStatus(await LionVpn.status());
      } catch {}
    }, 2000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const checkIp = useCallback(async () => {
    setIpLoading(true);
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch('https://api.ipify.org?format=json', { signal: ctrl.signal, cache: 'no-store' });
      window.clearTimeout(t);
      const j = await r.json();
      setIp(String(j.ip || ''));
    } catch {
      setIp('تعذّر الفحص');
    } finally {
      setIpLoading(false);
    }
  }, []);

  const connect = async (name: string) => {
    setError('');
    setBusy(name);
    try {
      await LionVpn.connect({ name });
      await refresh();
      setTimeout(checkIp, 1500);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  };

  const disconnect = async () => {
    setError('');
    setBusy('__off');
    try {
      await LionVpn.disconnect();
      await refresh();
      setTimeout(checkIp, 1000);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy('');
    }
  };

  const remove = async (name: string) => {
    if (status.state === 'up' && status.name === name) await disconnect();
    try {
      await LionVpn.deleteConfig({ name });
    } catch {}
    refresh();
  };

  const save = async () => {
    setError('');
    if (!NAME_OK.test(newName)) {
      setError('الاسم: حتى 15 حرفاً إنجليزياً أو أرقاماً أو - _ . = +');
      return;
    }
    try {
      await LionVpn.saveConfig({ name: newName, config: newText });
      setNewName('');
      setNewText('');
      setShowAdd(false);
      refresh();
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setNewText(String(reader.result || ''));
    reader.readAsText(f);
    if (!newName) {
      const base = f.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_=+.-]/g, '_').slice(0, 15);
      setNewName(base);
    }
  };

  const up = status.state === 'up';

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-2xl mx-auto bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 pb-6 text-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-amber-400">WireGuard VPN</h3>
          <button type="button" onClick={onClose} className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
            إغلاق
          </button>
        </div>

        {/* الحالة */}
        <div className={`rounded-2xl p-3 mb-3 border ${up ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${up ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-sm font-bold">{up ? `متصل — ${status.name}` : 'غير متصل'}</span>
            </div>
            {up && (
              <button
                type="button"
                onClick={disconnect}
                disabled={busy !== ''}
                className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold"
              >
                {busy === '__off' ? '...' : 'قطع الاتصال'}
              </button>
            )}
          </div>
          {up && (
            <div className="flex gap-4 mt-2 text-[11px] text-slate-300 font-mono">
              <span>↓ {fmtBytes(status.rx)}</span>
              <span>↑ {fmtBytes(status.tx)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-400">
              عنوان IP الحالي: <span className="font-mono text-slate-100">{ip || '—'}</span>
            </span>
            <button
              type="button"
              onClick={checkIp}
              disabled={ipLoading}
              className="px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-100 text-[11px] font-bold"
            >
              {ipLoading ? '...' : 'فحص IP'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-2.5 mb-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] break-words">
            {error}
          </div>
        )}

        {/* الإعدادات المحفوظة */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300">الإعدادات المحفوظة ({configs.length})</span>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black"
          >
            {showAdd ? 'إلغاء' : '+ إضافة'}
          </button>
        </div>

        {showAdd && (
          <div className="rounded-2xl p-3 mb-3 bg-slate-800 border border-slate-700 space-y-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم الإعداد (إنجليزي، حتى 15 حرفاً)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              dir="ltr"
            />
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={'الصق محتوى ملف .conf هنا\n[Interface]\nPrivateKey = ...\nAddress = ...\n\n[Peer]\nPublicKey = ...\nEndpoint = ...\nAllowedIPs = 0.0.0.0/0'}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-100 outline-none"
              dir="ltr"
            />
            <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".conf,.txt,text/plain"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-100 text-xs font-bold"
              >
                استيراد ملف .conf
              </button>
              <button type="button" onClick={save} className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">
                حفظ
              </button>
            </div>
          </div>
        )}

        {configs.length === 0 && !showAdd && (
          <p className="text-[11px] text-slate-400 py-3">
            لا توجد إعدادات بعد. اضغط «+ إضافة» والصق إعدادات WireGuard من مزوّدك (أو من خادمك الخاص).
          </p>
        )}

        <div className="space-y-2">
          {configs.map((c) => {
            const isActive = up && status.name === c.name;
            return (
              <div key={c.name} className="flex items-center gap-2 rounded-2xl p-3 bg-slate-800 border border-slate-700">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate" dir="ltr">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                    {c.endpoint || '—'}
                  </div>
                </div>
                {isActive ? (
                  <span className="text-[11px] font-bold text-emerald-400">متصل</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => connect(c.name)}
                    disabled={busy !== ''}
                    className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black disabled:opacity-50"
                  >
                    {busy === c.name ? '...' : 'اتصال'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(c.name)}
                  className="px-2 py-1.5 rounded-full bg-slate-700 text-rose-300 text-xs"
                  title="حذف"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
          الاتصال يشمل هاتفك كله وليس المتصفح فقط، وسيطلب الأندرويد إذن VPN في أول مرة. للتأكد من إخفاء عنوانك اضغط «فحص IP» قبل الاتصال وبعده.
          الإعدادات تُحفظ داخل التطبيق على هاتفك فقط.
        </p>
      </div>
    </div>
  );
};
