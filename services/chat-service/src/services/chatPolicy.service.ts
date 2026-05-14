import {
  getUserById,
  getBuyerIdsForBoutique,
  getMyBoutiqueIds,
} from './userDirectory.service';

export type Role =
  | 'admin'
  | 'boutiques_manager'
  | 'boutique_owner'
  | 'client'
  | 'delivery_person'
  | 'delivery_manager';

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

const noRestrictionRoles: Role[] = ['admin', 'boutiques_manager'];

// Admin and boutiques_manager can chat with anyone.
// boutique_owner can only chat with: admin, boutiques_manager, or a client who has placed an order with one of their boutiques.
// Other roles default to: chat only with admin / boutiques_manager.
export const canChatWith = async (
  meRole: string,
  meId: string,
  peerId: string
): Promise<PolicyResult> => {
  const role = (meRole || '').toLowerCase() as Role;

  if (noRestrictionRoles.includes(role)) return { allowed: true };

  const peer = await getUserById(peerId);
  if (!peer) return { allowed: false, reason: 'Target user not found' };

  const peerRole = (peer.role || '').toLowerCase() as Role;

  // The peer is admin/manager — always allowed (anyone can reach support).
  if (noRestrictionRoles.includes(peerRole)) return { allowed: true };

  if (role === 'boutique_owner') {
    if (peerRole !== 'client') {
      return {
        allowed: false,
        reason: 'Boutique owners can only chat with admins, managers, or their customers',
      };
    }
    const myBoutiqueIds = await getMyBoutiqueIds(meId);
    if (!myBoutiqueIds.length) {
      return { allowed: false, reason: 'You have no boutique to derive customers from' };
    }
    const buyerIdSets = await Promise.all(myBoutiqueIds.map(getBuyerIdsForBoutique));
    const allBuyerIds = new Set<string>();
    for (const set of buyerIdSets) for (const id of set) allBuyerIds.add(id);
    if (!allBuyerIds.has(peerId)) {
      return { allowed: false, reason: 'You can only chat with customers who have ordered from you' };
    }
    return { allowed: true };
  }

  // Clients / drivers / etc. — allowed to message admin/manager only (handled above).
  // For peer-to-peer between non-managers, deny.
  return {
    allowed: false,
    reason: 'You are not allowed to start a conversation with this user',
  };
};
