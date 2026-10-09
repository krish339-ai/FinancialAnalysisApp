import { z } from 'zod';
import type { Transaction } from './types';
import { requireOwnership, type Principal } from '../server/authorization';
const editSchema = z.object({ description: z.string().trim().min(1).max(200).optional(), category: z.string().trim().min(1).max(60).optional() }).strict();
// Prepared for an authenticated service. Not exposed as a real-data mutation endpoint.
export function editTransaction(record: Transaction, patch: unknown, principal: Principal | null): Transaction { requireOwnership(principal, record.workspaceId); return { ...record, ...editSchema.parse(patch) }; }
