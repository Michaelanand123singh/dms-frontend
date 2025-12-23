import * as React from 'react';
import { Calendar, Clock, Car, Phone, Building2, Trash2, ClipboardList } from "lucide-react";
import type { AppointmentRecord } from "../../appointments/types";
import { StatusBadge } from "./StatusBadge";

interface AppointmentGridProps {
  appointments: AppointmentRecord[];
  onAppointmentClick: (appointment: AppointmentRecord) => void;
  onDeleteAppointment: (id: number | string) => void;
  onOpenJobCard?: (appointmentId: number | string) => void;
  getJobCardId?: (appointmentId: number | string) => string | null;
  isCallCenter: boolean;
}

export const AppointmentGrid = React.memo<AppointmentGridProps>(({ appointments, onAppointmentClick, onDeleteAppointment, onOpenJobCard, getJobCardId, isCallCenter }) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 text-lg">No appointments scheduled</p>
        <p className="text-gray-400 text-sm mt-2">No appointments available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {appointments.map((apt) => {
        const isInProgress = apt.status === "In Progress";
        const jobCardId = isInProgress && getJobCardId ? getJobCardId(apt.id) : null;
        const hasJobCard = jobCardId !== null && jobCardId !== undefined;

        return (
          <div
            key={apt.id}
            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50/30 relative group"
          >
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              {hasJobCard && onOpenJobCard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenJobCard(apt.id);
                  }}
                  className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100"
                  title="Open Job Card"
                >
                  <ClipboardList size={14} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the appointment for ${apt.customerName}?`)) {
                    onDeleteAppointment(apt.id);
                  }
                }}
                className="p-1.5 rounded-full bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                title="Delete appointment"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {hasJobCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenJobCard) {
                    onOpenJobCard(apt.id);
                  }
                }}
                className="w-full mt-2 mb-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <ClipboardList size={16} />
                Open Job Card
              </button>
            )}

            <div onClick={() => onAppointmentClick(apt)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="font-semibold text-sm">{apt.time}</span>
                </div>
                <StatusBadge status={apt.status} />
              </div>
              <p className="font-medium text-gray-800 text-sm mb-1">{apt.customerName}</p>
              <div className="flex items-center gap-1 mb-1">
                <Car size={12} className="text-gray-400" />
                <p className="text-xs text-gray-600">{apt.vehicle}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{apt.serviceType}</p>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                <Phone size={12} className="text-gray-400" />
                <p className="text-xs text-gray-500">{apt.phone}</p>
              </div>
              {isCallCenter && apt.serviceCenterName && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                  <Building2 size={12} className="text-indigo-500" />
                  <p className="text-xs text-indigo-600 font-medium">{apt.serviceCenterName}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Display name for debugging
(AppointmentGrid as React.NamedExoticComponent).displayName = 'AppointmentGrid';

