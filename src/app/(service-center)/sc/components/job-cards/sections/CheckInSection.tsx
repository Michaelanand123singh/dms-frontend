import React from 'react';
import { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";

interface CheckInSectionProps {
    form: CreateJobCardForm;
    updateField: <K extends keyof CreateJobCardForm>(field: K, value: CreateJobCardForm[K]) => void;
}

export const CheckInSection: React.FC<CheckInSectionProps> = ({
    form,
    updateField,
}) => {
    return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                Operational & Check-in Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Pickup/Drop Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Pickup & Drop Service</h4>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="pickupDropRequired"
                            checked={form.pickupDropRequired || false}
                            onChange={(e) => updateField('pickupDropRequired', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="pickupDropRequired" className="text-sm font-medium text-gray-700">
                            Pickup/Drop Service Required
                        </label>
                    </div>

                    {form.pickupDropRequired && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                                <textarea
                                    value={form.pickupAddress || ""}
                                    onChange={(e) => updateField('pickupAddress', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    rows={2}
                                    placeholder="Enter pickup address"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={form.pickupState || ""}
                                        onChange={(e) => updateField('pickupState', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={form.pickupCity || ""}
                                        onChange={(e) => updateField('pickupCity', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={form.pickupPincode || ""}
                                        onChange={(e) => updateField('pickupPincode', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Drop Address</label>
                                <textarea
                                    value={form.dropAddress || ""}
                                    onChange={(e) => updateField('dropAddress', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    rows={2}
                                    placeholder="Enter drop address"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={form.dropState || ""}
                                        onChange={(e) => updateField('dropState', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={form.dropCity || ""}
                                        onChange={(e) => updateField('dropCity', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={form.dropPincode || ""}
                                        onChange={(e) => updateField('dropPincode', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side - Check-in Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Check-in Information</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Mode</label>
                        <select
                            value={form.arrivalMode || ""}
                            onChange={(e) => updateField('arrivalMode', e.target.value as any)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Select Mode</option>
                            <option value="vehicle_present">Vehicle Present</option>
                            <option value="vehicle_absent">Vehicle Absent</option>
                            <option value="check_in_only">Check-in Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Notes</label>
                        <textarea
                            value={form.checkInNotes || ""}
                            onChange={(e) => updateField('checkInNotes', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={3}
                            placeholder="Additional check-in notes..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Slip Number</label>
                        <input
                            type="text"
                            value={form.checkInSlipNumber || ""}
                            onChange={(e) => updateField('checkInSlipNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                            <input
                                type="date"
                                value={form.checkInDate || ""}
                                onChange={(e) => updateField('checkInDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                            <input
                                type="time"
                                value={form.checkInTime || ""}
                                onChange={(e) => updateField('checkInTime', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
