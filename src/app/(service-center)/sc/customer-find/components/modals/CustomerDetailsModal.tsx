/**
 * Customer Details Modal Component
 */

import { User, Phone, Mail, MapPin, Calendar, Building2, Car, AlertTriangle, PlusCircle, FileText } from "lucide-react";
import { Modal } from "../../../components/shared/FormElements";
import { InfoCard, CustomerInfoCard } from "../../../components/shared/InfoComponents";
import { Button } from "../../../components/shared/Button";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import { formatVehicleString } from "../../../components/shared/vehicle-utils";
import { getMockServiceHistory } from "@/__mocks__/data/customer-service-history.mock";

export interface CustomerDetailsModalProps {
  isOpen: boolean;
  customer: CustomerWithVehicles | null;
  onClose: () => void;
  onAddVehicle: () => void;
  onViewComplaints: () => void;
  onViewVehicleDetails: (vehicle: Vehicle) => void;
  onScheduleAppointment: (vehicle: Vehicle) => void;
  enrichServiceHistoryWithFeedbackRatings: (
    serviceHistory: any[],
    vehicle: Vehicle,
    customer: CustomerWithVehicles | null
  ) => any[];
  setServiceHistory: (history: any[]) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  initializeAppointmentForm: (customer: CustomerWithVehicles, vehicle?: Vehicle | null) => void;
  setShowVehicleDetails: (show: boolean) => void;
  setShowScheduleAppointment: (show: boolean) => void;
}

export function CustomerDetailsModal({
  isOpen,
  customer,
  onClose,
  onAddVehicle,
  onViewComplaints,
  onViewVehicleDetails,
  onScheduleAppointment,
  enrichServiceHistoryWithFeedbackRatings,
  setServiceHistory,
  setSelectedVehicle,
  initializeAppointmentForm,
  setShowVehicleDetails,
  setShowScheduleAppointment,
}: CustomerDetailsModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <Modal
      title="Customer Details"
      subtitle={`${customer.name} - ${customer.customerNumber}`}
      onClose={onClose}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-3.5 rounded-xl shadow-sm">
                <User className="text-indigo-600" size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                <p className="text-sm text-gray-600 font-medium mt-0.5">Customer #{customer.customerNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onViewComplaints} variant="warning" icon={AlertTriangle}>
                Complaints
              </Button>
              <Button onClick={onAddVehicle} icon={PlusCircle}>
                Add Vehicle
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <InfoCard icon={Phone} label="Phone" value={customer.phone} />
            {customer.whatsappNumber && <InfoCard icon={Phone} label="WhatsApp" value={customer.whatsappNumber} />}
            {customer.alternateMobile && (
              <InfoCard icon={Phone} label="Alternate Mobile" value={customer.alternateMobile} />
            )}
            {customer.email && <InfoCard icon={Mail} label="Email" value={customer.email} />}
            {customer.customerType && (
              <InfoCard icon={User} label="Customer Type" value={customer.customerType} />
            )}
            {(customer.address || customer.cityState || customer.pincode) && (
              <InfoCard
                icon={MapPin}
                label="Full Address"
                value={
                  <div className="space-y-1 text-left">
                    {customer.address && (
                      <span className="block text-gray-900 font-medium">{customer.address}</span>
                    )}
                    {customer.cityState && <span className="block text-gray-700 text-sm">{customer.cityState}</span>}
                    {customer.pincode && (
                      <span className="block text-gray-600 text-sm">Pincode: {customer.pincode}</span>
                    )}
                  </div>
                }
              />
            )}
            <InfoCard
              icon={Calendar}
              label="Member Since"
              value={new Date(customer.createdAt).toLocaleDateString()}
            />
            {customer.lastServiceCenterName && (
              <InfoCard icon={Building2} label="Last Service Center" value={customer.lastServiceCenterName} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{customer.totalVehicles || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Total Vehicles</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{customer.totalSpent || "₹0"}</p>
              <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            </div>
            {customer.lastServiceDate && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-bold text-purple-600">
                  {new Date(customer.lastServiceDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Last Service</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicles List */}
        {customer.vehicles && customer.vehicles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Car className="text-indigo-600" size={20} />
              Linked Vehicles ({customer.vehicles.length})
            </h3>
            <div className="space-y-3">
              {customer.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-lg p-4 hover:shadow-sm transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {vehicle.vehicleMake} {vehicle.vehicleModel} ({vehicle.vehicleYear})
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.currentStatus === "Active Job Card"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {vehicle.currentStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Registration</p>
                          <p className="font-medium text-gray-800">{vehicle.registration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">VIN</p>
                          <p className="font-medium text-gray-800 font-mono text-xs">{vehicle.vin}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Color</p>
                          <p className="font-medium text-gray-800">{vehicle.vehicleColor}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Services</p>
                          <p className="font-medium text-gray-800">
                            {vehicle.totalServices} ({vehicle.totalSpent})
                          </p>
                        </div>
                        {vehicle.lastServiceCenterName && (
                          <div className="sm:col-span-4">
                            <p className="text-gray-500 flex items-center gap-1">
                              <Building2 size={14} />
                              Last Service Center
                            </p>
                            <p className="font-medium text-gray-800">{vehicle.lastServiceCenterName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowVehicleDetails(true);
                          // Only show service history if vehicle has services (totalServices > 0)
                          if (vehicle.totalServices > 0 && vehicle.lastServiceDate) {
                            const baseHistory = getMockServiceHistory(vehicle.id);
                            const enrichedHistory = enrichServiceHistoryWithFeedbackRatings(
                              baseHistory,
                              vehicle,
                              customer
                            );
                            setServiceHistory(enrichedHistory);
                          } else {
                            setServiceHistory([]);
                          }
                          onViewVehicleDetails(vehicle);
                        }}
                        size="sm"
                        icon={FileText}
                        className="px-4 py-2"
                      >
                        View Details
                      </Button>

                      {/* Allow scheduling only when vehicle is not already under active service */}
                      {vehicle.currentStatus !== "Active Job Card" ? (
                        <Button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowVehicleDetails(false);
                            setShowScheduleAppointment(true);
                            initializeAppointmentForm(customer, vehicle);
                            onScheduleAppointment(vehicle);
                          }}
                          variant="success"
                          size="sm"
                          icon={Calendar}
                          className="px-4 py-2"
                        >
                          Schedule Appointment
                        </Button>
                      ) : (
                        <span className="text-xs text-orange-600 font-medium self-center">
                          Appointment blocked: vehicle already in active service
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!customer.vehicles || customer.vehicles.length === 0) && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <Car className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Vehicles Linked</h3>
            <p className="text-gray-600 mb-4">This customer doesn&apos;t have any vehicles linked yet.</p>
            <Button onClick={onAddVehicle} icon={PlusCircle} className="mx-auto">
              Add First Vehicle
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

