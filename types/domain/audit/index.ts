export interface AuditLog {
  id: string;
  requestId?: string | null;
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ip?: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
}
