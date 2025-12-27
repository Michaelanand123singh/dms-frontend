import type { LucideIcon } from "lucide-react";

/**
 * Dashboard card configuration
 */
export interface DashboardCard {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  text: string;
}

/**
 * Alert notification interface
 */
export interface Alert {
  icon: LucideIcon;
  color: string;
  title: string;
  time: string;
  action?: string;
  link?: string;
}

/**
 * Quick action button configuration
 */
export interface QuickAction {
  label: string;
  icon: LucideIcon;
  bg: string;
  link: string;
}

/**
 * Menu item configuration
 */
export interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
}

/**
 * Filter option type
 */
export type FilterOption = "all" | string;

/**
 * View type for list/kanban
 */
export type ViewType = "list" | "kanban" | "calendar";

/**
 * Service location type - shared across service requests and job cards
 */
export type ServiceLocation = "STATION" | "DOORSTEP";

/**
 * Priority type - shared across job cards, workshop, and other modules
 */
export type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

