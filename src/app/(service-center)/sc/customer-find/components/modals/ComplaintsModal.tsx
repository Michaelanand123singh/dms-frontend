/**
 * Complaints Modal Component
 */

import { AlertTriangle, CheckCircle } from "lucide-react";
import { Modal } from "../../../components/shared/FormElements";
import type { CustomerWithVehicles } from "@/shared/types";
import { getMockComplaints } from "@/__mocks__/data/complaints.mock";

export interface ComplaintsModalProps {
  isOpen: boolean;
  customer: CustomerWithVehicles | null;
  selectedVehicleName?: string;
  onClose: () => void;
}

export function ComplaintsModal({ isOpen, customer, selectedVehicleName, onClose }: ComplaintsModalProps) {
  if (!isOpen || !customer) return null;

  const vehicleName = selectedVehicleName || (customer.vehicles && customer.vehicles.length > 0
    ? `${customer.vehicles[0].vehicleMake} ${customer.vehicles[0].vehicleModel}`
    : "Vehicle");

  const mockComplaints = getMockComplaints(customer.name, customer.phone, vehicleName);

  return (
    <Modal title="Customer Complaints" subtitle={`Complaints for ${customer.name}`} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {(() => {
          if (mockComplaints.length > 0) {
            return (
              <div className="space-y-4">
                {mockComplaints.map((complaint, index) => (
                  <div
                    key={index}
                    className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="text-red-600" size={20} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{complaint.id}</h4>
                          <span className="text-xs text-gray-500">{complaint.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{complaint.complaint}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Vehicle: {complaint.vehicle}</span>
                          <span>Status: {complaint.status}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            complaint.severity === "High" || complaint.severity === "Critical"
                              ? "bg-red-50 text-red-700"
                              : complaint.severity === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {complaint.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          } else {
            return (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CheckCircle className="text-gray-400" size={32} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Complaints Found</h3>
                <p className="text-gray-600">This customer has no complaints registered.</p>
              </div>
            );
          }
        })()}
      </div>
    </Modal>
  );
}

