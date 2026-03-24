export class ResponseCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }
  _hash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
  get(data) {
    const key = this._hash(data);
    const entry = this.cache.get(key);
    if (!entry) return { hit: false, stale: false, data: null };
    const isExpired = Date.now() - entry.timestamp > this.ttlMs;
    return { hit: !isExpired, stale: isExpired, data: entry.data };
  }
  set(inputData, responseData) {
    const key = this._hash(inputData);
    this.cache.set(key, { data: responseData, timestamp: Date.now() });
  }
}
