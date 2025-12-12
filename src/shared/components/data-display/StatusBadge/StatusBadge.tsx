"use client";
import { Badge } from "@/components/ui/Badge";

export type StatusType = 
  | "pending" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "approved" 
  | "rejected"
  | "active"
  | "inactive";

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info" }> = {
  pending: { label: "Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "default" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

