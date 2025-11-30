/**
 * Mock Customer Repository - Simulates database operations
 */

import { mockCustomers } from "../data/customers.mock";
import { safeStorage } from "@/shared/lib/localStorage";
import type { CustomerWithVehicles, NewCustomerForm, CustomerSearchType } from "@/shared/types";
import { ApiError } from "@/lib/api/errors";

class CustomerRepository {
  private customers: CustomerWithVehicles[];

  constructor() {
    // Load from localStorage if available, otherwise use mock data
    const stored = safeStorage.getItem<CustomerWithVehicles[]>("mockCustomers", []);
    this.customers = stored.length > 0 ? stored : [...mockCustomers];
  }

  private saveToStorage(): void {
    safeStorage.setItem("mockCustomers", this.customers);
  }

  async getAll(): Promise<CustomerWithVehicles[]> {
    return [...this.customers];
  }

  async getById(id: number | string): Promise<CustomerWithVehicles | null> {
    const customer = this.customers.find((c) => String(c.id) === String(id));
    return customer ? { ...customer } : null;
  }

  async search(query: string, type: CustomerSearchType): Promise<CustomerWithVehicles[]> {
    const lowerQuery = query.toLowerCase().trim();
    const results: CustomerWithVehicles[] = [];

    if (type === "phone") {
      const cleaned = query.replace(/[\s-+]/g, "").replace(/^91/, "");
      this.customers.forEach((customer) => {
        if (customer.phone.includes(cleaned)) {
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

    return results;
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

    // Create new customer
    const newCustomer: CustomerWithVehicles = {
      id: Math.max(...this.customers.map((c) => Number(c.id)), 0) + 1,
      customerNumber,
      name: data.name,
      phone: cleanedPhone,
      email: data.email || undefined,
      address: data.address || undefined,
      createdAt: new Date().toISOString().split("T")[0],
      totalVehicles: 0,
      totalSpent: "₹0",
      vehicles: [],
    };

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
    let recentIds = safeStorage.getItem<number[]>("recentCustomerIds", []);
    
    // If no recent customers, initialize with first few customers from mock data
    if (recentIds.length === 0 && this.customers.length > 0) {
      recentIds = this.customers.slice(0, Math.min(limit, this.customers.length)).map((c) => c.id);
      safeStorage.setItem("recentCustomerIds", recentIds);
    }
    
    const recentCustomers = recentIds
      .map((id) => this.customers.find((c) => c.id === id))
      .filter((c): c is CustomerWithVehicles => c !== undefined)
      .slice(0, limit);

    return recentCustomers.map((c) => ({ ...c }));
  }

  async addToRecent(id: number | string): Promise<void> {
    const recentIds = safeStorage.getItem<number[]>("recentCustomerIds", []);
    const numId = Number(id);
    
    // Remove if already exists
    const filtered = recentIds.filter((rid) => rid !== numId);
    
    // Add to beginning
    const updated = [numId, ...filtered].slice(0, 10);
    safeStorage.setItem("recentCustomerIds", updated);
  }
}

export const customerRepository = new CustomerRepository();

