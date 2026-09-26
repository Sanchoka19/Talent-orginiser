/**
 * ArtistePulse API Client for talent-server
 * Default Base URL: http://localhost:3000/api/v1
 */

import type {
  Talent,
  Group,
  Venue,
  Schedule,
  DutySwapRequest,
  FairnessScoreResponse,
} from '@talent/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      response.status,
      errorData?.message || `API request failed with status ${response.status}`,
      errorData,
    );
  }

  return response.json();
}

export const api = {
  // ─── Talents ──────────────────────────────────────────────────────────────
  talents: {
    getAll: (params?: { organizationId?: string; search?: string; status?: string; isArchived?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.organizationId) query.set('organizationId', params.organizationId);
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      if (params?.isArchived !== undefined) query.set('isArchived', String(params.isArchived));
      const qs = query.toString() ? `?${query.toString()}` : '';
      return fetchJson<Talent[]>(`/talents${qs}`);
    },
    getById: (id: string) => fetchJson<Talent>(`/talents/${id}`),
    create: (data: Partial<Talent>) => fetchJson<Talent>('/talents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Talent>) => fetchJson<Talent>(`/talents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<{ message: string }>(`/talents/${id}`, { method: 'DELETE' }),
    addContract: (talentId: string, data: any) =>
      fetchJson<any>(`/talents/${talentId}/contracts`, { method: 'POST', body: JSON.stringify(data) }),
    getArchiveDossiers: (params?: { organizationId?: string; year?: number; contractStatus?: string; rehireStatus?: string }) => {
      const query = new URLSearchParams();
      if (params?.organizationId) query.set('organizationId', params.organizationId);
      if (params?.year) query.set('year', String(params.year));
      if (params?.contractStatus) query.set('contractStatus', params.contractStatus);
      if (params?.rehireStatus) query.set('rehireStatus', params.rehireStatus);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return fetchJson<any[]>(`/talents/archive/dossiers${qs}`);
    },
  },

  // ─── Groups ───────────────────────────────────────────────────────────────
  groups: {
    getAll: (organizationId?: string) => {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return fetchJson<Group[]>(`/groups${qs}`);
    },
    getById: (id: string) => fetchJson<Group>(`/groups/${id}`),
    create: (data: Partial<Group>) => fetchJson<Group>('/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Group>) => fetchJson<Group>(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<{ message: string }>(`/groups/${id}`, { method: 'DELETE' }),
    addMember: (groupId: string, talentId: string, roleNote?: string) =>
      fetchJson<any>(`/groups/${groupId}/members/${talentId}`, { method: 'POST', body: JSON.stringify({ roleNote }) }),
    removeMember: (groupId: string, talentId: string) =>
      fetchJson<any>(`/groups/${groupId}/members/${talentId}`, { method: 'DELETE' }),
  },

  // ─── Venues ───────────────────────────────────────────────────────────────
  venues: {
    getAll: (organizationId?: string) => {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return fetchJson<Venue[]>(`/venues${qs}`);
    },
    getById: (id: string) => fetchJson<Venue>(`/venues/${id}`),
    create: (data: Partial<Venue>) => fetchJson<Venue>('/venues', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Venue>) => fetchJson<Venue>(`/venues/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<{ message: string }>(`/venues/${id}`, { method: 'DELETE' }),
  },

  // ─── Schedules ────────────────────────────────────────────────────────────
  schedules: {
    getAll: (params?: { organizationId?: string; groupId?: string; hotelId?: string }) => {
      const query = new URLSearchParams();
      if (params?.organizationId) query.set('organizationId', params.organizationId);
      if (params?.groupId) query.set('groupId', params.groupId);
      if (params?.hotelId) query.set('hotelId', params.hotelId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return fetchJson<Schedule[]>(`/schedules${qs}`);
    },
    getById: (id: string) => fetchJson<Schedule>(`/schedules/${id}`),
    create: (data: Partial<Schedule>) => fetchJson<Schedule>('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Schedule>) => fetchJson<Schedule>(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<{ message: string }>(`/schedules/${id}`, { method: 'DELETE' }),
    regenerateDuties: (id: string) => fetchJson<any>(`/schedules/${id}/regenerate-duties`, { method: 'POST' }),
  },

  // ─── Duties & Fairness ────────────────────────────────────────────────────
  duties: {
    swap: (data: DutySwapRequest) => fetchJson<any>('/duties/swap', { method: 'POST', body: JSON.stringify(data) }),
    getFairnessScore: (groupId: string, cycleWeeks: number = 1) =>
      fetchJson<FairnessScoreResponse>(
        `/duties/fairness-score/${groupId}?cycleWeeks=${cycleWeeks}`,
      ),
    getLedger: (params?: { groupId?: string; talentId?: string; cycleKey?: string }) => {
      const query = new URLSearchParams();
      if (params?.groupId) query.set('groupId', params.groupId);
      if (params?.talentId) query.set('talentId', params.talentId);
      if (params?.cycleKey) query.set('cycleKey', params.cycleKey);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return fetchJson<any[]>(`/duties/ledger${qs}`);
    },
  },
};
