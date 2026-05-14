import { Request, Response } from 'express';
import {
  searchUsers,
  listByRole,
  getBuyersForOwner,
  getUsersByIds,
  getMyBoutiqueIds,
  lastErrors,
} from '../services/userDirectory.service';

const NO_RESTRICTION_ROLES = new Set(['admin', 'boutiques_manager']);

const me = (req: Request) => req.chatUser!;

const stripSelf = (id: string, users: any[]) => users.filter((u) => u.id !== id);

const debugBlock = () => {
  const debug: Record<string, string> = {};
  if (lastErrors.user) debug.user = lastErrors.user;
  if (lastErrors.order) debug.order = lastErrors.order;
  if (lastErrors.token) debug.token = lastErrors.token;
  if (!process.env.JWT_SECRET) debug.env = 'JWT_SECRET is not set in chat-service env';
  return Object.keys(debug).length ? debug : undefined;
};

export const getContacts = async (req: Request, res: Response): Promise<void> => {
  const u = me(req);
  const role = (u.role || '').toLowerCase();
  const { q, role: roleFilter, limit, page } = req.query as Record<string, string>;

  if (NO_RESTRICTION_ROLES.has(role)) {
    const [admins, managers, boutiqueOwners, customers] = await Promise.all([
      listByRole('admin', 200),
      listByRole('boutiques_manager', 200),
      listByRole('boutique_owner', 200),
      listByRole('client', 200),
    ]);
    const filterByQuery = (arr: any[]) => {
      if (!q) return arr;
      const needle = q.toLowerCase();
      return arr.filter(
        (x) =>
          (x.name || '').toLowerCase().includes(needle) ||
          (x.email || '').toLowerCase().includes(needle)
      );
    };
    res.json({
      mode: 'buckets',
      buckets: {
        admins: stripSelf(u.id, filterByQuery(admins)),
        managers: stripSelf(u.id, filterByQuery(managers)),
        boutiqueOwners: stripSelf(u.id, filterByQuery(boutiqueOwners)),
        customers: stripSelf(u.id, filterByQuery(customers)),
      },
      meta: { callerRole: role },
      debug: debugBlock(),
    });
    return;
  }

  if (role === 'boutique_owner') {
    const [admins, managers, customers, boutiqueIds] = await Promise.all([
      listByRole('admin', 100),
      listByRole('boutiques_manager', 100),
      getBuyersForOwner(u.id),
      getMyBoutiqueIds(u.id),
    ]);
    const filterByQuery = (arr: any[]) => {
      if (!q) return arr;
      const needle = q.toLowerCase();
      return arr.filter(
        (x) =>
          (x.name || '').toLowerCase().includes(needle) ||
          (x.email || '').toLowerCase().includes(needle)
      );
    };
    res.json({
      mode: 'buckets',
      buckets: {
        admins: stripSelf(u.id, filterByQuery(admins)),
        managers: stripSelf(u.id, filterByQuery(managers)),
        customers: stripSelf(u.id, filterByQuery(customers)),
      },
      meta: {
        callerRole: role,
        myBoutiqueCount: boutiqueIds.length,
      },
      debug: debugBlock(),
    });
    return;
  }

  const [admins, managers] = await Promise.all([
    listByRole('admin', 50),
    listByRole('boutiques_manager', 50),
  ]);
  res.json({
    mode: 'buckets',
    buckets: {
      admins: stripSelf(u.id, admins),
      managers: stripSelf(u.id, managers),
    },
    meta: { callerRole: role },
    debug: debugBlock(),
  });
};

export const resolveUsers = async (req: Request, res: Response): Promise<void> => {
  const idsParam = (req.query.ids as string) || '';
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (!ids.length) {
    res.json({ users: {} });
    return;
  }
  const map = await getUsersByIds(ids);
  res.json({ users: map });
};
