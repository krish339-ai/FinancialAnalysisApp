export type Principal = { userId: string; workspaceIds: string[] };
export function requireOwnership(principal: Principal | null, workspaceId: string) {
  if (!principal || !principal.workspaceIds.includes(workspaceId)) throw new Error('Access denied');
  return workspaceId;
}
