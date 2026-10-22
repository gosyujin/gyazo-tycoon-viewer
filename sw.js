/**
 * オフライン(機内モード・圏外)でもページが開けるようにするための Service Worker(hateb-tycoon / scrapbox-tycoon と同じ方式)。
 *
 * - アプリ本体(index.html / crypto.js / app.js / build-info.js / favicon.png)だけを扱う。
 *   一覧・サムネイル・原寸は Dropbox(別オリジン)から app.js 側のコードが取り、
 *   Cache Storage(gt-index-v1 / gt-thumb-v1 / gt-full-v1 / gt-anim-v1)に残している。ここでは触らない。
 * - 「まずネットワーク、失敗したら前回キャッシュ」。オンライン中は常に最新、オフライン時だけキャッシュへ落ちる。
 *   電波が不安定で fetch が失敗も成功もせずハングすると待たされるので、NETWORK_TIMEOUT_MS を過ぎたらキャッシュを先に返す。
 * - ナビゲーション(ページの読み込み)は、実URL(末尾スラッシュ・?v=<sha>・?code=… で揺れる)ではなく
 *   固定キー 'index.html' で読み書きする。実URLのまま引くと、完全終了→機内モードで新規起動したときに
 *   キャッシュが見つからずページが開けなくなる(hateb-tycoon の docs/decisions/sw-navigate-fixed-key.md)。
 *   認可の戻り(?code=…)はキャッシュに入れない。
 * - 新しい JS / CSS ファイルを足したら SHELL_FILES に追加すること(忘れるとオフライン起動で読み込めない)。
 *
 * CACHE_VERSION はデプロイ時(.github/workflows/deploy-pages.yml)にビルドSHAへ置換される。
 * このファイルのバイト列が変わることで、ブラウザに新しい Service Worker として検知させる。
 */
const CACHE_VERSION = '__BUILD_SHA__';
const SHELL_CACHE = `gyazo-tycoon-viewer-shell-${CACHE_VERSION}`;
const SHELL_FILES = ['index.html', 'crypto.js', 'app.js', 'build-info.js', 'favicon.png'];
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(SHELL_FILES);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // 本体のキャッシュだけ消す(gt-* は app.js 側が使う端末キャッシュなので消さない)
      await Promise.all(
        keys.filter((k) => k.startsWith('gyazo-tycoon-viewer-shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// ネットワークを待つ。fromCache があり NETWORK_TIMEOUT_MS を過ぎたら、待たずにキャッシュを返す
async function networkFirst(event, request, cache, cacheKey, fromCache) {
  const network = fetch(request).then((res) => {
    if (res && res.ok && cacheKey) event.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));
    return res;
  });
  network.catch(() => {}); // タイムアウト後に失敗しても未処理 rejection にしない
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  try {
    const first = await Promise.race([network, timeout]);
    if (first && first.ok) return first;
    const cached = await fromCache();
    if (cached) return cached;
    return first || (await network);
  } catch (err) {
    const cached = await fromCache();
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Dropbox・imgur・Gyazo などは素通し

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const authReturn = url.searchParams.has('code') || url.searchParams.has('error');
        return networkFirst(event, request, cache, authReturn ? null : 'index.html', () => cache.match('index.html'));
      })()
    );
    return;
  }

  // build-info.js?nc=… は起動時の更新確認(常に最新をネットワークから取る)。キャッシュに入れない
  if (url.searchParams.has('nc')) return;

  if (SHELL_FILES.some((f) => url.pathname.endsWith('/' + f))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        return networkFirst(event, request, cache, request, () => cache.match(request, { ignoreSearch: true }));
      })()
    );
  }
});
