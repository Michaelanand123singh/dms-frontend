import React from 'react';
import { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";
import { INDIAN_STATES, getCitiesByState } from "@/shared/constants/indian-states-cities";

interface CustomerVehicleSectionProps {
    form: CreateJobCardForm;
    updateField: <K extends keyof CreateJobCardForm>(field: K, value: CreateJobCardForm[K]) => void;
    previewJobCardNumber: string;
}

export const CustomerVehicleSection: React.FC<CustomerVehicleSectionProps> = ({
    form,
    updateField,
    previewJobCardNumber,
}) => {
    return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    Customer & Vehicle Information
                </h3>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-200">
                    Job Card: {previewJobCardNumber || "Generating..."}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT SIDE */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer & Vehicle Details</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.fullName || form.customerName}
                            onChange={(e) => {
                                updateField('fullName', e.target.value);
                                updateField('customerName', e.target.value);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                            placeholder="Enter customer full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number (Primary) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={form.mobilePrimary}
                            onChange={(e) => updateField('mobilePrimary', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                            placeholder="9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            value={form.whatsappNumber || ""}
                            onChange={(e) => updateField('whatsappNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alternate Mobile
                        </label>
                        <input
                            type="tel"
                            value={form.alternateNumber || ""}
                            onChange={(e) => updateField('alternateNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email || ""}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Type
                        </label>
                        <select
                            value={form.customerType}
                            onChange={(e) => updateField('customerType', e.target.value as "B2C" | "B2B")}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Select Type</option>
                            <option value="B2C">B2C</option>
                            <option value="B2B">B2B</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Brand <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.vehicleBrand || form.vehicleMake}
                            onChange={(e) => {
                                updateField('vehicleBrand', e.target.value);
                                updateField('vehicleMake', e.target.value);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                            placeholder="Honda"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Model <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.vehicleModel}
                            onChange={(e) => updateField('vehicleModel', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                            placeholder="City"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.vehicleRegistration}
                            onChange={(e) => updateField('vehicleRegistration', e.target.value.toUpperCase())}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                            placeholder="PB10AB1234"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            VIN / Chassis Number
                        </label>
                        <input
                            type="text"
                            value={form.vinChassisNumber}
                            onChange={(e) => updateField('vinChassisNumber', e.target.value.toUpperCase())}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="MH12AB3456CD7890"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variant / Battery Capacity
                        </label>
                        <input
                            type="text"
                            value={form.variantBatteryCapacity}
                            onChange={(e) => updateField('variantBatteryCapacity', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., 50kWh"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Year
                        </label>
                        <input
                            type="number"
                            value={form.vehicleYear || ""}
                            onChange={(e) => updateField('vehicleYear', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="2023"
                            min="1900"
                            max="2100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motor Number
                        </label>
                        <input
                            type="text"
                            value={form.motorNumber || ""}
                            onChange={(e) => updateField('motorNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Motor serial number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Charger Serial Number
                        </label>
                        <input
                            type="text"
                            value={form.chargerSerialNumber || ""}
                            onChange={(e) => updateField('chargerSerialNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Charger serial number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Purchase
                        </label>
                        <input
                            type="date"
                            value={form.dateOfPurchase || ""}
                            onChange={(e) => updateField('dateOfPurchase', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Color
                        </label>
                        <input
                            type="text"
                            value={form.vehicleColor || ""}
                            onChange={(e) => updateField('vehicleColor', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., Red, Blue, Black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warranty Status
                        </label>
                        <input
                            type="text"
                            value={form.warrantyStatus}
                            onChange={(e) => updateField('warrantyStatus', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., Active, Expired"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Delivery Date
                        </label>
                        <input
                            type="date"
                            value={form.estimatedDeliveryDate}
                            onChange={(e) => updateField('estimatedDeliveryDate', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Address & Additional Information</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Address
                        </label>
                        <textarea
                            value={form.customerAddress}
                            onChange={(e) => updateField('customerAddress', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={3}
                            placeholder="Enter full address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.customerState || ""}
                                onChange={(e) => {
                                    updateField('customerState', e.target.value);
                                    updateField('customerCity', ''); // Reset city when state changes
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="">Select State</option>
                                {INDIAN_STATES.map((state) => (
                                    <option key={state.code} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.customerCity || ""}
                                onChange={(e) => updateField('customerCity', e.target.value)}
                                disabled={!form.customerState}
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${!form.customerState ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''
                                    }`}
                            >
                                <option value="">{form.customerState ? 'Select City' : 'Select State First'}</option>
                                {form.customerState && getCitiesByState(form.customerState).map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode
                            </label>
                            <input
                                type="text"
                                value={form.customerPincode || ""}
                                onChange={(e) => updateField('customerPincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="6-digit pincode"
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Feedback / Concerns
                        </label>
                        <textarea
                            value={form.customerFeedback}
                            onChange={(e) => updateField('customerFeedback', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={4}
                            placeholder="Describe customer complaints or feedback..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Technician Observation
                        </label>
                        <textarea
                            value={form.technicianObservation}
                            onChange={(e) => updateField('technicianObservation', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={4}
                            placeholder="Initial observations from the technician..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Insurance Start Date
                            </label>
                            <input
                                type="date"
                                value={form.insuranceStartDate}
                                onChange={(e) => updateField('insuranceStartDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Insurance End Date
                            </label>
                            <input
                                type="date"
                                value={form.insuranceEndDate}
                                onChange={(e) => updateField('insuranceEndDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Insurance Company Name
                        </label>
                        <input
                            type="text"
                            value={form.insuranceCompanyName}
                            onChange={(e) => updateField('insuranceCompanyName', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., HDFC ERGO"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Battery Serial Number
                            </label>
                            <input
                                type="text"
                                value={form.batterySerialNumber}
                                onChange={(e) => updateField('batterySerialNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Serial number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                MCU Serial Number
                            </label>
                            <input
                                type="text"
                                value={form.mcuSerialNumber}
                                onChange={(e) => updateField('mcuSerialNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Serial number"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                VCU Serial Number
                            </label>
                            <input
                                type="text"
                                value={form.vcuSerialNumber}
                                onChange={(e) => updateField('vcuSerialNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Serial number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Part Serial Number
                            </label>
                            <input
                                type="text"
                                value={form.otherPartSerialNumber}
                                onChange={(e) => updateField('otherPartSerialNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Serial number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Service History
                        </label>
                        <textarea
                            value={form.previousServiceHistory || ""}
                            onChange={(e) => updateField('previousServiceHistory', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={3}
                            placeholder="Previous service records, repair history, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Odometer Reading
                        </label>
                        <input
                            type="text"
                            value={form.odometerReading || ""}
                            onChange={(e) => updateField('odometerReading', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., 15000 km"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Communication Mode
                        </label>
                        <select
                            value={form.preferredCommunicationMode || ""}
                            onChange={(e) => updateField('preferredCommunicationMode', e.target.value as any)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Select Mode</option>
                            <option value="Phone">Phone</option>
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
