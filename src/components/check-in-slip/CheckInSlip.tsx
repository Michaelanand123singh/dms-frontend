"use client";
import { useRef } from "react";
import { Printer, Download, X, Building2, User, Car, Calendar, Clock, Hash } from "lucide-react";

export interface CheckInSlipData {
  slipNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
  vin?: string;
  checkInDate: string;
  checkInTime: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  serviceCenterCity: string;
  serviceCenterState: string;
  serviceCenterPincode: string;
  serviceCenterPhone?: string;
  expectedServiceDate?: string;
  serviceType?: string;
  notes?: string;
}

interface CheckInSlipProps {
  data: CheckInSlipData;
  onClose?: () => void;
  showActions?: boolean;
}

export default function CheckInSlip({ data, onClose, showActions = true }: CheckInSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In production, this would use a PDF library like jsPDF or html2pdf
    // For now, we'll use the browser's print to PDF functionality
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // If time is in HH:MM format, format it nicely
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header with Actions */}
        {showActions && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-[101] no-print">
            <h2 className="text-2xl font-bold text-gray-900">Check-in Slip</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
              {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Check-in Slip Content */}
        <div ref={slipRef} className="p-8 bg-white">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                background: white !important;
              }
              @page {
                margin: 20mm;
                size: A4;
              }
            }
          `}} />

          {/* Header Section */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              {/* Service Center Details */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center mb-3">
                    <Building2 className="text-gray-400" size={40} />
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <h3 className="text-xl font-bold text-gray-900">{data.serviceCenterName}</h3>
                  <p className="text-gray-700">{data.serviceCenterAddress}</p>
                  <p className="text-gray-700">
                    {data.serviceCenterCity}, {data.serviceCenterState} - {data.serviceCenterPincode}
                  </p>
                  {data.serviceCenterPhone && (
                    <p className="text-gray-700">Phone: {data.serviceCenterPhone}</p>
                  )}
                </div>
              </div>

              {/* Slip Number & Date */}
              <div className="text-right">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">CHECK-IN SLIP</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Slip No:</span>
                    <p className="text-gray-900 font-medium">{data.slipNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-900">{formatDate(data.checkInDate)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Time:</span>
                    <p className="text-gray-900">{formatTime(data.checkInTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Customer Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Customer Name</p>
                <p className="text-gray-900 font-medium">{data.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Phone Number</p>
                <p className="text-gray-900">{data.phone}</p>
              </div>
              {data.email && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                  <p className="text-gray-900">{data.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Car className="text-blue-600" size={20} />
              Vehicle Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Make</p>
                <p className="text-gray-900">{data.vehicleMake}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Vehicle Model</p>
                <p className="text-gray-900">{data.vehicleModel}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Registration Number</p>
                <p className="text-gray-900 font-medium">{data.registrationNumber}</p>
              </div>
              {data.vin && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">VIN / Chassis Number</p>
                  <p className="text-gray-900">{data.vin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          {(data.serviceType || data.expectedServiceDate) && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {data.serviceType && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Service Type</p>
                    <p className="text-gray-900">{data.serviceType}</p>
                  </div>
                )}
                {data.expectedServiceDate && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Expected Service Date</p>
                    <p className="text-gray-900">{formatDate(data.expectedServiceDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-gray-900 text-sm">{data.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p className="font-semibold">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-2xl mx-auto">
                <li>Please keep this slip safe for vehicle collection</li>
                <li>Bring this slip when collecting your vehicle</li>
                <li>Contact the service center for any queries</li>
                {data.serviceCenterPhone && (
                  <li>Phone: {data.serviceCenterPhone}</li>
                )}
              </ul>
              <p className="mt-4 text-xs text-gray-500">
                This is a system-generated check-in slip. Please verify all details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate check-in slip number
export function generateCheckInSlipNumber(serviceCenterCode: string = "SC001"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  
  return `${serviceCenterCode}-CIS-${year}${month}${day}-${random}`;
}




