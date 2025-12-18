import * as React from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { JobCardStatus } from '@/shared/types';

interface StatusUpdateModalProps {
    open: boolean;
    onClose: () => void;
    currentStatus: JobCardStatus;
    newStatus: JobCardStatus;
    onStatusChange: (status: JobCardStatus) => void;
    onSubmit: () => void;
    loading: boolean;
    getNextStatus: (currentStatus: JobCardStatus) => JobCardStatus[];
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
    open,
    onClose,
    currentStatus,
    newStatus,
    onStatusChange,
    onSubmit,
    loading,
    getNextStatus,
}) => {
    if (!open) return null;

    const nextStatuses = getNextStatus(currentStatus);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Update Status</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => onStatusChange(e.target.value as JobCardStatus)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {nextStatuses.length > 0 ? (
                                nextStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))
                            ) : (
                                <option value={currentStatus} disabled>No further transitions available</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={loading || nextStatuses.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                Update Status
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusUpdateModal;
