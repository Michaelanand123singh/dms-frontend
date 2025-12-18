/**
 * Invoice Generation Utilities
 * Functions for invoice number generation, GST calculations, and data population
 */

import type { ServiceCenterInvoice, EnhancedServiceCenterInvoiceItem } from "@/shared/types/invoice.types";
import type { JobCard } from "@/shared/types/job-card.types";

/**
 * Service Center interface for invoice generation
 */
export interface ServiceCenter {
  id: string;
  code?: string;
  name: string;
  address?: string;
  city?: string;
  state: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  phone?: string;
  email?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
}

/**
 * Generate invoice number in format: INV-{SC_CODE}-{YYYY}-{XXXX}
 * @param serviceCenterCode - Service center code (e.g., "SC001")
 * @param year - Year (e.g., 2025)
 * @param existingInvoices - Array of existing invoices to determine next sequence
 * @returns Invoice number string
 */
export function generateInvoiceNumber(
  serviceCenterCode: string,
  year: number,
  existingInvoices: ServiceCenterInvoice[] = []
): string {
  // Filter invoices for this service center and year
  const prefix = `INV-${serviceCenterCode}-${year}-`;
  const matchingInvoices = existingInvoices.filter(
    (inv) => inv.invoiceNumber?.startsWith(prefix)
  );

  // Find the highest sequence number
  let maxSequence = 0;
  matchingInvoices.forEach((inv) => {
    if (inv.invoiceNumber) {
      const sequenceStr = inv.invoiceNumber.split("-").pop();
      if (sequenceStr) {
        const sequence = parseInt(sequenceStr, 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    }
  });

  // Generate next sequence number
  const nextSequence = maxSequence + 1;
  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

/**
 * Calculate GST amounts based on place of supply
 * @param taxableAmount - Amount before tax
 * @param gstRate - GST rate as percentage (e.g., 18 for 18%)
 * @param placeOfSupply - State where supply is made
 * @param serviceCenterState - State where service center is located
 * @returns Object with CGST, SGST, and IGST amounts
 */
export function calculateGST(
  taxableAmount: number,
  gstRate: number,
  placeOfSupply: string,
  serviceCenterState: string
): { cgst: number; sgst: number; igst: number } {
  const taxAmount = (taxableAmount * gstRate) / 100;

  // If same state: CGST + SGST (each half of total tax)
  // If different state: IGST (full tax amount)
  if (placeOfSupply.toLowerCase().trim() === serviceCenterState.toLowerCase().trim()) {
    // Same state - CGST and SGST
    return {
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      igst: 0,
    };
  } else {
    // Different state - IGST
    return {
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
    };
  }
}

/**
 * Convert number to words (Indian numbering system)
 * @param amount - Numeric amount
 * @returns Amount in words (e.g., "Five Thousand Rupees Only")
 */
export function convertNumberToWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const scales = ["", "Thousand", "Lakh", "Crore"];

  function convertHundreds(num: number): string {
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      result += ones[num] + " ";
    }
    return result.trim();
  }

  if (amount === 0) return "Zero Rupees Only";

  // Handle paise (decimal part)
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = "";

  // Convert rupees
  if (rupees > 0) {
    let num = rupees;
    let scaleIndex = 0;
    const parts: string[] = [];

    while (num > 0) {
      const remainder = num % 1000;
      if (remainder > 0) {
        const part = convertHundreds(remainder);
        if (scaleIndex > 0 && part) {
          parts.unshift(part + " " + scales[scaleIndex]);
        } else if (part) {
          parts.unshift(part);
        }
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    result = parts.join(" ") + " Rupees";
  } else {
    result = "Zero Rupees";
  }

  // Add paise if present
  if (paise > 0) {
    const paiseWords = convertHundreds(paise);
    result += " and " + paiseWords + " Paise";
  }

  return result + " Only";
}

/**
 * Populate invoice from job card data
 * @param jobCard - Job card data
 * @param serviceCenter - Service center information
 * @returns Partial invoice data ready for completion
 */
export function populateInvoiceFromJobCard(
  jobCard: JobCard,
  serviceCenter: ServiceCenter
): Partial<ServiceCenterInvoice> {
  const part1 = jobCard.part1;
  const part2 = jobCard.part2 || [];

  // Extract customer details from part1
  const customerDetails = part1
    ? {
        name: part1.fullName || jobCard.customerName,
        address: part1.customerAddress || "",
        phone: part1.mobilePrimary || "",
        state: "", // Will need to extract from address or customer data
      }
    : {
        name: jobCard.customerName,
        address: "",
        phone: "",
        state: "",
      };

  // Extract items from part2
  const enhancedItems: EnhancedServiceCenterInvoiceItem[] = part2.map((item, index) => {
    const taxableAmount = item.amount || 0;
    const gstRate = 18; // Default GST rate, can be made configurable
    const placeOfSupply = customerDetails.state || serviceCenter.state;
    const gst = calculateGST(taxableAmount, gstRate, placeOfSupply, serviceCenter.state);

    return {
      name: item.partName || item.partWarrantyTag || `Item ${index + 1}`,
      hsnSacCode: item.partCode || "",
      unitPrice: item.amount || 0,
      quantity: item.qty || 1,
      taxableAmount: taxableAmount,
      gstRate: gstRate,
      cgstAmount: gst.cgst,
      sgstAmount: gst.sgst,
      igstAmount: gst.igst,
      totalAmount: taxableAmount + gst.cgst + gst.sgst + gst.igst,
    };
  });

  // Calculate totals
  const subtotal = enhancedItems.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalCgst = enhancedItems.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = enhancedItems.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIgst = enhancedItems.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = subtotal + totalTax;

  return {
    jobCardId: jobCard.id,
    customerId: jobCard.customerId,
    vehicleId: jobCard.vehicleId,
    customerName: customerDetails.name,
    vehicle: jobCard.vehicle || `${jobCard.vehicleMake || ""} ${jobCard.vehicleModel || ""} (${jobCard.registration || ""})`.trim(),
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    amount: `₹${grandTotal.toLocaleString("en-IN")}`,
    paidAmount: "₹0",
    balance: `₹${grandTotal.toLocaleString("en-IN")}`,
    status: "Unpaid",
    serviceCenterId: serviceCenter.id,
    serviceCenterName: serviceCenter.name,
    serviceCenterDetails: {
      name: serviceCenter.name,
      address: serviceCenter.address || "",
      city: serviceCenter.city,
      state: serviceCenter.state,
      pincode: serviceCenter.pincode,
      gstNumber: serviceCenter.gstNumber || "",
      panNumber: serviceCenter.panNumber || "",
      phone: serviceCenter.phone,
      email: serviceCenter.email,
    },
    customerDetails: {
      name: customerDetails.name,
      address: customerDetails.address,
      phone: customerDetails.phone,
      state: customerDetails.state,
    },
    placeOfSupply: customerDetails.state || serviceCenter.state,
    subtotal: subtotal,
    totalTaxableAmount: subtotal,
    totalCgst: totalCgst,
    totalSgst: totalSgst,
    totalIgst: totalIgst,
    totalTax: totalTax,
    grandTotal: grandTotal,
    amountInWords: convertNumberToWords(grandTotal),
    enhancedItems: enhancedItems,
    // Legacy items for backward compatibility
    items: enhancedItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: `₹${item.totalAmount.toLocaleString("en-IN")}`,
    })),
  };
}

/**
 * Validate invoice data
 * @param invoice - Partial invoice data to validate
 * @returns Validation result with errors if any
 */
export function validateInvoiceData(
  invoice: Partial<ServiceCenterInvoice>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!invoice.customerName) {
    errors.push("Customer name is required");
  }

  if (!invoice.vehicle) {
    errors.push("Vehicle information is required");
  }

  if (!invoice.date) {
    errors.push("Invoice date is required");
  }

  if (!invoice.dueDate) {
    errors.push("Due date is required");
  }

  if (invoice.enhancedItems && invoice.enhancedItems.length === 0) {
    errors.push("At least one invoice item is required");
  }

  if (invoice.items && invoice.items.length === 0) {
    errors.push("At least one invoice item is required");
  }

  if (!invoice.serviceCenterDetails) {
    errors.push("Service center details are required");
  } else {
    if (!invoice.serviceCenterDetails.gstNumber) {
      errors.push("Service center GST number is required");
    }
    if (!invoice.serviceCenterDetails.panNumber) {
      errors.push("Service center PAN number is required");
    }
  }

  if (invoice.grandTotal !== undefined && invoice.grandTotal < 0) {
    errors.push("Grand total cannot be negative");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}



