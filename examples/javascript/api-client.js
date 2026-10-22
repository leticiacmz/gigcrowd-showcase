/**
 * Read-only GigCrowd API client for portfolio examples.
 *
 * The client deliberately allows GET requests only, so running the examples
 * cannot register accounts, import artists, follow artists, or modify data.
 * Requires a runtime with the Fetch API (Node.js 18+ or a modern browser).
 */

const DEFAULT_API_BASE = 'https://gigcrowd-api.onrender.com';

class GigCrowdClient {
  constructor(baseUrl = DEFAULT_API_BASE, token = null) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  setToken(token) {
    this.token = token || null;
  }

  async request(endpoint, options = {}) {
    const { method: requestedMethod = 'GET', body, ...requestOptions } = options;
    if (String(requestedMethod).toUpperCase() !== 'GET' || body !== undefined) {
      throw new Error('This showcase client permits GET requests only and does not accept request bodies.');
    }

    const headers = { Accept: 'application/json', ...(requestOptions.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...requestOptions,
      method: 'GET',
      headers,
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw_response: text };
      }
    }

    if (!response.ok) {
      const detail = data && typeof data === 'object' ? data.detail : null;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg || JSON.stringify(item)).join('; ')
        : detail || `HTTP ${response.status} ${response.statusText}`;
      const error = new Error(message);
      error.status = response.status;
      error.url = `${this.baseUrl}${endpoint}`;
      throw error;
    }

    return data;
  }

  async healthCheck() {
    return this.request('/health');
  }

  /** Read-only discovery; the API contract states this does not import/sync. */
  async unifiedSearch({ q, genre, limit = 20, before, beforeId } = {}) {
    if (!q || !String(q).trim()) {
      throw new TypeError('unifiedSearch requires a non-empty q value.');
    }

    const params = new URLSearchParams({ q: String(q).trim() });
    params.set('limit', String(limit));
    if (genre) params.set('genre', genre);
    if (before) params.set('before', before);
    if (beforeId) params.set('before_id', beforeId);

    return this.request(`/search?${params.toString()}`);
  }

  async searchEvents({ q, genre, limit = 20, before, beforeId, includePast = false } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (q) params.set('q', q);
    if (genre) params.set('genre', genre);
    if (before) params.set('before', before);
    if (beforeId) params.set('before_id', beforeId);
    if (includePast) params.set('include_past', 'true');

    return this.request(`/events?${params.toString()}`);
  }

  async getGenres() {
    return this.request('/events/genres');
  }

  async getArtists({ limit = 20, skip = 0 } = {}) {
    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    return this.request(`/artists?${params.toString()}`);
  }

  async getArtistEvents(artistSlug) {
    return this.request(`/artists/${encodeURIComponent(artistSlug)}/events`);
  }

  async getAllArtistEvents(artistSlug, { limit = 1000, offset = 0 } = {}) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    return this.request(`/artists/${encodeURIComponent(artistSlug)}/events/all?${params.toString()}`);
  }

  async getEvent(eventId) {
    return this.request(`/events/${encodeURIComponent(eventId)}`);
  }

  async getEventFestival(eventId) {
    return this.request(`/events/${encodeURIComponent(eventId)}/festival`);
  }

  async getPublicUserProfile(username) {
    return this.request(`/users/profile/${encodeURIComponent(username)}`);
  }

  /** Requires a token from an account you control; still performs a GET only. */
  async getMe() {
    if (!this.token) throw new Error('Set a bearer token before calling getMe().');
    return this.request('/users/me');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GigCrowdClient;
}
