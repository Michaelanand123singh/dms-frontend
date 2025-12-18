import { Quotation } from "@/shared/types/quotation.types";
import { getServiceCenterCode, normalizeServiceCenterId } from "./service-center.utils";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

/**
 * Generates a formatted quotation number based on service center, date, and sequence.
 * Format: QT-{SC_CODE}-{YYYY}{MM}-{SEQUENCE}
 * Example: QT-SC001-202312-0005
 * 
 * @param serviceCenterId - The ID of the service center
 * @param quotationDate - Date object or string (YYYY-MM-DD)
 * @param existingQuotations - Optional list of existing quotations. If not provided, will read from localStorage.
 * @returns Formatted quotation number
 */
export function generateQuotationNumber(
    serviceCenterId: string | number,
    quotationDate: Date | string = new Date(),
    existingQuotations?: Quotation[]
): string {
    const dateObj = typeof quotationDate === 'string' ? new Date(quotationDate) : quotationDate;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");

    const normalizedCenterId = normalizeServiceCenterId(serviceCenterId);
    const serviceCenterCode = getServiceCenterCode(normalizedCenterId);
    const monthKey = `${year}${month}`; // e.g. 202312

    // Get existing quotations if not provided
    const quotations = existingQuotations || safeStorage.getItem<Quotation[]>("quotations", []);

    // Filter for same service center and same month (YYYY-MM)
    // Note: quotationDate in Quotation type is usually YYYY-MM-DD string
    const existingForCenterMonth = quotations.filter((quotation) => {
        if (normalizeServiceCenterId(quotation.serviceCenterId) !== normalizedCenterId) return false;

        // Check if quotation date starts with YYYY-MM
        // Robust check handling Date objects or strings if type definition varies, 
        // but assuming standard string format YYYY-MM-DD based on codebase conventions
        const qDate = new Date(quotation.quotationDate);
        const qYear = qDate.getFullYear();
        const qMonth = String(qDate.getMonth() + 1).padStart(2, "0");

        return qYear === year && qMonth === month;
    });

    // Calculate next sequence (max existing sequence + 1, or length + 1 if strictly sequential)
    // To be safer against deletions, we should parse the sequence number from existing IDs if possible.
    // Using length + 1 is simple but can reuse IDs if last one was deleted. 
    // Codebase seems to use length + 1 in current implementation, but parsing max is better.

    const sequences = existingForCenterMonth.map(q => {
        // Format: QT-SC001-202312-0005
        const parts = q.quotationNumber.split('-');
        if (parts.length >= 4) {
            // Last part is sequence
            const seqStr = parts[parts.length - 1];
            return parseInt(seqStr, 10);
        }
        return 0;
    }).filter(n => !isNaN(n));

    const maxSeq = sequences.length > 0 ? Math.max(...sequences) : 0;
    const nextSequence = maxSeq + 1;

    return `QT-${serviceCenterCode}-${monthKey}-${String(nextSequence).padStart(4, "0")}`;
}
