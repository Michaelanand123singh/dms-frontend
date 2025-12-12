"use client";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface PriorityIndicatorProps {
  priority: Priority;
  showIcon?: boolean;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info"; icon: typeof AlertCircle }> = {
  low: { label: "Low", variant: "info", icon: Info },
  medium: { label: "Medium", variant: "warning", icon: AlertTriangle },
  high: { label: "High", variant: "danger", icon: AlertCircle },
  urgent: { label: "Urgent", variant: "danger", icon: AlertCircle },
};

export function PriorityIndicator({ priority, showIcon = true, className }: PriorityIndicatorProps) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon size={12} className="mr-1" />}
      {config.label}
    </Badge>
  );
}

