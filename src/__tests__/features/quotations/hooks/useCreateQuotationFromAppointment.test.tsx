import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateQuotationFromAppointment } from '@/features/quotations/hooks/useCreateQuotationFromAppointment';
import { quotationsService } from '@/features/quotations/services/quotations.service';
import { appointmentsService } from '@/features/appointments/services/appointments.service';
import { createMockAppointment, createMockQuotation } from '@/test/utils/mocks';
import type { Appointment } from '@/shared/types/appointment.types';

// Mock dependencies
vi.mock('@/features/quotations/services/quotations.service', () => ({
  quotationsService: {
    createFromAppointment: vi.fn(),
  },
}));

vi.mock('@/features/appointments/services/appointments.service', () => ({
  appointmentsService: {
    linkQuotation: vi.fn(),
  },
}));

describe('useCreateQuotationFromAppointment', () => {
  const mockAppointment: Appointment = createMockAppointment({
    id: 'apt-1',
    customerId: 'cust-1',
    vehicleId: 'veh-1',
    customerComplaint: 'Brake issue',
    previousServiceHistory: 'Regular service',
  }) as Appointment;

  const mockQuotation = createMockQuotation({
    id: 'quo-1',
    quotationNumber: 'QUO-001',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('creates quotation from appointment successfully', async () => {
    vi.mocked(quotationsService.createFromAppointment).mockResolvedValue(mockQuotation as any);
    vi.mocked(appointmentsService.linkQuotation).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    let quotation: any = null;

    await act(async () => {
      quotation = await result.current.createQuotation(mockAppointment);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quotation).toEqual(mockQuotation);
    expect(quotationsService.createFromAppointment).toHaveBeenCalledWith(
      'apt-1',
      mockAppointment
    );
    expect(appointmentsService.linkQuotation).toHaveBeenCalledWith('apt-1', 'quo-1');
    expect(result.current.error).toBeNull();
  });

  it('creates quotation with custom data', async () => {
    vi.mocked(quotationsService.createFromAppointment).mockResolvedValue(mockQuotation as any);
    vi.mocked(appointmentsService.linkQuotation).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    await act(async () => {
      await result.current.createQuotation(mockAppointment, {
        validUntilDays: 60,
        discount: 500,
      });
    });

    expect(quotationsService.createFromAppointment).toHaveBeenCalled();
  });

  it('handles creation error gracefully', async () => {
    vi.mocked(quotationsService.createFromAppointment).mockRejectedValue(
      new Error('Failed to create')
    );

    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    let quotation: any = null;

    await act(async () => {
      quotation = await result.current.createQuotation(mockAppointment);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(quotation).toBeNull();
    expect(result.current.error).toBe('Failed to create');
  });

  it('handles linkQuotation error gracefully', async () => {
    vi.mocked(quotationsService.createFromAppointment).mockResolvedValue(mockQuotation as any);
    vi.mocked(appointmentsService.linkQuotation).mockRejectedValue(
      new Error('Failed to link')
    );

    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    let quotation: any = null;

    await act(async () => {
      quotation = await result.current.createQuotation(mockAppointment);
    });

    // Should still return quotation even if linking fails
    expect(quotation).toEqual(mockQuotation);
  });

  it('sets loading state during creation', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(quotationsService.createFromAppointment).mockReturnValue(promise as any);

    const { result } = renderHook(() => useCreateQuotationFromAppointment());

    act(() => {
      result.current.createQuotation(mockAppointment);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    resolvePromise!(mockQuotation);
    vi.mocked(appointmentsService.linkQuotation).mockResolvedValue(undefined);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

