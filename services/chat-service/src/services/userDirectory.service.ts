import jwt from 'jsonwebtoken';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export interface DirectoryUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  boutiqueList?: string[];
}

export const lastErrors: { user?: string; order?: string; token?: string } = {};

const serviceToken = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    lastErrors.token = 'JWT_SECRET not configured in chat-service';
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(
    { id: 'chat-service', email: 'chat-service@internal', role: 'admin' },
    secret,
    { expiresIn: '2m' }
  );
};

const headers = (): Record<string, string> => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    h.Authorization = `Bearer ${serviceToken()}`;
  } catch {
    /* token error already recorded */
  }
  return h;
};

const normalize = (u: any): DirectoryUser => ({
  id: String(u._id || u.id),
  name: u.name,
  email: u.email,
  avatar: u.avatar || u.profilePicture,
  role: u.role,
  boutiqueList: (u.boutiqueList || []).map(String),
});

const safeText = async (res: Response): Promise<string> => {
  try {
    return (await res.text()).slice(0, 400);
  } catch {
    return '';
  }
};

if (typeof (globalThis as any).fetch !== 'function') {
  console.error('Chat Service: global fetch is not available. Node >= 18 is required.');
}

export const searchUsers = async ({
  q,
  role,
  page = 1,
  limit = 20,
}: {
  q?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<DirectoryUser[]> => {
  const params = new URLSearchParams();
  if (q) params.set('search', q);
  if (role) params.set('role', role);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const url = `${USER_SERVICE_URL}/api/users?${params.toString()}`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const body = await safeText(res);
      lastErrors.user = `${res.status} ${res.statusText} on ${url} :: ${body}`;
      console.error('Chat Service: user-service search failed', lastErrors.user);
      return [];
    }
    const body = (await res.json()) as any;
    const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    return list.map(normalize);
  } catch (err: any) {
    lastErrors.user = `${err.code || ''} ${err.message || String(err)} on ${url}`;
    console.error('Chat Service: userDirectory.searchUsers failed', lastErrors.user);
    return [];
  }
};

export const getUserById = async (id: string): Promise<DirectoryUser | null> => {
  const url = `${USER_SERVICE_URL}/api/users/${id}`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const body = await safeText(res);
      lastErrors.user = `${res.status} ${res.statusText} on ${url} :: ${body}`;
      console.error('Chat Service: user-service getUserById failed', lastErrors.user);
      return null;
    }
    const body = (await res.json()) as any;
    const u = body?.data || body;
    if (!u) return null;
    return normalize(u);
  } catch (err: any) {
    lastErrors.user = `${err.code || ''} ${err.message || String(err)} on ${url}`;
    console.error('Chat Service: userDirectory.getUserById failed', lastErrors.user);
    return null;
  }
};

export const getUsersByIds = async (ids: string[]): Promise<Record<string, DirectoryUser>> => {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const result: Record<string, DirectoryUser> = {};
  await Promise.all(
    unique.map(async (id) => {
      const u = await getUserById(id);
      if (u) result[id] = u;
    })
  );
  return result;
};

export const listByRole = async (role: string, limit = 200): Promise<DirectoryUser[]> => {
  return searchUsers({ role, page: 1, limit });
};

export const getBuyerIdsForBoutique = async (boutiqueId: string): Promise<string[]> => {
  if (!boutiqueId) return [];
  const url = `${ORDER_SERVICE_URL}/api/orders?boutiqueId=${encodeURIComponent(boutiqueId)}&limit=500`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const body = await safeText(res);
      lastErrors.order = `${res.status} ${res.statusText} on ${url} :: ${body}`;
      console.error('Chat Service: order-service buyers fetch failed', lastErrors.order);
      return [];
    }
    const body = (await res.json()) as any;
    const orders = body?.data?.orders || body?.orders || [];
    const ids = new Set<string>();
    for (const o of orders) if (o.userId) ids.add(String(o.userId));
    return Array.from(ids);
  } catch (err: any) {
    lastErrors.order = `${err.code || ''} ${err.message || String(err)} on ${url}`;
    console.error('Chat Service: userDirectory.getBuyerIdsForBoutique failed', lastErrors.order);
    return [];
  }
};

export const getMyBoutiqueIds = async (userId: string): Promise<string[]> => {
  const u = await getUserById(userId);
  return u?.boutiqueList || [];
};

export const getBuyersForOwner = async (ownerId: string): Promise<DirectoryUser[]> => {
  const boutiqueIds = await getMyBoutiqueIds(ownerId);
  if (!boutiqueIds.length) return [];
  const buyerIdSets = await Promise.all(boutiqueIds.map(getBuyerIdsForBoutique));
  const allIds = new Set<string>();
  for (const set of buyerIdSets) for (const id of set) allIds.add(id);
  if (!allIds.size) return [];
  const map = await getUsersByIds(Array.from(allIds));
  return Object.values(map);
};
