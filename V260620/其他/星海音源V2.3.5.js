/*! 
 * @name 星海音乐源
 * @description GDAPI | 聚会 | ChKSz API
 * @version v3.2.5
 * @author 万去了了
 * @homepage https://zrcdy.dpdns.org/
 * @lastUpdate 2026-06-16
 * 
 * @version v3.2.5 1,优化kw，kg源。2,大小考祝福：每逢大小考启幕，祝所有考生提笔有神，合笔如愿，逢考得胜。
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;

const DEBUG_MODE = false;

const UPDATE_CONFIG = {
    versionApiUrl: 'https://zrcdy.dpdns.org/lx/version.php',
    latestScriptUrl: 'https://zrcdy.dpdns.org/lx/vers.php',
    currentVersion: 'v3.2.5'
};

const STABLE_SOURCES_API_URL = 'https://zrcdy.dpdns.org/lx/stable_sources.php';
const MAIN_API_BASE = 'https://music-api.gdstudio.xyz/api.php?use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light';
const DIRECT_API_BASE = 'https://api.yaohud.cn/api/music/';
const SIGN_PROVIDER_URL = 'https://zrcdy.dpdns.org/lx/api/api.php?get_sign_only=1';
const FALLBACK_PROXY_URL = 'https://zrcdy.dpdns.org/lx/api/api.php';
const NETEASE_VIP_API = 'https://api.chksz.top/api/163_music';

// GDAPI 屏蔽时间（1小时）
let gdApiBlockedUntil = 0;

// 代理支持的音乐源列表（kw 不在其中）
const PROXY_SUPPORTED_SOURCES = new Set(['kg', 'migu', 'qq']);

let musicSourceEnabled = true;
let serverCheckCompleted = false;
let backupApiAvailable = false;
let stableSourcesList = null;
let mainApiSourceMap = {};
let availablePlatforms = [];

let yaohuPlatformStatus = { kg: 'unknown', qq: 'unknown', migu: 'unknown', kw: 'unknown' };
let gdApiStatus = 'unknown';
let neteaseVipApiStatus = 'unknown';

// 可用密钥版本列表（从 version.php 获取）
let availableKeyVersions = [1];  // 默认仅有旧版本
let currentKeyVersion = 1;

// 签名凭证缓存（按版本存储）
const cachedCredentials = {};
const credentialExpireTimes = {};

const ALL_PLATFORMS = ['wy', 'tx', 'kw', 'kg', 'mg'];
const MUSIC_QUALITY_FULL = {
    wy: ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'jyeffect', 'sky', 'jymaster'],
    tx: ['128k', '192k', '320k', 'flac', 'flac24bit'],
    kw: ['128k', '192k', '320k', 'flac', 'flac24bit'],
    kg: ['128k', '192k', '320k', 'flac', 'flac24bit'],
    mg: ['128k', '192k', '320k', 'flac', 'flac24bit']
};
const PLATFORM_NAME_MAP = {
    wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐'
};
const DIRECT_SOURCE_PATH = { kg: 'kg', tx: 'qq', mg: 'migu', kw: 'kuwo' };
const NETEASE_VIP_LEVEL_MAP = { hires: 'hires', jyeffect: 'jyeffect', sky: 'sky', jymaster: 'jymaster' };
const NETEASE_VIP_QUALITY_SET = new Set(['hires', 'jyeffect', 'sky', 'jymaster']);

// ============================ 工具函数 ============================
function log(...args) {
    if (DEBUG_MODE) return console.log('[星海]', ...args);
    const msg = args.join(' ');
    if (/错误|失败|异常|不可用|维护|完全失败|无结果|降级|离线|跳过|屏蔽/.test(msg)) console.log('[星海]', ...args);
}

function logError(context, err, extra = '') {
    console.error(`[星海错误] ${context}: ${err.message || err} ${extra}`);
}

function logSuccess(source, method, url) {
    console.log(`[星海成功] ${method} 获取音频 (${source}): ${url.substring(0, 80)}...`);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function safeParseBody(body) {
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
            try { return JSON.parse(trimmed); } catch (e) {}
        }
        return body;
    }
    if (typeof body === 'object' && body !== null) {
        try {
            if (typeof body.toString === 'function' && body.toString() !== '[object Object]') {
                body = body.toString('utf-8');
            }
        } catch (e) {}
        if (typeof body === 'object' && !isBuffer(body)) return body;
    }
    try {
        if (isBuffer(body)) {
            if (globalThis.lx?.utils?.buffer?.bufToString) {
                body = globalThis.lx.utils.buffer.bufToString(body, 'utf-8');
            } else if (typeof Buffer !== 'undefined') {
                body = Buffer.from(body).toString('utf-8');
            } else {
                body = String(body);
            }
        }
    } catch (e) {}
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
            try { return JSON.parse(trimmed); } catch (e) {}
        }
    }
    return body;
}

function isBuffer(obj) {
    return obj && typeof obj === 'object' && (
        (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) ||
        (typeof obj.constructor === 'function' && obj.constructor.name === 'Buffer')
    );
}

function buildQueryString(params) {
    const parts = [];
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            let value = params[key];
            if (value !== undefined && value !== null && value !== '') {
                value = String(value).trim();
                value = encodeURIComponent(value).replace(/%20/g, '');
                parts.push(encodeURIComponent(key) + '=' + value);
            }
        }
    }
    return parts.join('&');
}

function mapQuality(target, avail) {
    const pm = { '臻品母带': 'jymaster', '臻品音质2.0': 'sky', '臻品音质AI': 'jyeffect', '臻品音质': 'jyeffect', 'Hires 无损24-Bit': 'hires', 'Hi-Res': 'hires', 'FLAC': 'flac', '320k': '320k', '192k': '192k', '128k': '128k' };
    if (avail.includes(target)) return target;
    const m = pm[target];
    if (m && avail.includes(m)) return m;
    const order = ['jymaster', 'sky', 'jyeffect', 'hires', 'flac24bit', 'flac', '320k', '192k', '128k'];
    for (const q of order) if (avail.includes(q)) return q;
    return avail[0] || '128k';
}

const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    request(url, options, (err, resp) => {
        if (err) return reject(new Error(`网络异常：${err.message}`));
        const body = safeParseBody(resp.body);
        resolve({ body, statusCode: resp.statusCode, headers: resp.headers || {} });
    });
});

// ============================ 多密钥签名管理 ============================
function selectAndSetKeyVersion() {
    if (!availableKeyVersions || availableKeyVersions.length === 0) {
        log('无可用密钥，直连不可用');
        return false;
    }
    if (availableKeyVersions.length === 1) {
        currentKeyVersion = availableKeyVersions[0];
    } else {
        currentKeyVersion = availableKeyVersions[Math.floor(Math.random() * availableKeyVersions.length)];
    }
    log(`选择密钥版本: ${currentKeyVersion}`);
    return true;
}

async function fetchCredentials() {
    const now = Date.now();
    if (cachedCredentials[currentKeyVersion] && now < credentialExpireTimes[currentKeyVersion]) {
        return cachedCredentials[currentKeyVersion];
    }
    log(`获取签名凭证 (ver=${currentKeyVersion})...`);
    let url = SIGN_PROVIDER_URL;
    if (currentKeyVersion !== 1) {
        url += '&ver=' + currentKeyVersion;
    }
    try {
        const resp = await httpFetch(url, { timeout: 5000 });
        if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
        let data = resp.body;
        if (typeof data === 'string') data = JSON.parse(data);
        cachedCredentials[currentKeyVersion] = data;
        credentialExpireTimes[currentKeyVersion] = now + (data.expire_in ? data.expire_in - 5 : 55) * 1000;
        return data;
    } catch (err) {
        logError('签名获取失败', err);
        if (cachedCredentials[currentKeyVersion] && now < credentialExpireTimes[currentKeyVersion]) {
            return cachedCredentials[currentKeyVersion];
        }
        throw err;
    }
}

async function signedFetch(url, options = {}) {
    const cred = await fetchCredentials();
    const headers = {
        'X-Api-Key': cred.api_key,
        'X-Api-Timestamp': String(cred.timestamp),
        'X-Api-Sign': cred.sign,
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    log(`直连请求 (ver=${currentKeyVersion}): ${url}`);
    try {
        const resp = await httpFetch(url, { ...options, headers });
        log(`直连响应 [${resp.statusCode}]: ${JSON.stringify(resp.body).substring(0, 300)}`);
        return resp;
    } catch (e) { logError(`直连异常 (ver=${currentKeyVersion})`, e); throw e; }
}

// ============================ 稳定源 ============================
const fetchStableSources = async () => {
    if (env === 'desktop') return;
    try {
        const resp = await httpFetch(STABLE_SOURCES_API_URL, { timeout: 5000, headers: { 'User-Agent': 'LX-Music-Mobile' } });
        if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
        let data = resp.body; if (typeof data === 'string') data = JSON.parse(data);
        if (!Array.isArray(data) || data.length === 0) throw new Error('数据为空');
        stableSourcesList = data.filter(s => typeof s === 'string' && /^[a-z]+$/.test(s));
    } catch (err) {
        logError('稳定源获取', err);
        stableSourcesList = ['netease', 'kuwo'];
    }
};

const buildPlatformsFromStableSources = () => {
    const map = { netease: 'wy', tencent: 'tx', kuwo: 'kw', kugou: 'kg', migu: 'mg' };
    mainApiSourceMap = {};
    stableSourcesList.forEach(s => { const c = map[s]; if (c) mainApiSourceMap[c] = s; });
    availablePlatforms = [...ALL_PLATFORMS];
    if (env === 'desktop') availablePlatforms = availablePlatforms.filter(p => p !== 'mg');
};

// ============================ 平台可用性判断 ============================
function isDirectAllowedForSource(source) {
    const up = DIRECT_SOURCE_PATH[source];
    if (!up) return false;
    if (source === 'kw') return true;
    return yaohuPlatformStatus[up] === 'available' && backupApiAvailable;
}

function isPlatformAvailable(platform) {
    if (platform === 'wy') return (mainApiSourceMap['wy'] && gdApiStatus !== 'unavailable') || neteaseVipApiStatus !== 'unavailable';
    if (platform === 'kw') return (mainApiSourceMap['kw'] && gdApiStatus !== 'unavailable') || true;
    const dp = DIRECT_SOURCE_PATH[platform];
    if (!dp) return false;
    const yaohuSt = yaohuPlatformStatus[dp] || 'unknown';
    const directOk = yaohuSt === 'available' && backupApiAvailable;
    const proxyOk = yaohuSt !== 'unavailable' && yaohuSt !== 'maintenance' && backupApiAvailable && PROXY_SUPPORTED_SOURCES.has(dp);
    return directOk || proxyOk;
}

function filterAvailablePlatforms() {
    const before = availablePlatforms.length;
    availablePlatforms = availablePlatforms.filter(p => isPlatformAvailable(p));
    if (availablePlatforms.length === 0) {
        availablePlatforms = env === 'desktop' ? ALL_PLATFORMS.filter(p => p !== 'mg') : [...ALL_PLATFORMS];
        console.log('[星海] 无可用平台，已恢复全平台（桌面端已排除咪咕）');
    } else {
        console.log(`[星海] 平台过滤: ${before} -> ${availablePlatforms.length}, 保留: ${availablePlatforms.join(',')}`);
    }
}

// ============================ 服务器状态检测（读取 available_keys） ============================
const fetchServerStatus = async () => {
    for (let a = 0; a < 3; a++) {
        if (a > 0) await delay(1000);
        try {
            const resp = await httpFetch(UPDATE_CONFIG.versionApiUrl, { timeout: 5000, headers: { 'User-Agent': 'LX-Music-Mobile' } });
            if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
            const data = typeof resp.body === 'object' ? resp.body : JSON.parse(resp.body);
            if (!data) throw new Error('数据无效');
            if (data.yaohu_api?.platforms) for (let p in data.yaohu_api.platforms) yaohuPlatformStatus[p] = data.yaohu_api.platforms[p].status || 'unknown';
            else { const ov = data.yaohu_api?.status || 'unknown'; for (let p in yaohuPlatformStatus) yaohuPlatformStatus[p] = ov; }
            gdApiStatus = data.gd_api?.status || 'unknown';
            neteaseVipApiStatus = data.netease_vip_api?.status || 'unknown';
            backupApiAvailable = data.server_status?.online !== false;
            // 新增：读取可用密钥版本
            if (data.available_keys && Array.isArray(data.available_keys)) {
                availableKeyVersions = data.available_keys.filter(v => v === 1 || v === 2);
                log(`可用密钥版本: ${availableKeyVersions.join(',')}`);
            } else {
                availableKeyVersions = [1];
            }
            return { enabled: backupApiAvailable };
        } catch (e) { logError('状态检查失败', e, `(第${a+1}次)`); }
    }
    for (let p in yaohuPlatformStatus) yaohuPlatformStatus[p] = 'unknown';
    gdApiStatus = 'unknown'; neteaseVipApiStatus = 'unknown'; backupApiAvailable = false;
    availableKeyVersions = [1];
    return { enabled: false };
};

// ============================ 落雪匹配逻辑（kw除外） ============================
function cleanStr(str) {
    return str.replace(/[\s'.,，&"、\(\)（）`~\-<>|/[\]!！]/g, '').toLowerCase();
}

function parseDurationToSeconds(dur) {
    if (!dur) return null;
    const parts = String(dur).split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return parseInt(dur);
}

function singerMutualInclude(targetSinger, candidateSinger) {
    return targetSinger.includes(candidateSinger) || candidateSinger.includes(targetSinger);
}

function nameMutualInclude(targetName, candidateName) {
    return targetName.includes(candidateName) || candidateName.includes(targetName);
}

function findBestMatchLxStyle(targetInfo, candidates) {
    const targetNameClean = cleanStr(targetInfo.name);
    const targetSingerClean = cleanStr(targetInfo.singer);
    const targetAlbumClean = cleanStr(targetInfo.album || '');
    const targetDuration = targetInfo.duration ? parseDurationToSeconds(targetInfo.duration) : null;

    let bestForScore = null;
    let bestScore = -1;

    for (const cand of candidates) {
        const candName = cand.name || cand.title || '';
        const candSinger = cand.singer || cand.author || '';
        const candAlbum = cand.album || '';
        const candDuration = cand.duration ? parseDurationToSeconds(cand.duration) : null;

        const fCandName = cleanStr(candName);
        const fCandSinger = cleanStr(candSinger);
        const fCandAlbum = cleanStr(candAlbum);

        // 第一层：时长+歌名完全一致
        if (targetDuration && candDuration && Math.abs(targetDuration - candDuration) <= 5) {
            if (fCandName === targetNameClean && singerMutualInclude(targetSingerClean, fCandSinger)) {
                return cand;
            }
        }

        // 第二层：歌手完全相同+歌名互相包含
        if (fCandSinger === targetSingerClean && nameMutualInclude(targetNameClean, fCandName)) {
            return cand;
        }

        // 第三层：专辑完全相同+歌手互相包含+歌名互相包含
        if (targetAlbumClean && fCandAlbum === targetAlbumClean && singerMutualInclude(targetSingerClean, fCandSinger) && nameMutualInclude(targetNameClean, fCandName)) {
            return cand;
        }

        // 后备分数匹配（名称0.6 + 歌手0.4）
        const nameScore = stringMatchScore(targetNameClean, fCandName);
        const singerScore = stringMatchScore(targetSingerClean, fCandSinger);
        const score = nameScore * 0.6 + singerScore * 0.4;
        if (score > bestScore) {
            bestScore = score;
            bestForScore = cand;
        }
    }

    return bestForScore && bestScore >= 0.3 ? bestForScore : null;
}

function stringMatchScore(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.9;
    let m = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) m++;
    return m / Math.max(a.length, b.length);
}

// 搜索并匹配（仅 kg/tx/mg）
async function searchAndMatch(source, songName, singer, useProxy = false) {
    const upstream = DIRECT_SOURCE_PATH[source];
    const searchFunc = useProxy ? proxySearch : directSearch;
    try {
        const songs = await searchFunc(upstream, songName, 25);
        if (!songs || songs.length === 0) throw new Error('搜索无结果');
        const targetInfo = {
            name: songName,
            singer: singer,
            album: '',
            duration: null
        };
        const best = findBestMatchLxStyle(targetInfo, songs);
        if (!best) throw new Error('未找到匹配歌曲');
        return best;
    } catch (e) {
        if (e.message === 'NO_RESULT') throw e;
        logError('搜索匹配失败', e);
        throw e;
    }
}

async function directSearch(upstreamSource, keyword, limit = 10) {
    const st = yaohuPlatformStatus[upstreamSource] || 'unknown';
    if (st !== 'available' && st !== 'unknown' && upstreamSource !== 'kuwo') throw new Error(`上游不可用（${st}）`);
    const params = { key: '8Sbg8jJCnrssIDGDaz9', msg: keyword, g: String(limit) };
    if (upstreamSource === 'migu') { params.num = String(limit); delete params.g; }
    const url = `${DIRECT_API_BASE}${upstreamSource}?${buildQueryString(params)}`;
    try {
        const resp = await signedFetch(url);
        if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
        const data = resp.body;
        if (data.code !== 200) {
            if (data.code === 404 && Array.isArray(data.data) && data.data.length === 0) throw new Error('NO_RESULT');
            throw new Error(`业务错误: ${data.msg || data.code}`);
        }
        const songs = extractSongsFromData(data, upstreamSource);
        if (songs.length === 0 && data.code === 404) throw new Error('NO_RESULT');
        return songs;
    } catch (e) {
        if (e.message === 'NO_RESULT') throw e;
        logError('直连搜索', e, `URL: ${url}`);
        throw e;
    }
}

async function proxySearch(proxySource, keyword, limit = 10) {
    if (!PROXY_SUPPORTED_SOURCES.has(proxySource)) throw new Error(`代理不支持此平台: ${proxySource}`);
    const params = { source: proxySource, msg: keyword, g: String(limit) };
    if (proxySource === 'migu') { params.num = String(limit); delete params.g; }
    const url = `${FALLBACK_PROXY_URL}?${buildQueryString(params)}`;
    try {
        const resp = await httpFetch(url);
        if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
        const data = resp.body;
        if (data.code !== 200) {
            if (data.code === 404 && Array.isArray(data.data) && data.data.length === 0) throw new Error('NO_RESULT');
            throw new Error(`业务错误: ${data.msg || data.code}`);
        }
        const songs = extractSongsFromData(data, proxySource);
        if (songs.length === 0 && data.code === 404) throw new Error('NO_RESULT');
        return songs;
    } catch (e) {
        if (e.message === 'NO_RESULT') throw e;
        logError('代理搜索', e, `URL: ${url}`);
        throw e;
    }
}

function extractSongsFromData(data, upstreamSource) {
    if (!data || data.code !== 200) return [];
    if (upstreamSource === 'kuwo') return Array.isArray(data.data) ? data.data : (data.data?.songs || []);
    if (upstreamSource === 'qq' || upstreamSource === 'tx') return data.data?.songs || [];
    return Array.isArray(data.data) ? data.data : (data.data?.songs || []);
}

// ============================ 音乐 URL 获取 ============================
async function getMusicUrlFromMainAPI(source, songId, apiQuality) {
    if (Date.now() < gdApiBlockedUntil) throw new Error('GD API 暂时屏蔽');
    if (gdApiStatus === 'unavailable') throw new Error('GD API 不可用');
    const apiSource = mainApiSourceMap[source];
    if (!apiSource) throw new Error('GD不支持此平台');
    const url = `${MAIN_API_BASE}&types=url&source=${apiSource}&id=${songId}&br=${apiQuality}`;
    try {
        const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' } });
        const data = typeof resp.body === 'object' ? resp.body : JSON.parse(resp.body);
        if (!data.url) {
            gdApiBlockedUntil = Date.now() + 3600000;
            log('GDAPI 返回空链接，已屏蔽1小时');
            throw new Error('GD未返回音频地址');
        }
        return data.url;
    } catch (e) {
        logError('GDAPI请求失败', e, `URL: ${url}`);
        throw e;
    }
}

async function getMusicUrlFromNeteaseVIP(songId, quality) {
    if (neteaseVipApiStatus === 'unavailable') throw new Error('VIP API 不可用');
    const level = NETEASE_VIP_LEVEL_MAP[quality] || 'jymaster';
    const url = `${NETEASE_VIP_API}?id=${songId}&level=${level}`;
    try {
        const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' } });
        if (resp.statusCode !== 200) throw new Error(`HTTP ${resp.statusCode}`);
        const data = typeof resp.body === 'object' ? resp.body : JSON.parse(resp.body);
        if (data.code !== 200 || !data.data?.url) throw new Error('VIP未返回音频');
        return data.data.url;
    } catch (e) {
        logError('网易云VIP请求失败', e, `URL: ${url}`);
        throw e;
    }
}

// kw 专用：直接用 rid 获取播放链接
async function getMusicUrlViaDirectKw(musicInfo, quality) {
    const rid = musicInfo.songmid || musicInfo.hash || musicInfo.id;
    if (!rid) throw new Error('缺少歌曲 rid');
    const qMap = { '128k': 'Standard', '192k': 'exhigh', '320k': 'SQ', 'flac': 'lossless', 'flac24bit': 'hires' };
    const sizeLevels = quality === 'flac' || quality === 'flac24bit' ? ['lossless', 'hires', 'SQ', 'exhigh', 'Standard'] : ['SQ', 'exhigh', 'Standard'];
    for (const size of sizeLevels) {
        const params = { key: '8Sbg8jJCnrssIDGDaz9', action: 'song', id: rid, size };
        const url = `${DIRECT_API_BASE}kuwo?${buildQueryString(params)}`;
        try {
            const resp = await signedFetch(url);
            if (resp.statusCode !== 200) continue;
            const data = resp.body;
            if (data.code === 200 && data.data?.vipmusic?.url) return data.data.vipmusic.url;
        } catch (e) {
            logError('Kw直连获取失败', e, `URL: ${url}`);
        }
    }
    throw new Error('Kw直连所有音质尝试失败');
}

// 其他平台直连（使用落雪匹配）
async function getMusicUrlViaDirect(source, musicInfo, quality) {
    if (source === 'kw') return getMusicUrlViaDirectKw(musicInfo, quality);
    if (!isDirectAllowedForSource(source)) throw new Error('直连不可用');
    const songName = musicInfo.name || '', singer = musicInfo.singer || '';
    const best = await searchAndMatch(source, songName, singer, false);
    if (!best) throw new Error('未找到匹配歌曲');
    const rid = best.rid;
    const upstream = DIRECT_SOURCE_PATH[source];
    // 优先使用 rid 直取
    if (rid) {
        const params = { key: '8Sbg8jJCnrssIDGDaz9', action: 'song', id: rid };
        if (source === 'kg') params.quality = 'flac';
        else if (source === 'tx') params.size = 'hq';
        const url = `${DIRECT_API_BASE}${upstream}?${buildQueryString(params)}`;
        try {
            const resp = await signedFetch(url);
            if (resp.statusCode === 200 && resp.body.code === 200) {
                const d = resp.body.data;
                const purl = d?.vipmusic?.url || d?.play_url || d?.music_url || d?.url || d?.musicurl;
                if (purl) return purl;
            }
        } catch (e) { logError('直连 rid 方式失败', e); }
    }
    // 降级 n 方式
    const n = best.n || best.index || 1;
    const params = { key: '8Sbg8jJCnrssIDGDaz9', msg: songName, n: String(n) };
    if (source === 'kg') params.quality = 'flac';
    else if (source === 'tx') params.size = 'hq';
    const url = `${DIRECT_API_BASE}${upstream}?${buildQueryString(params)}`;
    const resp = await signedFetch(url);
    if (resp.statusCode !== 200) throw new Error(`详情请求失败`);
    const detail = resp.body;
    if (detail.code !== 200) throw new Error(detail.msg || '详情失败');
    const purl = detail.data?.vipmusic?.url || detail.data?.play_url || detail.data?.music_url || detail.data?.url || detail.data?.musicurl;
    if (!purl) throw new Error('未找到音频地址');
    return purl;
}

// 代理获取（仅支持 kg/migu/qq）
async function getMusicUrlViaProxy(source, musicInfo, quality) {
    const proxySource = DIRECT_SOURCE_PATH[source];
    if (!proxySource || !PROXY_SUPPORTED_SOURCES.has(proxySource)) throw new Error(`代理不支持此平台`);
    if (!backupApiAvailable) throw new Error('代理服务器离线');
    const best = await searchAndMatch(source, musicInfo.name || '', musicInfo.singer || '', true);
    if (!best) throw new Error('代理搜索无匹配');
    const n = best.n || best.index || 1;
    const params = { source: proxySource, msg: musicInfo.name || '', n: String(n) };
    if (proxySource === 'kg') params.quality = 'flac';
    else if (proxySource === 'qq') params.size = 'hq';
    const url = `${FALLBACK_PROXY_URL}?${buildQueryString(params)}`;
    const resp = await httpFetch(url);
    if (resp.statusCode !== 200) throw new Error(`代理详情 HTTP ${resp.statusCode}`);
    const detail = resp.body;
    if (detail.code !== 200) throw new Error(detail.msg || '获取失败');
    const purl = detail.data?.play_url || detail.data?.music_url || detail.data?.url || detail.data?.musicurl;
    if (!purl) throw new Error('代理未返回音频');
    return purl;
}

// ============================ 事件处理 ============================
on(EVENT_NAMES.request, ({ action, source, info }) => {
    if (action === 'musicUrl') {
        if (!info?.musicInfo || !info.type) return Promise.reject(new Error('参数不完整'));
        const { musicInfo, type: quality } = info;
        const songId = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
        if (!songId) return Promise.reject(new Error('歌曲信息不完整'));

        const avail = MUSIC_QUALITY_FULL[source] || ['128k', '192k', '320k', 'flac'];
        let actual = mapQuality(quality, avail);

        const finalUrl = (async () => {
            // 网易云VIP
            if (source === 'wy' && NETEASE_VIP_QUALITY_SET.has(actual) && neteaseVipApiStatus !== 'unavailable') {
                try {
                    const url = await getMusicUrlFromNeteaseVIP(songId, actual);
                    logSuccess(source, 'VIP', url);
                    return url;
                } catch (e) { logError('VIP失败', e); actual = 'flac24bit'; }
            }
            // GDAPI（可能被屏蔽）
            if (mainApiSourceMap[source] && gdApiStatus !== 'unavailable') {
                try {
                    const brMap = { '128k': '128', '192k': '192', '320k': '320', 'flac': '740', 'flac24bit': '999' };
                    const url = await getMusicUrlFromMainAPI(source, songId, brMap[actual] || '320');
                    logSuccess(source, 'GD', url);
                    return url;
                } catch (e) {
                    logError('GD失败', e);
                    if (source === 'kw') {
                        try {
                            const url = await getMusicUrlViaDirect(source, musicInfo, actual);
                            logSuccess(source, 'Kw直连', url);
                            return url;
                        } catch (e2) { logError('Kw直连失败', e2); }
                    }
                }
            }
            // 直连（kw 已在上面处理，其他平台使用密钥选择）
            if (isDirectAllowedForSource(source) && source !== 'kw') {
                if (!selectAndSetKeyVersion()) {
                    log('无可用密钥版本，跳过直连');
                } else {
                    try {
                        const url = await getMusicUrlViaDirect(source, musicInfo, actual);
                        logSuccess(source, '直连', url);
                        return url;
                    } catch (e) { logError('直连失败', e); }
                }
            }
            // 代理
            if (DIRECT_SOURCE_PATH[source] && backupApiAvailable) {
                const proxySource = DIRECT_SOURCE_PATH[source];
                if (PROXY_SUPPORTED_SOURCES.has(proxySource)) {
                    try {
                        const url = await getMusicUrlViaProxy(source, musicInfo, actual);
                        logSuccess(source, '代理', url);
                        return url;
                    } catch (e) { logError('代理失败', e); }
                }
            }
            throw new Error('无可用音源');
        })();

        return finalUrl.catch(err => {
            logError('最终获取URL失败', err, `平台: ${source}, 歌曲: ${musicInfo.name}`);
            return Promise.reject(err);
        });
    }

    if (action === 'search') {
        if (!['kg', 'tx', 'mg'].includes(source)) return Promise.reject(new Error('不支持搜索'));
        const keyword = info.key || info.keyword || '';
        if (!keyword) return Promise.reject(new Error('关键词为空'));
        const limit = info.limit || 20;
        const upstream = DIRECT_SOURCE_PATH[source];
        const st = yaohuPlatformStatus[upstream] || 'unknown';
        if (st === 'unavailable' || st === 'maintenance') return Promise.reject(new Error(`平台不可用（${st}）`));

        const doSearch = async () => {
            if (isDirectAllowedForSource(source)) {
                if (selectAndSetKeyVersion()) {
                    try {
                        const songs = await directSearch(upstream, keyword, limit);
                        return songs.map((s, i) => ({
                            singer: s.singer || s.author || '', name: s.title || s.name || '', album: s.album || '',
                            source, songmid: s.hash || s.mid || s.id || String(i),
                            interval: s.duration ? parseInt(s.duration) * 1000 : null, img: s.cover || '', lrc: null
                        }));
                    } catch (e) { logError('直连搜索失败', e); }
                }
            }
            const proxySource = DIRECT_SOURCE_PATH[source];
            if (!proxySource || !PROXY_SUPPORTED_SOURCES.has(proxySource)) throw new Error('无代理');
            const songs = await proxySearch(proxySource, keyword, limit);
            return songs.map((s, i) => ({
                singer: s.singer || s.author || '', name: s.title || s.name || '', album: s.album || '',
                source, songmid: s.hash || s.mid || s.id || String(i),
                interval: s.duration ? parseInt(s.duration) * 1000 : null, img: s.cover || '', lrc: null
            }));
        };

        return doSearch().then(songs => ({ list: songs, total: songs.length, limit, page: 1, source }));
    }

    return Promise.reject(new Error('不支持的操作'));
});

// ============================ 初始化 ============================
(async () => {
    console.log('[星海] v3.2.5 启动，环境：' + (env || 'unknown'));
    try {
        const server = await fetchServerStatus();
        musicSourceEnabled = true;
        backupApiAvailable = server.enabled;

        if (env === 'desktop') {
            stableSourcesList = ['netease', 'tencent', 'kuwo', 'kugou'];
        } else {
            await fetchStableSources();
            if (!stableSourcesList) stableSourcesList = ['netease', 'kuwo'];
        }
        buildPlatformsFromStableSources();
        filterAvailablePlatforms();
        fetchCredentials().catch(() => {});

        serverCheckCompleted = true;
        const sources = {};
        availablePlatforms.forEach(p => {
            sources[p] = {
                name: PLATFORM_NAME_MAP[p] || p,
                type: 'music',
                actions: ['musicUrl'],
                qualitys: MUSIC_QUALITY_FULL[p]
            };
        });

        send(EVENT_NAMES.inited, { status: true, openDevTools: false, sources });
        console.log(`[星海] 初始化完成，平台: ${availablePlatforms.join(',')}`);
        setTimeout(checkAutoUpdate, 3000);
    } catch (e) {
        logError('初始化异常', e);
        stableSourcesList = ['netease', 'kuwo'];
        buildPlatformsFromStableSources();
        if (availablePlatforms.length === 0) {
            availablePlatforms = env === 'desktop' ? ALL_PLATFORMS.filter(p => p !== 'mg') : [...ALL_PLATFORMS];
        }
        musicSourceEnabled = true;
        backupApiAvailable = false;
        serverCheckCompleted = true;
        const sources = {};
        availablePlatforms.forEach(p => {
            sources[p] = {
                name: PLATFORM_NAME_MAP[p] || p,
                type: 'music',
                actions: ['musicUrl'],
                qualitys: MUSIC_QUALITY_FULL[p]
            };
        });
        send(EVENT_NAMES.inited, { status: true, openDevTools: false, sources, initStatus: 'degraded' });
        setTimeout(checkAutoUpdate, 3000);
    }
})();

async function checkAutoUpdate() {
    try {
        const resp = await httpFetch(UPDATE_CONFIG.versionApiUrl, { timeout: 10000, headers: { 'User-Agent': 'LX-Music-Mobile' } });
        if (resp.statusCode !== 200) return;
        let data = resp.body; if (typeof data === 'string') data = JSON.parse(data.trim().replace(/^\uFEFF/, ''));
        if (!data?.version) return;
        const { version: remoteVer, changelog, update_url } = data;
        if (compareVersions(remoteVer, UPDATE_CONFIG.currentVersion)) {
            send(EVENT_NAMES.updateAlert, {
                log: `发现新版本 ${remoteVer}\n${changelog || ''}`,
                updateUrl: update_url || UPDATE_CONFIG.latestScriptUrl
            });
        }
    } catch (e) { /* 静默 */ }
}

function compareVersions(a, b) {
    const p = v => v.replace(/^v/, '').split('.').map(x => { const n = parseInt(x); return isNaN(n) ? x : n; });
    const x = p(a), y = p(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
        const av = x[i] ?? (typeof y[i] === 'number' ? 0 : ''), bv = y[i] ?? (typeof x[i] === 'number' ? 0 : '');
        if (typeof av === 'number' && typeof bv === 'number') { if (av > bv) return true; if (av < bv) return false; }
        else { if (typeof av === 'number' && typeof bv === 'string') return true; if (typeof av === 'string' && typeof bv === 'number') return false; }
    }
    return false;
}