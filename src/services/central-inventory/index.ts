/**
 * Compatibility layer for old service imports
 * Re-exports from new feature-based inventory services (central inventory)
 * 
 * @deprecated Import from @/features/inventory/services instead
 */

export * from '@/features/inventory/services/adminApproval.service';
export * from '@/features/inventory/services/centralIssue.service';
export * from '@/features/inventory/services/centralPurchaseOrder.service';
export * from '@/features/inventory/services/centralPurchaseOrderCreate.service';
export * from '@/features/inventory/services/centralStock.service';
export * from '@/features/inventory/services/invoice.service';
