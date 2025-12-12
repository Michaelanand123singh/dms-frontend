/**
 * Recent Customers Table Component
 */

import { Clock, Phone, Mail, Car, Calendar } from "lucide-react";
import { Button } from "../../components/shared/Button";
import type { CustomerWithVehicles, Vehicle } from "@/shared/types";
import type { AppointmentForm as AppointmentFormType } from "../../components/appointment/types";

export interface RecentCustomersTableProps {
  recentCustomers: CustomerWithVehicles[];
  isCallCenter: boolean;
  onCustomerSelect: (customer: CustomerWithVehicles) => void;
  onScheduleClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    customer: CustomerWithVehicles,
    setSelectedCustomer: (customer: CustomerWithVehicles) => void,
    initializeAppointmentForm: (customer: CustomerWithVehicles) => void,
    setShowVehicleDetails: (show: boolean) => void,
    setShowScheduleAppointment: (show: boolean) => void,
    resetVehicleForm: () => void,
    setVehicleFormCity: (city: string) => void,
    setVehicleFormState: (state: string) => void,
    setShouldOpenAppointmentAfterVehicleAdd: (should: boolean) => void,
    setShowAddVehiclePopup: (show: boolean) => void
  ) => void;
  setSelectedCustomer: (customer: CustomerWithVehicles) => void;
  initializeAppointmentForm: (customer: CustomerWithVehicles) => void;
  setShowVehicleDetails: (show: boolean) => void;
  setShowScheduleAppointment: (show: boolean) => void;
  resetVehicleForm: () => void;
  setVehicleFormCity: (city: string) => void;
  setVehicleFormState: (state: string) => void;
  setShouldOpenAppointmentAfterVehicleAdd: (should: boolean) => void;
  setShowAddVehiclePopup: (show: boolean) => void;
}

export function RecentCustomersTable({
  recentCustomers,
  isCallCenter,
  onCustomerSelect,
  onScheduleClick,
  setSelectedCustomer,
  initializeAppointmentForm,
  setShowVehicleDetails,
  setShowScheduleAppointment,
  resetVehicleForm,
  setVehicleFormCity,
  setVehicleFormState,
  setShouldOpenAppointmentAfterVehicleAdd,
  setShowAddVehiclePopup,
}: RecentCustomersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-100">
            <Clock className="text-indigo-600" size={18} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
          <span className="text-sm text-gray-500 font-medium">({recentCustomers.length})</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                {isCallCenter && (
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service Center
                  </th>
                )}
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehicles
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCustomers.map((customer) => {
                // Get available vehicles (status !== "Active Job Card")
                const availableVehicles =
                  customer.vehicles?.filter((v) => v.currentStatus !== "Active Job Card") || [];

                // Check if customer has any available vehicles or no vehicles (can add new)
                const canSchedule =
                  availableVehicles.length > 0 || !customer.vehicles || customer.vehicles.length === 0;

                return (
                  <tr
                    key={customer.id}
                    onClick={() => onCustomerSelect(customer)}
                    className="hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {customer.name}
                          </p>
                          {customer.address && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                              {customer.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-gray-700 font-medium">
                        {customer.customerNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" strokeWidth={2} />
                        <span className="text-sm text-gray-700">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {customer.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-gray-400" strokeWidth={2} />
                          <span className="text-sm text-gray-700 truncate max-w-[180px]">{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    {isCallCenter && (
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{customer.serviceCenterName || "—"}</span>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Car size={14} className="text-gray-400" strokeWidth={2} />
                        <span className="text-sm text-gray-700 font-medium">{customer.totalVehicles || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold text-gray-900">{customer.totalSpent || "₹0"}</span>
                    </td>
                    <td className="py-4 px-4">
                      {!canSchedule ? (
                        <span className="text-xs text-gray-400 italic">No available vehicles</span>
                      ) : (
                        <Button
                          onClick={(e) =>
                            onScheduleClick(
                              e,
                              customer,
                              setSelectedCustomer,
                              initializeAppointmentForm,
                              setShowVehicleDetails,
                              setShowScheduleAppointment,
                              resetVehicleForm,
                              setVehicleFormCity,
                              setVehicleFormState,
                              setShouldOpenAppointmentAfterVehicleAdd,
                              setShowAddVehiclePopup
                            )
                          }
                          variant="success"
                          size="sm"
                          icon={Calendar}
                          className="px-3 py-1.5 text-xs"
                        >
                          Schedule
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

