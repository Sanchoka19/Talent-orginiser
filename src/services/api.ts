/**
 * ArtistePulse API Client for talent-server
 * Default Base URL: http://localhost:3000/api/v1
 */

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
      return fetchJson<any[]>(`/talents${qs}`);
    },
    getById: (id: string) => fetchJson<any>(`/talents/${id}`),
    create: (data: any) => fetchJson<any>('/talents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJson<any>(`/talents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<any>(`/talents/${id}`, { method: 'DELETE' }),
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
      return fetchJson<any[]>(`/groups${qs}`);
    },
    getById: (id: string) => fetchJson<any>(`/groups/${id}`),
    create: (data: any) => fetchJson<any>('/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJson<any>(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<any>(`/groups/${id}`, { method: 'DELETE' }),
    addMember: (groupId: string, talentId: string, roleNote?: string) =>
      fetchJson<any>(`/groups/${groupId}/members/${talentId}`, { method: 'POST', body: JSON.stringify({ roleNote }) }),
    removeMember: (groupId: string, talentId: string) =>
      fetchJson<any>(`/groups/${groupId}/members/${talentId}`, { method: 'DELETE' }),
  },

  // ─── Venues ───────────────────────────────────────────────────────────────
  venues: {
    getAll: (organizationId?: string) => {
      const qs = organizationId ? `?organizationId=${organizationId}` : '';
      return fetchJson<any[]>(`/venues${qs}`);
    },
    getById: (id: string) => fetchJson<any>(`/venues/${id}`),
    create: (data: any) => fetchJson<any>('/venues', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJson<any>(`/venues/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<any>(`/venues/${id}`, { method: 'DELETE' }),
  },

  // ─── Schedules ────────────────────────────────────────────────────────────
  schedules: {
    getAll: (params?: { organizationId?: string; groupId?: string; hotelId?: string }) => {
      const query = new URLSearchParams();
      if (params?.organizationId) query.set('organizationId', params.organizationId);
      if (params?.groupId) query.set('groupId', params.groupId);
      if (params?.hotelId) query.set('hotelId', params.hotelId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return fetchJson<any[]>(`/schedules${qs}`);
    },
    getById: (id: string) => fetchJson<any>(`/schedules/${id}`),
    create: (data: any) => fetchJson<any>('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchJson<any>(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJson<any>(`/schedules/${id}`, { method: 'DELETE' }),
    regenerateDuties: (id: string) => fetchJson<any>(`/schedules/${id}/regenerate-duties`, { method: 'POST' }),
  },

  // ─── Duties & Fairness ────────────────────────────────────────────────────
  duties: {
    swap: (data: {
      showEventId: string;
      dutyAssignmentId: string;
      originalTalentId: string;
      replacementTalentId: string;
      reason?: string;
    }) => fetchJson<any>('/duties/swap', { method: 'POST', body: JSON.stringify(data) }),
    getFairnessScore: (groupId: string, cycleWeeks: number = 1) =>
      fetchJson<{ groupId: string; cycleKey: string; score: number }>(
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
