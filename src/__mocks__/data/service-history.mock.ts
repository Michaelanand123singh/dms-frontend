/**
 * Mock data for Service History
 */

export interface ServiceHistoryItem {
  id: string;
  serviceDate: string;
  serviceType: string;
  engineerName: string;
  partsUsed: string[];
  laborCharges: string;
  partsCharges: string;
  totalAmount: string;
  invoiceNumber: string;
  jobCardId: string;
}

export const serviceHistoryData: Record<number, ServiceHistoryItem[]> = {
  1: [
    {
      id: "SH001",
      serviceDate: "2024-10-15",
      serviceType: "Full Service",
      engineerName: "Technician Raj",
      partsUsed: ["Engine Oil 5L", "Air Filter", "Spark Plugs"],
      laborCharges: "₹1500",
      partsCharges: "₹2500",
      totalAmount: "₹4000",
      invoiceNumber: "INV-2024-045",
      jobCardId: "JC001",
    },
    {
      id: "SH002",
      serviceDate: "2024-07-10",
      serviceType: "Maintenance",
      engineerName: "Technician Priya",
      partsUsed: ["Engine Oil 5L", "Coolant 5L"],
      laborCharges: "₹1000",
      partsCharges: "₹1500",
      totalAmount: "₹2500",
      invoiceNumber: "INV-2024-032",
      jobCardId: "JC002",
    },
    {
      id: "SH003",
      serviceDate: "2024-04-05",
      serviceType: "Repair",
      engineerName: "Technician Raj",
      partsUsed: ["Brake Pads", "Brake Fluid"],
      laborCharges: "₹2000",
      partsCharges: "₹3000",
      totalAmount: "₹5000",
      invoiceNumber: "INV-2024-018",
      jobCardId: "JC003",
    },
  ],
  2: [
    {
      id: "SH004",
      serviceDate: "2024-09-20",
      serviceType: "Full Service",
      engineerName: "Technician Amit",
      partsUsed: ["Engine Oil 5L", "Air Filter"],
      laborCharges: "₹1200",
      partsCharges: "₹1800",
      totalAmount: "₹3000",
      invoiceNumber: "INV-2024-038",
      jobCardId: "JC004",
    },
  ],
  3: [
    {
      id: "SH005",
      serviceDate: "2024-11-05",
      serviceType: "Maintenance",
      engineerName: "Technician Vikram",
      partsUsed: ["Engine Oil 5L", "Coolant 5L", "Air Filter"],
      laborCharges: "₹1500",
      partsCharges: "₹2000",
      totalAmount: "₹3500",
      invoiceNumber: "INV-2024-050",
      jobCardId: "JC005",
    },
  ],
};

