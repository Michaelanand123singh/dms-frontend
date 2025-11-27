/**
 * useCustomers Hook - React hook for customer data fetching
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { customerService } from "@/services/customers";
import type { CustomerWithVehicles, NewCustomerForm, CustomerSearchType } from "@/shared/types";
import { getErrorMessage } from "@/lib/api";

interface UseCustomersOptions {
  autoFetch?: boolean;
}

interface UseCustomersReturn {
  customers: CustomerWithVehicles[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const { autoFetch = false } = options;
  const [customers, setCustomers] = useState<CustomerWithVehicles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCustomers();
    }
  }, [autoFetch, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
  };
}

interface UseCustomerReturn {
  customer: CustomerWithVehicles | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomer(id: number | string | null): UseCustomerReturn {
  const [customer, setCustomer] = useState<CustomerWithVehicles | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) {
      setCustomer(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getById(id);
      setCustomer(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer,
  };
}

interface UseCustomerSearchReturn {
  results: CustomerWithVehicles[];
  loading: boolean;
  error: string | null;
  search: (query: string, type?: CustomerSearchType) => Promise<void>;
  clear: () => void;
}

export function useCustomerSearch(): UseCustomerSearchReturn {
  const [results, setResults] = useState<CustomerWithVehicles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, type: CustomerSearchType = "auto") => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await customerService.search(query, type);
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}

interface UseCreateCustomerReturn {
  loading: boolean;
  error: string | null;
  createCustomer: (data: NewCustomerForm) => Promise<CustomerWithVehicles | null>;
}

export function useCreateCustomer(): UseCreateCustomerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(async (data: NewCustomerForm): Promise<CustomerWithVehicles | null> => {
    setLoading(true);
    setError(null);
    try {
      const customer = await customerService.create(data);
      return customer;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCustomer,
  };
}

interface UseRecentCustomersReturn {
  customers: CustomerWithVehicles[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentCustomers(limit: number = 10): UseRecentCustomersReturn {
  const [customers, setCustomers] = useState<CustomerWithVehicles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getRecent(limit);
      setCustomers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return {
    customers,
    loading,
    error,
    refetch: fetchRecent,
  };
}

