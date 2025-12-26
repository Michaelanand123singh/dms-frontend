import { API_ENDPOINTS } from "@/config/api.config";
import { apiClient } from "@/core/api/client";
import type { ServiceCenterInvoice, ServiceCenterInvoiceItem, EnhancedServiceCenterInvoiceItem, PaymentStatus } from "@/shared/types/invoice.types";

interface CreateInvoicePayload {
    serviceCenterId: string;
    customerId: string;
    vehicleId: string;
    jobCardId?: string;
    items: {
        name: string;
        hsnSacCode?: string;
        unitPrice: number;
        quantity: number;
        gstRate: number;
    }[];
    placeOfSupply?: string;
}

interface InvoiceFilterParams {
    serviceCenterId?: string;
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
}

class InvoicesService {
    /**
     * Fetch all invoices with optional filtering
     */
    async getAll(params?: InvoiceFilterParams): Promise<ServiceCenterInvoice[]> {
        try {
            const response = await apiClient.get<any[]>(API_ENDPOINTS.INVOICES, { params: params as any });

            // Transform backend data to frontend ServiceCenterInvoice type
            return response.data.map(this.transformBackendToFrontend);
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
            throw error;
        }
    }

    /**
     * Create a new invoice
     */
    async create(payload: CreateInvoicePayload): Promise<ServiceCenterInvoice> {
        try {
            const response = await apiClient.post<any>(API_ENDPOINTS.INVOICES, payload);
            return this.transformBackendToFrontend(response);
        } catch (error) {
            console.error("Failed to create invoice:", error);
            throw error;
        }
    }

    /**
     * Get a single invoice by ID
     */
    async getById(id: string): Promise<ServiceCenterInvoice> {
        try {
            const response = await apiClient.get<any>(API_ENDPOINTS.INVOICE(id));
            return this.transformBackendToFrontend(response);
        } catch (error) {
            console.error(`Failed to fetch invoice ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update invoice status (e.g. mark as PAID)
     */
    async updateStatus(id: string, status: "PAID" | "CANCELLED"): Promise<ServiceCenterInvoice> {
        try {
            // Note: Backend endpoint is PATCH /invoices/:id/status
            const response = await apiClient.patch<any>(`${API_ENDPOINTS.INVOICES}/${id}/status`, { status });
            return this.transformBackendToFrontend(response);
        } catch (error) {
            console.error(`Failed to update invoice status ${id}:`, error);
            throw error;
        }
    }

    /**
     * Transform backend invoice entity to frontend ServiceCenterInvoice type
     */
    private transformBackendToFrontend(backendInvoice: any): ServiceCenterInvoice {
        // Map items
        const enhancedItems: EnhancedServiceCenterInvoiceItem[] = backendInvoice.items?.map((item: any) => {
            const taxable = item.unitPrice * item.quantity;
            const taxAmount = (taxable * item.gstRate) / 100;
            // Approximation for CGST/SGST/IGST split if not provided
            // Backend calculates these on create but might not return them on item level in DTO sometimes
            // Ideally backend should return these. Assuming backend item entity has fields.
            return {
                name: item.name,
                hsnSacCode: item.hsnSacCode,
                unitPrice: Number(item.unitPrice),
                quantity: Number(item.quantity),
                taxableAmount: taxable,
                gstRate: Number(item.gstRate),
                cgstAmount: 0, // Backend doesn't store per-item tax split usually, only total. 
                sgstAmount: 0,
                igstAmount: 0,
                totalAmount: taxable + taxAmount
            };
        }) || [];

        // Legacy items for display compatibility
        const legacyItems: ServiceCenterInvoiceItem[] = enhancedItems.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: `₹${item.totalAmount.toLocaleString('en-IN')}`,
            // optional extended fields
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalAmount: item.totalAmount
        }));

        return {
            id: backendInvoice.id,
            invoiceNumber: backendInvoice.invoiceNumber,
            jobCardId: backendInvoice.jobCardId,
            customerId: backendInvoice.customerId,
            vehicleId: backendInvoice.vehicleId,
            // Backend includes relations: customer, vehicle
            customerName: backendInvoice.customer?.name || "Unknown Customer",
            vehicle: backendInvoice.vehicle?.registration || "Unknown Vehicle",

            date: new Date(backendInvoice.createdAt).toISOString().split('T')[0], // Using createdAt as date
            dueDate: new Date(new Date(backendInvoice.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days

            amount: `₹${Number(backendInvoice.grandTotal).toLocaleString('en-IN')}`,
            paidAmount: backendInvoice.status === 'PAID' ? `₹${Number(backendInvoice.grandTotal).toLocaleString('en-IN')}` : "₹0",
            balance: backendInvoice.status === 'PAID' ? "₹0" : `₹${Number(backendInvoice.grandTotal).toLocaleString('en-IN')}`,

            status: backendInvoice.status === 'PAID' ? 'Paid' : backendInvoice.status === 'CANCELLED' ? 'Overdue' : 'Unpaid', // Mapping generic statuses
            paymentMethod: null, // Backend doesn't store this on invoice entity itself yet, or it's not in the findOne response

            serviceCenterId: backendInvoice.serviceCenterId,

            items: legacyItems,
            enhancedItems: enhancedItems,

            // Extended fields
            subtotal: Number(backendInvoice.subtotal),
            totalTax: (Number(backendInvoice.cgst) + Number(backendInvoice.sgst) + Number(backendInvoice.igst || 0)),
            grandTotal: Number(backendInvoice.grandTotal),
            totalCgst: Number(backendInvoice.cgst),
            totalSgst: Number(backendInvoice.sgst),
            totalIgst: Number(backendInvoice.igst || 0),
        };
    }
}

export const invoicesService = new InvoicesService();
