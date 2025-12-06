/**
 * Mock Customer Repository - Simulates database operations
 */

import { mockCustomers } from "../data/customers.mock";
import { safeStorage } from "@/shared/lib/localStorage";
import type { CustomerWithVehicles, NewCustomerForm, CustomerSearchType } from "@/shared/types";
import { ApiError } from "@/lib/api/errors";

class CustomerRepository {
  private customers: CustomerWithVehicles[];

  private loadUserContext() {
    const userInfo = safeStorage.getItem<any>("userInfo", null);
    const userRole = safeStorage.getItem<any>("userRole", null);
    return {
      serviceCenterId: userInfo?.serviceCenter ?? null,
      userRole: userRole ?? null,
    };
  }

  private applyServiceCenterFilter(customers: CustomerWithVehicles[]): CustomerWithVehicles[] {
    const context = this.loadUserContext();
    if (context.userRole === "call_center" || !context.serviceCenterId) {
      return customers;
    }
    return customers.filter((customer) => String(customer.serviceCenterId) === String(context.serviceCenterId));
  }

  constructor() {
    // Load from localStorage if available, otherwise use mock data
    const stored = safeStorage.getItem<CustomerWithVehicles[]>("mockCustomers", []);
    this.customers = stored.length > 0 ? stored : [...mockCustomers];
  }

  private saveToStorage(): void {
    safeStorage.setItem("mockCustomers", this.customers);
  }

  async getAll(): Promise<CustomerWithVehicles[]> {
    return this.applyServiceCenterFilter([...this.customers]);
  }

  async getById(id: number | string): Promise<CustomerWithVehicles | null> {
    const customer = this.customers.find((c) => String(c.id) === String(id));
    return customer ? { ...customer } : null;
  }

  async search(query: string, type: CustomerSearchType): Promise<CustomerWithVehicles[]> {
    const lowerQuery = query.toLowerCase().trim();
    const results: CustomerWithVehicles[] = [];

    if (type === "phone") {
      const cleaned = query.replace(/[\s-+().]/g, "").replace(/^91/, "");
      this.customers.forEach((customer) => {
        const customerPhone = customer.phone.replace(/[\s-+().]/g, "").replace(/^91/, "");
        if (customerPhone.includes(cleaned) || cleaned.includes(customerPhone)) {
          results.push({ ...customer });
        }
      });
    } else if (type === "email") {
      this.customers.forEach((customer) => {
        if (customer.email?.toLowerCase().includes(lowerQuery)) {
          results.push({ ...customer });
        }
      });
    } else if (type === "customerNumber") {
      const upperQuery = query.toUpperCase().replace(/\s+/g, "");
      this.customers.forEach((customer) => {
        if (customer.customerNumber.toUpperCase().includes(upperQuery)) {
          results.push({ ...customer });
        }
      });
    } else if (type === "vin") {
      const upperQuery = query.toUpperCase();
      this.customers.forEach((customer) => {
        customer.vehicles.forEach((vehicle) => {
          if (vehicle.vin.toUpperCase().includes(upperQuery) && !results.find((r) => r.id === customer.id)) {
            results.push({ ...customer });
          }
        });
      });
    } else if (type === "vehicleNumber") {
      const upperQuery = query.toUpperCase().replace(/\s+/g, "");
      this.customers.forEach((customer) => {
        customer.vehicles.forEach((vehicle) => {
          if (vehicle.registration.toUpperCase().includes(upperQuery) && !results.find((r) => r.id === customer.id)) {
            results.push({ ...customer });
          }
        });
      });
    } else {
      // Name search
      this.customers.forEach((customer) => {
        if (customer.name.toLowerCase().includes(lowerQuery)) {
          results.push({ ...customer });
        }
      });
    }

    return this.applyServiceCenterFilter(results);
  }

  async create(data: NewCustomerForm): Promise<CustomerWithVehicles> {
    // Validate required fields
    if (!data.name || !data.phone) {
      throw new ApiError("Name and Phone are required fields", 400, "VALIDATION_ERROR");
    }

    // Validate phone
    const cleanedPhone = data.phone.replace(/[\s-+]/g, "").replace(/^91/, "");
    if (cleanedPhone.length !== 10 || !/^\d{10}$/.test(cleanedPhone)) {
      throw new ApiError("Please enter a valid 10-digit phone number", 400, "VALIDATION_ERROR");
    }

    // Normalize WhatsApp number, defaulting to primary phone if not provided
    const cleanedWhatsapp =
      data.whatsappNumber && data.whatsappNumber.trim().length > 0
        ? data.whatsappNumber.replace(/[\s-+]/g, "").replace(/^91/, "")
        : cleanedPhone;

    // Check if phone already exists
    const existing = this.customers.find((c) => c.phone === cleanedPhone);
    if (existing) {
      throw new ApiError("Customer with this phone number already exists", 409, "DUPLICATE_ERROR");
    }

    // Generate customer number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const customerNumber = `CUST-${year}-${random}`;

    const cleanedAlternateMobile = data.alternateMobile
      ? data.alternateMobile.replace(/[\s-+]/g, "").replace(/^91/, "")
      : undefined;

    const storedUserInfo = safeStorage.getItem<any>("userInfo", null);

    // Create new customer
    const highestIdNumber = this.customers
      .map((c) => {
        const numericPart = String(c.id).replace(/\D/g, "");
        return numericPart ? Number(numericPart) : 0;
      })
      .reduce((max, val) => Math.max(max, val), 0);
    const newCustomer: CustomerWithVehicles = {
      id: `cust-${String(highestIdNumber + 1).padStart(3, "0")}`,
      customerNumber,
      name: data.name,
      phone: cleanedPhone,
      whatsappNumber: cleanedWhatsapp,
      email: data.email || undefined,
      address: data.address || undefined,
      cityState: data.cityState || undefined,
      pincode: data.pincode || undefined,
      alternateMobile: cleanedAlternateMobile,
      customerType: data.customerType,
      serviceType: data.serviceType,
      addressType: data.addressType,
      workAddress: data.workAddress || undefined,
      pickupDropRequired: data.pickupDropRequired,
      pickupAddress: data.pickupDropRequired ? data.pickupAddress : undefined,
      dropAddress: data.pickupDropRequired ? data.dropAddress : undefined,
      createdAt: new Date().toISOString().split("T")[0],
      totalVehicles: 0,
      totalSpent: "₹0",
      vehicles: [],
    };

    const preferredServiceCenterId =
      data.serviceCenterId ??
      this.loadUserContext().serviceCenterId ??
      newCustomer.serviceCenterId ??
      "sc-001";
    const normalizedCenterId = String(preferredServiceCenterId).startsWith("sc-") 
      ? String(preferredServiceCenterId) 
      : `sc-${String(preferredServiceCenterId).padStart(3, "0")}`;
    newCustomer.serviceCenterId = normalizedCenterId;
    newCustomer.lastServiceCenterId = normalizedCenterId;
    newCustomer.lastServiceCenterName =
      data.serviceCenterName ?? storedUserInfo?.serviceCenter ?? undefined;
    this.customers.push(newCustomer);
    this.saveToStorage();

    return { ...newCustomer };
  }

  async update(id: number | string, data: Partial<CustomerWithVehicles>): Promise<CustomerWithVehicles> {
    const index = this.customers.findIndex((c) => String(c.id) === String(id));
    if (index === -1) {
      throw new ApiError("Customer not found", 404, "NOT_FOUND");
    }

    this.customers[index] = {
      ...this.customers[index],
      ...data,
      id: this.customers[index].id, // Preserve ID
    };

    this.saveToStorage();
    return { ...this.customers[index] };
  }

  async getRecent(limit: number = 10): Promise<CustomerWithVehicles[]> {
    // Get recent customers from localStorage
    let recentIds = safeStorage.getItem<string[]>("recentCustomerIds", []);
    
    // If no recent customers, initialize with first few customers from mock data
    if (recentIds.length === 0 && this.customers.length > 0) {
      recentIds = this.customers
        .slice(0, Math.min(limit, this.customers.length))
        .map((c) => String(c.id));
      safeStorage.setItem("recentCustomerIds", recentIds);
    }
    
    const recentCustomers = recentIds
      .map((id) => this.customers.find((c) => c.id === id))
      .filter((c): c is CustomerWithVehicles => c !== undefined)
      .slice(0, limit);

    return this.applyServiceCenterFilter(recentCustomers).map((c) => ({ ...c }));
  }

  async addToRecent(id: number | string): Promise<void> {
    const recentIds = safeStorage.getItem<string[]>("recentCustomerIds", []);
    const stringId = String(id);
    
    // Remove if already exists
    const filtered = recentIds.filter((rid) => rid !== stringId);
    
    // Add to beginning
    const updated = [stringId, ...filtered].slice(0, 10);
    safeStorage.setItem("recentCustomerIds", updated);
  }
}

export const customerRepository = new CustomerRepository();

