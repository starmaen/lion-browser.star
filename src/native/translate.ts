// ترجمة الصفحات عبر بروكسي ترجمة غوغل (translate.goog): يترجم الصفحة كاملة من جهة الخادم.

export const isTranslatedUrl = (url: string): boolean => {
  try {
    return new URL(url).hostname.endsWith('.translate.goog');
  } catch {
    return false;
  }
};

/** يحوّل رابط الصفحة الأصلي إلى رابط صفحة مترجمة إلى اللغة lang */
export const toTranslateUrl = (url: string, lang: string): string => {
  const u = new URL(url);
  const host = u.hostname.replace(/-/g, '--').replace(/\./g, '-') + '.translate.goog';
  const params = new URLSearchParams(u.search);
  params.set('_x_tr_sl', 'auto');
  params.set('_x_tr_tl', lang);
  params.set('_x_tr_hl', lang);
  params.set('_x_tr_pto', 'wapp');
  return `${u.protocol}//${host}${u.pathname}?${params.toString()}${u.hash}`;
};

/** يعيد الرابط الأصلي من رابط صفحة مترجمة */
export const fromTranslateUrl = (url: string): string => {
  const u = new URL(url);
  const h = u.hostname.replace(/\.translate\.goog$/, '');
  const orig = h.replace(/--/g, '\u0000').replace(/-/g, '.').replace(/\u0000/g, '-');
  const params = new URLSearchParams(u.search);
  Array.from(params.keys())
    .filter((k) => k.startsWith('_x_tr_'))
    .forEach((k) => params.delete(k));
  const q = params.toString();
  return `${u.protocol}//${orig}${u.pathname}${q ? '?' + q : ''}${u.hash}`;
};
