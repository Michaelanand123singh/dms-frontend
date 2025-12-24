"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, Car, Phone, CheckCircle, AlertCircle, MapPin, Building2, FileText, UserCheck, Image as ImageIcon, Video, Download, Eye } from "lucide-react";
import { Modal, CustomerInfoCard } from "../shared";
import { StatusBadge } from "./StatusBadge";
import type { AppointmentRecord } from "../../appointments/types";
import type { CustomerWithVehicles } from "@/shared/types";
import type { JobCard } from "@/shared/types/job-card.types";
import type { CustomerArrivalStatus, ServiceIntakeForm } from "../../appointments/types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { INITIAL_SERVICE_INTAKE_FORM } from "../../appointments/constants";
import { getFilesForEntity } from "@/services/files/fileMetadata.service";
import { FileCategory, RelatedEntityType } from "@/services/files/types";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRecord | null;
  detailCustomer: CustomerWithVehicles | null;
  isCallCenter: boolean;
  isServiceAdvisor: boolean;
  customerArrivalStatus: CustomerArrivalStatus;
  currentJobCard: JobCard | null;
  availableServiceCenters: any[];
  onCustomerArrived: () => void;
  onCustomerNotArrived: () => void;
  setCurrentJobCard: (card: JobCard | null) => void;
  setCheckInSlipData: (data: any) => void;
  setShowCheckInSlipModal: (show: boolean) => void;
  setAppointments: (appointments: AppointmentRecord[]) => void;
  setSelectedAppointment: (appointment: AppointmentRecord | null) => void;
  showToast: (message: string, type: "success" | "error") => void;
  appointments: AppointmentRecord[];
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
  onGenerateCheckInSlip,
  currentJobCardId,
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  // State for fetched files
  const [appointmentFiles, setAppointmentFiles] = useState<{
    customerIdProof: any[];
    vehicleRCCopy: any[];
    warrantyCardServiceBook: any[];
    photosVideos: any[];
  }>({
    customerIdProof: [],
    vehicleRCCopy: [],
    warrantyCardServiceBook: [],
    photosVideos: [],
  });
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch files when appointment modal is opened
  useEffect(() => {
    if (isOpen && appointment?.id) {
      const fetchFiles = async () => {
        setLoadingFiles(true);
        try {
          const authToken = safeStorage.getItem<string | null>('authToken', null);
          const files = await getFilesForEntity(
            RelatedEntityType.APPOINTMENT,
            appointment.id.toString(),
            undefined,
            authToken || undefined
          );

          // Group files by category
          const groupedFiles = {
            customerIdProof: files.filter(f => f.category === FileCategory.CUSTOMER_ID_PROOF),
            vehicleRCCopy: files.filter(f => f.category === FileCategory.VEHICLE_RC),
            warrantyCardServiceBook: files.filter(f => f.category === FileCategory.WARRANTY_CARD),
            photosVideos: files.filter(f => f.category === FileCategory.PHOTOS_VIDEOS),
          };

          setAppointmentFiles(groupedFiles);
        } catch (error) {
          console.error('Failed to fetch appointment files:', error);
          // Don't show error to user - just log it
        } finally {
          setLoadingFiles(false);
        }
      };

      fetchFiles();
    } else {
      // Reset files when modal closes
      setAppointmentFiles({
        customerIdProof: [],
        vehicleRCCopy: [],
        warrantyCardServiceBook: [],
        photosVideos: [],
      });
    }
  }, [isOpen, appointment?.id]);

  // Helper function to render file preview
  const renderFilePreview = (file: any, index: number) => {
    const isImage = file.format && ['jpg', 'jpeg', 'png', 'webp'].includes(file.format.toLowerCase());
    const isVideo = file.format && ['mp4', 'mov', 'avi', 'webm'].includes(file.format.toLowerCase());
    const isPDF = file.format && file.format.toLowerCase() === 'pdf';

    return (
      <div key={file.id || index} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition">
        <div className="flex items-start gap-3">
          {isImage ? (
            <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={file.url}
                alt={file.filename}
                className="w-full h-full object-cover"
              />
            </div>
          ) : isVideo ? (
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Video className="text-gray-400" size={24} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              <FileText className="text-gray-400" size={24} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.filename}</p>
            <p className="text-xs text-gray-500">
              {file.bytes ? (file.bytes / 1024).toFixed(2) : '0.00'} KB
              {file.format && ` • ${file.format.toUpperCase()}`}
            </p>
            {detailCustomer && (
              <p className="text-xs text-gray-400 mt-1">
                Customer: {detailCustomer.name || appointment.customerName}
              </p>
            )}
            {appointment.vehicle && (
              <p className="text-xs text-gray-400">
                Vehicle: {appointment.vehicle}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
              title="View file"
            >
              <Eye size={16} />
            </a>
            <a
              href={file.url}
              download={file.filename}
              className="p-2 text-green-600 hover:bg-green-50 rounded transition"
              title="Download file"
            >
              <Download size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  };

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

      // Close the modal first
      onClose();

      showToast("Customer arrival recorded. Redirecting to job card...", "success");
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
                {/* Documentation Files Count (backward compatibility) */}
                {appointment.documentationFiles &&
                  !loadingFiles &&
                  appointmentFiles.customerIdProof.length === 0 &&
                  appointmentFiles.vehicleRCCopy.length === 0 &&
                  appointmentFiles.warrantyCardServiceBook.length === 0 &&
                  appointmentFiles.photosVideos.length === 0 && (
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

        {/* Uploaded Documentation Files Section */}
        {(appointmentFiles.customerIdProof.length > 0 ||
          appointmentFiles.vehicleRCCopy.length > 0 ||
          appointmentFiles.warrantyCardServiceBook.length > 0 ||
          appointmentFiles.photosVideos.length > 0 ||
          loadingFiles) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Uploaded Documentation Files
                {detailCustomer && (
                  <span className="text-sm font-normal text-gray-600">
                    • Customer: {detailCustomer.name || appointment.customerName}
                  </span>
                )}
                {appointment.vehicle && (
                  <span className="text-sm font-normal text-gray-600">
                    • Vehicle: {appointment.vehicle}
                  </span>
                )}
              </h3>

              {loadingFiles ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading files...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointmentFiles.customerIdProof.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Customer ID Proof ({appointmentFiles.customerIdProof.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {appointmentFiles.customerIdProof.map((file, index) => renderFilePreview(file, index))}
                      </div>
                    </div>
                  )}

                  {appointmentFiles.vehicleRCCopy.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Vehicle RC Copy ({appointmentFiles.vehicleRCCopy.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {appointmentFiles.vehicleRCCopy.map((file, index) => renderFilePreview(file, index))}
                      </div>
                    </div>
                  )}

                  {appointmentFiles.warrantyCardServiceBook.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Warranty Card / Service Book ({appointmentFiles.warrantyCardServiceBook.length})
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {appointmentFiles.warrantyCardServiceBook.map((file, index) => renderFilePreview(file, index))}
                      </div>
                    </div>
                  )}

                  {appointmentFiles.photosVideos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Photos & Videos ({appointmentFiles.photosVideos.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {appointmentFiles.photosVideos.map((file, index) => renderFilePreview(file, index))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              {onGenerateCheckInSlip && currentJobCardId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={onGenerateCheckInSlip}
                      className="flex-1 px-4 py-3 rounded-lg font-medium transition bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Generate Check-in Slip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </Modal>
  );
}

