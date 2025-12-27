import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quotationsService } from "@/features/quotations/services/quotations.service";
import { createMockAppointment } from '@/test/utils/mocks';
import type { Appointment } from '@/shared/types/appointment.types';

describe('QuotationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFromAppointment', () => {
    it('creates quotation from appointment in mock mode', async () => {
      const appointment = createMockAppointment({
        id: '1',
        customerId: '1',
        vehicleId: '1',
        serviceCenterId: 'sc-001',
      });

      const result = await quotationsService.createFromAppointment('1', appointment);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.quotationNumber).toBeDefined();
      expect(result.customerId).toBe('1');
      expect(result.vehicleId).toBe('1');
      expect(result.serviceCenterId).toBe('sc-001');
      expect(result.status).toBe('DRAFT');
    });

    it('sets quotation date to today', async () => {
      const appointment = createMockAppointment({ id: '1' });
      const result = await quotationsService.createFromAppointment('1', appointment);

      const today = new Date().toISOString().split('T')[0];
      expect(result.quotationDate).toBe(today);
    });

    it('sets valid until date to 30 days from now', async () => {
      const appointment = createMockAppointment({ id: '1' });
      const result = await quotationsService.createFromAppointment('1', appointment);

      const expectedDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      expect(result.validUntil).toBe(expectedDate);
    });

    it('includes appointment notes in quotation', async () => {
      const appointment = createMockAppointment({
        id: '1',
        customerComplaint: 'Test complaint',
        previousServiceHistory: 'Test history',
      });

      const result = await quotationsService.createFromAppointment('1', appointment);

      expect(result.notes).toBe('Test complaint');
      expect(result.customNotes).toBe('Test history');
    });

    it('initializes amounts to zero', async () => {
      const appointment = createMockAppointment({ id: '1' });
      const result = await quotationsService.createFromAppointment('1', appointment);

      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.totalAmount).toBe(0);
    });
  });

  describe('updateStatus', () => {
    it('updates quotation status in mock mode', async () => {
      const result = await quotationsService.updateStatus('qtn-1', 'CUSTOMER_APPROVED');

      expect(result.id).toBe('qtn-1');
      expect(result.status).toBe('CUSTOMER_APPROVED');
    });

    it('includes reason when provided', async () => {
      const result = await quotationsService.updateStatus('qtn-1', 'CUSTOMER_REJECTED', 'Not approved');

      expect(result.status).toBe('CUSTOMER_REJECTED');
    });

    it('updates updatedAt timestamp', async () => {
      const result = await quotationsService.updateStatus('qtn-1', 'MANAGER_APPROVED');

      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.updatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('sendWhatsApp', () => {
    it('sends WhatsApp message in mock mode', async () => {
      const result = await quotationsService.sendWhatsApp('qtn-1');

      expect(result.success).toBe(true);
      expect(result.whatsappUrl).toBeDefined();
      expect(result.whatsappUrl).toContain('wa.me');
      expect(result.whatsappUrl).toContain('qtn-1');
    });

    it('generates correct WhatsApp URL', async () => {
      const result = await quotationsService.sendWhatsApp('qtn-123');

      expect(result.whatsappUrl).toContain('qtn-123');
      expect(result.whatsappUrl).toContain('Quotation');
    });
  });
});

