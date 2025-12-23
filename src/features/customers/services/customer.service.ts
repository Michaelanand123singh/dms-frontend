/**
 * Customer Service - Business logic layer for customer operations
 */

import { customerRepository } from "@/core/repositories/customer.repository";
import type { CustomerWithVehicles, NewCustomerForm, CustomerSearchType } from "@/shared/types";

class CustomerService {
  async getAll(): Promise<CustomerWithVehicles[]> {
    return customerRepository.getAll();
  }

  async getById(id: number | string): Promise<CustomerWithVehicles> {
    return customerRepository.getById(String(id));
  }

  async search(query: string, type: CustomerSearchType = "auto"): Promise<CustomerWithVehicles[]> {
    return customerRepository.search(query, type);
  }

  async getRecent(limit: number = 10, params?: Record<string, any>): Promise<CustomerWithVehicles[]> {
    return customerRepository.getAll({ limit, sort: 'recent', ...params });
  }

  async create(data: NewCustomerForm): Promise<CustomerWithVehicles> {
    // Map frontend form data to backend DTO structure
    // This ensures we only send fields the backend expects and map mismatches
    const backendPayload = {
      name: data.name,
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      alternateNumber: data.alternateNumber,
      email: data.email,
      address: data.address,
      cityState: data.cityState,
      pincode: data.pincode,
      customerType: data.customerType || 'B2C'
    };

    return customerRepository.create(backendPayload as any);
  }

  async update(id: number | string, data: Partial<CustomerWithVehicles>): Promise<CustomerWithVehicles> {
    return customerRepository.update(String(id), data);
  }

  async delete(id: number | string): Promise<void> {
    return customerRepository.delete(String(id));
  }
}

export const customerService = new CustomerService();

