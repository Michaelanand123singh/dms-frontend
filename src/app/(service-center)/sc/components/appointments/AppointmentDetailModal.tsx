"use client";
import { Calendar, Clock, User, Car, Phone, CheckCircle, AlertCircle, MapPin, Building2, FileText, UserCheck } from "lucide-react";
import { Modal, CustomerInfoCard } from "../shared";
import { StatusBadge } from "./StatusBadge";
import type { AppointmentRecord } from "../../appointments/types";
import type { CustomerWithVehicles } from "@/shared/types";
import type { JobCard } from "@/shared/types/job-card.types";
import type { CustomerArrivalStatus, ServiceIntakeForm } from "../../appointments/types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { defaultServiceCenters } from "@/__mocks__/data/service-centers.mock";
import { INITIAL_SERVICE_INTAKE_FORM } from "../../appointments/constants";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRecord | null;
  detailCustomer: CustomerWithVehicles | null;
  isCallCenter: boolean;
  isServiceAdvisor: boolean;
  customerArrivalStatus: CustomerArrivalStatus;
  currentJobCard: JobCard | null;
  availableServiceCenters: typeof defaultServiceCenters;
  onCustomerArrived: () => void;
  onCustomerNotArrived: () => void;
  setCurrentJobCard: (card: JobCard | null) => void;
  setCheckInSlipData: (data: any) => void;
  setShowCheckInSlipModal: (show: boolean) => void;
  setAppointments: (appointments: AppointmentRecord[]) => void;
  setSelectedAppointment: (appointment: AppointmentRecord | null) => void;
  showToast: (message: string, type: "success" | "error") => void;
  appointments: AppointmentRecord[];
  onConvertToQuotation?: () => void;
  onGenerateCheckInSlip?: () => void;
  currentJobCardId?: string | null;
}

export function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  detailCustomer,
  isCallCenter,
  isServiceAdvisor,
  customerArrivalStatus,
  currentJobCard,
  availableServiceCenters,
  onCustomerArrived,
  onCustomerNotArrived,
  setCurrentJobCard,
  setCheckInSlipData,
  setShowCheckInSlipModal,
  setAppointments,
  setSelectedAppointment,
  showToast,
  appointments,
  onConvertToQuotation,
  onGenerateCheckInSlip,
  currentJobCardId,
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const handleCustomerArrived = () => {
    try {
      // Check if pickup/drop service was selected
      const hasPickupDropService = appointment.pickupDropRequired &&
        (appointment.pickupAddress || appointment.dropAddress);

      if (hasPickupDropService) {
        // Create pickup/drop charges and send to customer
        const pickupDropCharges = {
          id: `PDC-${Date.now()}`,
          appointmentId: appointment.id,
          customerName: appointment.customerName,
          phone: appointment.phone,
          pickupAddress: appointment.pickupAddress,
          dropAddress: appointment.dropAddress,
          amount: 500, // Default pickup/drop charge (can be configurable)
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // Store pickup/drop charges
        const existingCharges = safeStorage.getItem<any[]>("pickupDropCharges", []);
        safeStorage.setItem("pickupDropCharges", [...existingCharges, pickupDropCharges]);

        // Send charges to customer via WhatsApp
        const message = `Hello ${appointment.customerName}, your pickup/drop service charges are ₹${pickupDropCharges.amount}.\n\nPickup Address: ${appointment.pickupAddress || "N/A"}\nDrop Address: ${appointment.dropAddress || "N/A"}\n\nPlease confirm to proceed.`;
        const whatsappUrl = `https://wa.me/${appointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

        showToast("Pickup/drop charges created and sent to customer via WhatsApp.", "success");
      }

      // Update appointment status to "In Progress"
      const updatedAppointments = appointments.map((apt) =>
        apt.id === appointment.id
          ? { ...apt, status: "In Progress" }
          : apt
      );
      setAppointments(updatedAppointments);
      safeStorage.setItem("appointments", updatedAppointments);

      // Update selectedAppointment state
      setSelectedAppointment({ ...appointment, status: "In Progress" });

      // Create job card automatically when customer arrives
      // The job card will be created in the parent component via convertAppointmentToJobCard
      onCustomerArrived();
      showToast("Customer arrival recorded. Job card will be created automatically. You can now create a quotation or generate a check-in slip.", "success");
    } catch (error) {
      console.error("Error recording customer arrival:", error);
      showToast("Failed to record customer arrival. Please try again.", "error");
    }
  };

  const handleCustomerNotArrived = () => {
    setCurrentJobCard(null);
    setCheckInSlipData(null);
    setShowCheckInSlipModal(false);
    onCustomerNotArrived();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      size={isServiceAdvisor && customerArrivalStatus === "arrived" ? "xl" : "lg"}
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            Customer Information
          </h3>
          <div className="space-y-5">
            {detailCustomer ? (
              <CustomerInfoCard customer={detailCustomer} title="Customer Details" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                  <p className="font-medium text-gray-800">{appointment.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Phone size={14} />
                    {appointment.phone}
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Car size={14} />
                  {appointment.vehicle}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Type</p>
                <p className="font-medium text-gray-800">
                  {appointment.customerType ?? "Not captured"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Preferred Communication</p>
                <p className="font-medium text-gray-800">
                  {appointment.preferredCommunicationMode ?? "Not captured"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup / Drop Required</p>
                <p className="font-medium text-gray-800">
                  {appointment.pickupDropRequired ? "Yes" : "No"}
                </p>
              </div>
              {appointment.pickupAddress && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                  <p className="font-medium text-gray-800">{appointment.pickupAddress}</p>
                </div>
              )}
              {appointment.dropAddress && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Drop Address</p>
                  <p className="font-medium text-gray-800">{appointment.dropAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Center Assignment (for Call Center) */}
        {isCallCenter && appointment.serviceCenterName && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="text-indigo-600" size={20} />
              Assigned Service Center
            </h3>
            <div className="flex items-center gap-3">
              <MapPin className="text-indigo-600" size={18} strokeWidth={2} />
              <div>
                <p className="font-semibold text-gray-900">{appointment.serviceCenterName}</p>
                {(() => {
                  const center = availableServiceCenters.find(
                    (sc) => sc.name === appointment.serviceCenterName
                  );
                  return center && <p className="text-sm text-gray-600">{center.location}</p>;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Service Details */}
        {(appointment.customerComplaintIssue || 
          appointment.previousServiceHistory || 
          appointment.estimatedServiceTime || 
          appointment.estimatedCost || 
          appointment.odometerReading || 
          appointment.estimatedDeliveryDate) && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointment.customerComplaintIssue && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Customer Complaint / Issue</p>
                  <p className="font-medium text-gray-800 whitespace-pre-wrap">{appointment.customerComplaintIssue}</p>
                </div>
              )}
              {appointment.previousServiceHistory && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Previous Service History</p>
                  <p className="font-medium text-gray-800 whitespace-pre-wrap">{appointment.previousServiceHistory}</p>
                </div>
              )}
              {appointment.estimatedServiceTime && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Service Time</p>
                  <p className="font-medium text-gray-800">{appointment.estimatedServiceTime}</p>
                </div>
              )}
              {appointment.estimatedCost && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                  <p className="font-medium text-gray-800">{appointment.estimatedCost}</p>
                </div>
              )}
              {appointment.odometerReading && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Odometer Reading</p>
                  <p className="font-medium text-gray-800">{appointment.odometerReading}</p>
                </div>
              )}
              {appointment.estimatedDeliveryDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estimated Delivery Date</p>
                  <p className="font-medium text-gray-800">{appointment.estimatedDeliveryDate}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operational Details */}
        {(appointment.assignedServiceAdvisor || 
          appointment.assignedTechnician || 
          appointment.documentationFiles) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600" />
              Operational Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointment.assignedServiceAdvisor && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Service Advisor</p>
                  <p className="font-medium text-gray-800">{appointment.assignedServiceAdvisor}</p>
                </div>
              )}
              {appointment.assignedTechnician && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned Technician</p>
                  <p className="font-medium text-gray-800">{appointment.assignedTechnician}</p>
                </div>
              )}
              {appointment.documentationFiles && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Documentation Files</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {appointment.documentationFiles.customerIdProof !== undefined && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Customer ID Proof</p>
                        <p className="font-medium text-gray-800">{appointment.documentationFiles.customerIdProof} file(s)</p>
                      </div>
                    )}
                    {appointment.documentationFiles.vehicleRCCopy !== undefined && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Vehicle RC Copy</p>
                        <p className="font-medium text-gray-800">{appointment.documentationFiles.vehicleRCCopy} file(s)</p>
                      </div>
                    )}
                    {appointment.documentationFiles.warrantyCardServiceBook !== undefined && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Warranty Card</p>
                        <p className="font-medium text-gray-800">{appointment.documentationFiles.warrantyCardServiceBook} file(s)</p>
                      </div>
                    )}
                    {appointment.documentationFiles.photosVideos !== undefined && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">Photos/Videos</p>
                        <p className="font-medium text-gray-800">{appointment.documentationFiles.photosVideos} file(s)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pickup/Drop Details */}
        {appointment.pickupDropRequired && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Pickup / Drop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointment.pickupAddress && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Pickup Address</p>
                  <p className="font-medium text-gray-800">{appointment.pickupAddress}</p>
                  {((appointment as any).pickupState || (appointment as any).pickupCity || (appointment as any).pickupPincode) && (
                    <div className="mt-1 text-sm text-gray-600">
                      {[(appointment as any).pickupCity, (appointment as any).pickupState, (appointment as any).pickupPincode].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              )}
              {appointment.dropAddress && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Drop Address</p>
                  <p className="font-medium text-gray-800">{appointment.dropAddress}</p>
                  {((appointment as any).dropState || (appointment as any).dropCity || (appointment as any).dropPincode) && (
                    <div className="mt-1 text-sm text-gray-600">
                      {[(appointment as any).dropCity, (appointment as any).dropState, (appointment as any).dropPincode].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Appointment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Service Type</p>
              <p className="font-medium text-gray-800">{appointment.serviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-medium text-gray-800">{appointment.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Time</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Clock size={14} />
                {appointment.time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="font-medium text-gray-800">{appointment.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <StatusBadge status={appointment.status} size="md" />
            </div>
          </div>
        </div>

        {/* Customer Arrival Section (Service Advisor Only) - Only show if customer hasn't arrived yet */}
        {isServiceAdvisor &&
          customerArrivalStatus !== "arrived" &&
          appointment.status !== "In Progress" &&
          appointment.status !== "Sent to Manager" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-blue-600" />
                Customer Arrival Status
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCustomerArrived}
                  className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-white text-gray-700 border border-gray-300 hover:bg-green-50"
                >
                  <CheckCircle size={18} className="inline mr-2" />
                  Customer Arrived
                </button>
                <button
                  onClick={handleCustomerNotArrived}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${customerArrivalStatus === "not_arrived"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50"
                    }`}
                >
                  <AlertCircle size={18} className="inline mr-2" />
                  Customer Not Arrived
                </button>
              </div>
            </div>
          )}

        {/* Customer Arrival Confirmation (Service Advisor Only) - Show when customer has arrived */}
        {isServiceAdvisor &&
          appointment &&
          (customerArrivalStatus === "arrived" ||
            appointment.status === "In Progress" ||
            appointment.status === "Sent to Manager" ||
            appointment.status === "Quotation Created") && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Customer Arrived</h3>
                    <p className="text-sm text-green-700">
                      Appointment status: <span className="font-medium">{appointment.status}</span>
                      {currentJobCard && (
                        <span className="ml-2">• Job Card: <span className="font-medium">{currentJobCard.jobCardNumber}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(onConvertToQuotation || onGenerateCheckInSlip) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                  {(() => {
                    // Check if quotation already exists for this appointment
                    const existingQuotations = safeStorage.getItem<any[]>("quotations", []);
                    const hasExistingQuotation = existingQuotations.some(
                      (q) => q.appointmentId === appointment.id
                    );
                    
                    return (
                      <div className="flex gap-3">
                        {onConvertToQuotation && (
                          <button
                            onClick={onConvertToQuotation}
                            className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2"
                          >
                            <FileText size={18} />
                            {hasExistingQuotation ? "Create New Quotation" : "Create Quotation"}
                          </button>
                        )}
                    {onGenerateCheckInSlip && currentJobCardId && (
                      <button
                        onClick={onGenerateCheckInSlip}
                        className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FileText size={18} />
                        Generate Check-in Slip
                      </button>
                    )}
                  </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
      </div>
    </Modal>
  );
}

