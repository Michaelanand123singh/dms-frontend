/**
 * Vehicle Details Modal Component
 */

import { Car, Calendar, History, Wrench, Building2, FileText, Edit2, X as XIcon } from "lucide-react";
import { Modal } from "../../../components/shared/FormElements";
import { Button } from "../../../components/shared/Button";
import type { Vehicle, CustomerWithVehicles, ServiceHistoryItem } from "@/shared/types";

export interface VehicleDetailsModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  customer: CustomerWithVehicles | null;
  serviceHistory: ServiceHistoryItem[];
  editingFeedbackRating: number | string | null;
  onClose: () => void;
  onScheduleAppointment: () => void;
  onUpdateFeedbackRating: (service: ServiceHistoryItem, rating: number) => void;
  onSetEditingFeedbackRating: (id: number | string | null) => void;
  onOpenInvoice: (service: ServiceHistoryItem) => void;
}

export function VehicleDetailsModal({
  isOpen,
  vehicle,
  customer,
  serviceHistory,
  editingFeedbackRating,
  onClose,
  onScheduleAppointment,
  onUpdateFeedbackRating,
  onSetEditingFeedbackRating,
  onOpenInvoice,
}: VehicleDetailsModalProps) {
  if (!isOpen || !vehicle || !customer) return null;

  return (
    <Modal
      title="Vehicle Details"
      subtitle={`${vehicle.vehicleMake} ${vehicle.vehicleModel} (${vehicle.vehicleYear})`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Vehicle Information */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-indigo-600 font-medium">Vehicle Brand</p>
              <p className="text-gray-800 font-semibold">{vehicle.vehicleMake}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">Vehicle Model</p>
              <p className="text-gray-800 font-semibold">{vehicle.vehicleModel}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">Manufacturing Year</p>
              <p className="text-gray-800 font-semibold">{vehicle.vehicleYear}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">Registration Number</p>
              <p className="text-gray-800 font-semibold">{vehicle.registration}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">VIN / Chassis Number</p>
              <p className="text-gray-800 font-semibold font-mono text-xs">{vehicle.vin}</p>
            </div>
            {vehicle.vehicleColor && (
              <div>
                <p className="text-indigo-600 font-medium">Vehicle Color</p>
                <p className="text-gray-800 font-semibold">{vehicle.vehicleColor}</p>
              </div>
            )}
            {vehicle.variant && (
              <div>
                <p className="text-indigo-600 font-medium">Variant / Battery Capacity</p>
                <p className="text-gray-800 font-semibold">{vehicle.variant}</p>
              </div>
            )}
            {vehicle.motorNumber && (
              <div>
                <p className="text-indigo-600 font-medium">Motor Number</p>
                <p className="text-gray-800 font-semibold">{vehicle.motorNumber}</p>
              </div>
            )}
            {vehicle.chargerSerialNumber && (
              <div>
                <p className="text-indigo-600 font-medium">Charger Serial Number</p>
                <p className="text-gray-800 font-semibold">{vehicle.chargerSerialNumber}</p>
              </div>
            )}
            {vehicle.purchaseDate && (
              <div>
                <p className="text-indigo-600 font-medium">Purchase Date</p>
                <p className="text-gray-800 font-semibold">
                  {new Date(vehicle.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {vehicle.warrantyStatus && (
              <div>
                <p className="text-indigo-600 font-medium">Warranty Status</p>
                <p className="text-gray-800 font-semibold">{vehicle.warrantyStatus}</p>
              </div>
            )}
            <div>
              <p className="text-indigo-600 font-medium">Total Services</p>
              <p className="text-gray-800 font-semibold">{vehicle.totalServices}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">Total Spent</p>
              <p className="text-gray-800 font-semibold">{vehicle.totalSpent}</p>
            </div>
            <div>
              <p className="text-indigo-600 font-medium">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${vehicle.currentStatus === "Active Job Card"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700"
                  }`}
              >
                {vehicle.currentStatus}
              </span>
            </div>
            {vehicle.lastServiceCenterName && (
              <div className="sm:col-span-3">
                <p className="text-indigo-600 font-medium flex items-center gap-1">
                  <Building2 size={14} />
                  Last Service Center
                </p>
                <p className="text-gray-800 font-semibold">{vehicle.lastServiceCenterName}</p>
              </div>
            )}
          </div>

          {/* Insurance Information Section */}
          {(vehicle.insuranceStartDate || vehicle.insuranceEndDate || vehicle.insuranceCompanyName) && (
            <div className="mt-6 pt-6 border-t border-indigo-200">
              <h4 className="text-md font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                Insurance Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {vehicle.insuranceStartDate && (
                  <div>
                    <p className="text-indigo-600 font-medium">Insurance Start Date</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(vehicle.insuranceStartDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {vehicle.insuranceEndDate && (
                  <div>
                    <p className="text-indigo-600 font-medium">Insurance End Date</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(vehicle.insuranceEndDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {vehicle.insuranceCompanyName && (
                  <div>
                    <p className="text-indigo-600 font-medium">Insurance Company</p>
                    <p className="text-gray-800 font-semibold">{vehicle.insuranceCompanyName}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Service History */}
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <History className="text-purple-600" size={20} />
              Service History
            </h3>
            <Button onClick={onScheduleAppointment} variant="success" icon={Calendar}>
              Schedule Appointment
            </Button>
          </div>

          {serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {serviceHistory.map((service) => (
                <div key={service.id} className="rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {service.type}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} />
                          {service.date}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Wrench size={14} />
                          {service.engineer}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Odometer: {service.odometer}</p>
                      {service.serviceCenterName && (
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <Building2 size={14} />
                          Service Center: <span className="font-medium">{service.serviceCenterName}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600 font-medium">Feedback Rating:</span>
                        {editingFeedbackRating === service.id ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const currentRating = service.feedbackRating || 0;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => onUpdateFeedbackRating(service, star)}
                                    className={`text-xl transition-all hover:scale-110 ${star <= currentRating ? "text-yellow-400" : "text-gray-300"
                                      }`}
                                    title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                  >
                                    ★
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-sm text-gray-600">({service.feedbackRating || 0}/5)</span>
                            <button
                              type="button"
                              onClick={() => onSetEditingFeedbackRating(null)}
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Cancel editing"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-lg ${star <= (service.feedbackRating || 0) ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">({service.feedbackRating || 0}/5)</span>
                            <button
                              type="button"
                              onClick={() => onSetEditingFeedbackRating(service.id)}
                              className="ml-2 text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 text-xs"
                              title="Edit feedback rating"
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.parts.map((part, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 text-right">
                      <p className="text-sm text-gray-600">Labor: {service.labor}</p>
                      <p className="text-sm text-gray-600">Parts: {service.partsCost}</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">Total: {service.total}</p>
                      <div className="mt-3 md:mt-0 text-right flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={FileText}
                          onClick={() => onOpenInvoice(service)}
                          title={`Open invoice ${service.invoice}`}
                          className="whitespace-nowrap"
                        >
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No service history found</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

