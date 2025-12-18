import * as React from 'react';
import { X, Loader2, UserCheck } from 'lucide-react';
import { Engineer } from '@/__mocks__/data/job-cards.mock';

interface AssignEngineerModalProps {
    open: boolean;
    onClose: () => void;
    engineers: Engineer[];
    selectedEngineer: string;
    onSelectEngineer: (id: string) => void;
    onSubmit: () => void;
    loading: boolean;
}

const AssignEngineerModal: React.FC<AssignEngineerModalProps> = ({
    open,
    onClose,
    engineers,
    selectedEngineer,
    onSelectEngineer,
    onSubmit,
    loading,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Assign Engineer</h2>
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
                            Select Engineer <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {engineers.map((engineer) => (
                                <label
                                    key={engineer.id}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${selectedEngineer === engineer.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="engineer"
                                        value={engineer.id}
                                        checked={selectedEngineer === engineer.id}
                                        onChange={(e) => onSelectEngineer(e.target.value)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-700">{engineer.name}</p>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${engineer.status === "Available"
                                                    ? "bg-green-100 text-green-700"
                                                    : engineer.status === "Busy"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {engineer.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Current Jobs: {engineer.currentJobs} • Skills: {engineer.skills.join(", ")}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
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
                        disabled={loading || !selectedEngineer}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserCheck size={16} />
                                Assign Engineer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignEngineerModal;
