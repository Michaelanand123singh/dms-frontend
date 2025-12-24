"use client";
import { Suspense, useCallback } from "react";
import { Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { AppointmentGrid, Toast } from "../components/appointments";
import { useAppointmentLogic } from "./hooks/useAppointmentLogic";
import { canCreateAppointment } from "@/shared/constants/roles";
import type { JobCard } from "@/shared/types/job-card.types";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";
import { populateJobCardPart1, createEmptyJobCardPart1 } from "@/shared/utils/jobCardData.util";
import { generateJobCardNumber } from "@/shared/utils/job-card.utils";
import { jobCardService } from "@/features/job-cards/services/jobCard.service";
import { customerService } from "@/features/customers/services/customer.service";
import { SERVICE_CENTER_CODE_MAP } from "./constants";
import type { AppointmentRecord } from "./types";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import { formatVehicleString } from "./utils";
import { useRouter } from "next/navigation";
import {
  canEditCustomerInfo,
  canEditVehicleInfo,
} from "@/shared/constants/roles";
import { migrateAllJobCards } from "@/features/job-cards/utils/migrateJobCards.util";

// Lazy Loaded Components
const AppointmentDetailModal = dynamic(() => import("../components/appointments").then(mod => mod.AppointmentDetailModal), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white p-4 rounded shadow">Loading details...</div></div>
});
const CustomerSearchModal = dynamic(() => import("../components/appointments").then(mod => mod.CustomerSearchModal));
const CheckInSlip = dynamic(() => import("@/components/check-in-slip/CheckInSlip"), { ssr: false });
const AppointmentFormModal = dynamic(() => import("../components/appointment/AppointmentFormModal").then(mod => mod.AppointmentFormModal));

function AppointmentsContent() {
  const {
    appointments,
    visibleAppointments,
    selectedAppointment,
    setSelectedAppointment,
    showDetailModal,
    setShowDetailModal,
    showAppointmentFormModal,
    setShowAppointmentFormModal,
    showCheckInSlipModal,
    setShowCheckInSlipModal,
    appointmentFormData,
    setAppointmentFormData,
    selectedAppointmentCustomer,
    setSelectedAppointmentCustomer,
    selectedAppointmentVehicle,
    setSelectedAppointmentVehicle,
    customerSearchValue,
    setCustomerSearchValue,
    toast,
    showToast,
    handleAppointmentClick,
    handleDeleteAppointment,
    handleCloseAppointmentForm,
    handleCustomerSelectForAppointment,
    handleSubmitAppointmentForm,
    handleCustomerArrivedFromForm,
    handleOpenJobCard,
    handleGenerateCheckInSlip,
    availableServiceCenters,
    currentJobCard,
    setCurrentJobCard,
    currentJobCardId,
    setCurrentJobCardId,
    checkInSlipData,
    setShowVehicleDetails,
    customerArrivalStatus,
    setCustomerArrivalStatus,
    isCallCenter,
    isServiceAdvisor,
    userInfo,
    userRole,
    serviceCenterContext,
    appointmentCustomerSearchResults,
    appointmentCustomerSearchLoadingState,
    searchAppointmentCustomer,
    clearAppointmentCustomerSearch,
    detailCustomer,
    updateStoredJobCard,
    appointmentsState: { setAppointments },
    setCheckInSlipData,
  } = useAppointmentLogic();

  const router = useRouter();
  const canCreateNewAppointment = canCreateAppointment(userRole);

  // Role permissions
  const canEditCustomerInformation = canEditCustomerInfo(userRole);
  const canEditVehicleInformation = canEditVehicleInfo(userRole);

  const getJobCardId = useCallback((appointmentId: number | string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const jobCards = migrateAllJobCards();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobCard = jobCards.find((card: any) => card.sourceAppointmentId === appointmentId);
      return jobCard?.id || null;
    } catch (error) {
      console.error("Error finding job card:", error);
      return null;
    }
  }, []);

  const handleOpenNewAppointment = useCallback(() => {
    if (!canCreateNewAppointment) {
      showToast("You do not have permission to create new appointments.", "error");
      return;
    }
    setSelectedAppointmentCustomer(null);
    setSelectedAppointmentVehicle(null);
    // getInitialAppointmentForm is imported in hook, but we need reset logic here or use exposed setter with default?
    // In logic hook, handleClose resets it. Here we want to open fresh.
    // We can rely on handleClose having reset it, or reset it now.
    // Ideally use a reset action.
    // For now:
    setShowAppointmentFormModal(true);
  }, [canCreateNewAppointment, showToast, setSelectedAppointmentCustomer, setSelectedAppointmentVehicle, setShowAppointmentFormModal]);

  // Temporary local helper until moved to hook fully
  const convertAppointmentToJobCard = useCallback(async (appointment: AppointmentRecord): Promise<JobCard> => {
    const serviceCenterId = serviceCenterContext.serviceCenterId?.toString() || appointment.serviceCenterId?.toString() || "sc-001";
    const serviceCenterCode = SERVICE_CENTER_CODE_MAP[serviceCenterId] || "SC001";

    const existingJobCards = safeStorage.getItem<JobCard[]>("jobCards", []);
    const jobCardNumber = generateJobCardNumber(serviceCenterId, existingJobCards);

    const vehicleParts = appointment.vehicle.match(/^(.+?)\s+(.+?)\s+\((\d+)\)$/);
    const vehicleMake = vehicleParts ? vehicleParts[1] : appointment.vehicle.split(" ")[0] || "";
    const vehicleModel = vehicleParts ? vehicleParts[2] : appointment.vehicle.split(" ").slice(1, -1).join(" ") || "";

    let customerData: CustomerWithVehicles | null = null;
    let vehicleData: Vehicle | null = null;

    if (appointment.customerExternalId) {
      try {
        customerData = await customerService.getById(appointment.customerExternalId);
        if (customerData.vehicles) {
          vehicleData = customerData.vehicles.find((v) => {
            const vehicleString = formatVehicleString(v);
            return vehicleString === appointment.vehicle ||
              v.vehicleMake === vehicleMake ||
              v.registration === appointment.vehicle;
          }) || customerData.vehicles[0] || null;
        }
      } catch (err) {
        console.warn("Could not fetch customer data for job card:", err);
      }
    }

    const part1 = customerData && vehicleData
      ? populateJobCardPart1(
        customerData,
        vehicleData,
        jobCardNumber,
        {
          customerFeedback: appointment.customerComplaintIssue || "",
          estimatedDeliveryDate: appointment.estimatedDeliveryDate || "",
          warrantyStatus: appointment.warrantyStatus || "",
          technicianObservation: appointment.technicianObservation || "",
          insuranceStartDate: appointment.insuranceStartDate || "",
          insuranceEndDate: appointment.insuranceEndDate || "",
          insuranceCompanyName: appointment.insuranceCompanyName || "",
          batterySerialNumber: appointment.batterySerialNumber || "",
          mcuSerialNumber: appointment.mcuSerialNumber || "",
          vcuSerialNumber: appointment.vcuSerialNumber || "",
          otherPartSerialNumber: appointment.otherPartSerialNumber || "",
          variantBatteryCapacity: appointment.variantBatteryCapacity || "",
        }
      )
      : createEmptyJobCardPart1(jobCardNumber);

    part1.fullName = appointment.customerName || part1.fullName;

    // Minimal mapping for brevity - ideally use full mapping
    part1.mobilePrimary = appointment.phone || part1.mobilePrimary;

    const newJobCard: JobCard = {
      id: `JC-${Date.now()}`,
      jobCardNumber,
      serviceCenterId: appointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId?.toString() || "sc-001",
      serviceCenterCode,
      serviceCenterName: appointment.serviceCenterName || serviceCenterContext.serviceCenterName || undefined,
      customerId: customerData?.id?.toString() || appointment.customerExternalId?.toString() || `customer-${appointment.id}`,
      customerName: appointment.customerName,
      vehicleId: vehicleData?.id?.toString() || appointment.vehicleExternalId?.toString(),
      vehicle: appointment.vehicle,
      registration: appointment.registrationNumber || vehicleData?.registration || part1.registrationNumber || "",
      vehicleMake: appointment.vehicleBrand || vehicleMake || "",
      vehicleModel: appointment.vehicleModel || vehicleModel || "",
      customerType: appointment.customerType,
      serviceType: appointment.serviceType,
      description: appointment.customerComplaintIssue || `Service: ${appointment.serviceType}`,
      status: "Awaiting Quotation Approval",
      priority: "Normal",
      assignedEngineer: appointment.assignedTechnician || null,
      estimatedCost: appointment.estimatedCost ? `₹${appointment.estimatedCost}` : "₹0",
      estimatedTime: appointment.estimatedServiceTime || "To be determined",
      createdAt: new Date().toISOString(),
      parts: [],
      location: "Station",
      sourceAppointmentId: appointment.id,
      isTemporary: true,
      customerArrivalTimestamp: new Date().toISOString(),
      part1,
      part2: [],
    };

    await jobCardService.create(newJobCard);
    setCurrentJobCardId(newJobCard.id);
    return newJobCard;
  }, [serviceCenterContext, setCurrentJobCardId]);

  const handleConvertToQuotation = useCallback(async () => {
    if (!selectedAppointment) return;

    if (!selectedAppointment.vehicleBrand && !selectedAppointment.vehicle) {
      showToast("Please ensure vehicle information is available in the appointment.", "error");
      return;
    }

    if (!currentJobCardId) {
      await convertAppointmentToJobCard(selectedAppointment);
    }

    // Logic for navigation to quotation
    const customerIdForQuotation = detailCustomer?.id?.toString() || selectedAppointment.customerExternalId || undefined;
    const serviceCenterIdForQuotation = selectedAppointment.serviceCenterId?.toString() || serviceCenterContext.serviceCenterId || undefined;
    const serviceCenterNameForQuotation = selectedAppointment.serviceCenterName || serviceCenterContext.serviceCenterName || undefined;

    const quotationData = {
      appointmentId: selectedAppointment.id,
      customerName: selectedAppointment.customerName,
      phone: selectedAppointment.phone,
      vehicle: selectedAppointment.vehicle,
      customerId: customerIdForQuotation,
      serviceCenterId: serviceCenterIdForQuotation,
      serviceCenterName: serviceCenterNameForQuotation,
      jobCardId: currentJobCardId,
      appointmentData: selectedAppointment,
    };

    safeStorage.setItem("pendingQuotationFromAppointment", quotationData);
    router.push("/sc/quotations?fromAppointment=true");
    setShowDetailModal(false);
  }, [selectedAppointment, currentJobCardId, detailCustomer, serviceCenterContext, convertAppointmentToJobCard, router, setShowDetailModal, showToast]);

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <Toast show={toast.show} message={toast.message} type={toast.type} />

      <div className="pt-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Appointments</h1>
            <p className="text-gray-500">Schedule and manage customer appointments</p>
          </div>
          {canCreateNewAppointment && (
            <button
              onClick={handleOpenNewAppointment}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
            >
              <Calendar size={20} />
              Create New Appointment
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <AppointmentGrid
            appointments={visibleAppointments}
            onAppointmentClick={handleAppointmentClick}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenJobCard={handleOpenJobCard}
            getJobCardId={getJobCardId}
            isCallCenter={isCallCenter}
          />
        </div>
      </div>

      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          appointment={selectedAppointment}
          detailCustomer={detailCustomer}
          isCallCenter={isCallCenter}
          isServiceAdvisor={isServiceAdvisor}
          customerArrivalStatus={customerArrivalStatus}
          currentJobCard={currentJobCard}
          availableServiceCenters={availableServiceCenters}
          onCustomerArrived={() => setCustomerArrivalStatus("arrived")}
          onCustomerNotArrived={() => setCustomerArrivalStatus("not_arrived")}
          setCurrentJobCard={setCurrentJobCard}
          setCheckInSlipData={setCheckInSlipData}
          setShowCheckInSlipModal={setShowCheckInSlipModal}
          setAppointments={setAppointments} // Internal setter
          setSelectedAppointment={setSelectedAppointment}
          showToast={showToast}
          appointments={appointments}
          onGenerateCheckInSlip={handleGenerateCheckInSlip}
          currentJobCardId={currentJobCardId}
        />
      )}

      {showCheckInSlipModal && checkInSlipData && (
        <CheckInSlip data={checkInSlipData} onClose={() => setShowCheckInSlipModal(false)} />
      )}

      {showAppointmentFormModal && (selectedAppointmentCustomer || selectedAppointment) && (
        <AppointmentFormModal
          isOpen={showAppointmentFormModal}
          customer={selectedAppointmentCustomer}
          vehicle={selectedAppointmentVehicle}
          initialFormData={appointmentFormData}
          onClose={handleCloseAppointmentForm}
          onSubmit={handleSubmitAppointmentForm}
          canAccessCustomerType={true} // Simplify logic for now
          canAccessVehicleInfo={true}
          existingAppointments={appointments.filter(apt => apt.id !== selectedAppointment?.id)}
          onCustomerArrived={isServiceAdvisor ? handleCustomerArrivedFromForm : undefined}
          appointmentStatus={selectedAppointment?.status}
          customerArrived={selectedAppointment?.status === "In Progress" || selectedAppointment?.status === "Sent to Manager"}
        />
      )}

      <CustomerSearchModal
        isOpen={showAppointmentFormModal && !selectedAppointmentCustomer && !selectedAppointment}
        onClose={handleCloseAppointmentForm}
        searchValue={customerSearchValue}
        onSearchChange={setCustomerSearchValue}
        onSearch={searchAppointmentCustomer}
        onClearSearch={clearAppointmentCustomerSearch}
        customers={appointmentCustomerSearchResults}
        loading={appointmentCustomerSearchLoadingState}
        onSelectCustomer={handleCustomerSelectForAppointment}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading appointments...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
