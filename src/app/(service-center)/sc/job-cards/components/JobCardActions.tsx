import * as React from 'react';
import { JobCard, JobCardStatus } from '@/shared/types';

interface JobCardActionsProps {
    isServiceAdvisor: boolean;
    isServiceManager: boolean;
    selectedJob: JobCard | null;
    technicianApproved: boolean;
    setTechnicianApproved: (val: boolean) => void;
    partsApproved: boolean;
    setPartsApproved: (val: boolean) => void;
    handleSubmitToManager: () => void;
    handleManagerQuoteAction: () => void;
    handleCreateInvoice: () => void;
    handleSendInvoiceToCustomer: () => void;
    visibleJobCards: JobCard[];
}

const JobCardActions: React.FC<JobCardActionsProps> = ({
    isServiceAdvisor,
    isServiceManager,
    selectedJob,
    technicianApproved,
    setTechnicianApproved,
    partsApproved,
    setPartsApproved,
    handleSubmitToManager,
    handleManagerQuoteAction,
    handleCreateInvoice,
    handleSendInvoiceToCustomer,
    visibleJobCards,
}) => {
    return (
        <>
            {/* Service Advisor: Submit to Manager Panel */}
            {isServiceAdvisor && selectedJob && selectedJob.status === "Created" && !selectedJob.submittedToManager && (
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 shadow-sm border border-blue-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Submit Job Card to Manager</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Review the job card details and required parts, then submit to manager for approval and technician assignment.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmitToManager}
                            className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-blue-600 text-white shadow-md hover:bg-blue-700"
                        >
                            Submit to Manager
                        </button>
                    </div>
                </div>
            )}

            {/* Service Manager: Manager-Driven Quotation & Monitoring Panel */}
            {isServiceManager && (
                <>
                    <div className="mb-4 bg-gradient-to-r from-indigo-50 to-white rounded-xl p-4 shadow-sm border border-indigo-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-indigo-800">Manager-Driven Quotation</p>
                                <p className="text-xs text-indigo-600 mt-1">
                                    Confirm technician + inventory approvals before creating the manager quote or passing it back to the advisor.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs text-indigo-700">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={technicianApproved}
                                        onChange={(e) => setTechnicianApproved(e.target.checked)}
                                        className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Technician cleared
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={partsApproved}
                                        onChange={(e) => setPartsApproved(e.target.checked)}
                                        className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Parts approved
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleManagerQuoteAction}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${technicianApproved && partsApproved
                                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                                    : "bg-indigo-200 text-indigo-600 cursor-not-allowed"
                                    }`}
                                disabled={!(technicianApproved && partsApproved)}
                            >
                                Create Manager Quote
                            </button>
                        </div>
                    </div>

                    {/* Service Manager: Create Invoice Panel */}
                    {selectedJob && selectedJob.status === "Completed" && !selectedJob.invoiceNumber && (
                        <div className="mb-4 bg-gradient-to-r from-green-50 to-white rounded-xl p-4 shadow-sm border border-green-100">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-green-800">Create Final Invoice</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Job card is completed. Create invoice and send to service advisor for customer delivery.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCreateInvoice}
                                    className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-green-600 text-white shadow-md hover:bg-green-700"
                                >
                                    Create Invoice
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Service Manager: Monitor Assigned Job Cards */}
                    <div className="mb-4 bg-gradient-to-r from-purple-50 to-white rounded-xl p-4 shadow-sm border border-purple-100">
                        <div>
                            <p className="text-sm font-semibold text-purple-800 mb-2">Monitor Assigned Job Cards</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="bg-white p-3 rounded-lg border border-purple-200">
                                    <p className="text-purple-600 font-medium">Assigned</p>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {visibleJobCards.filter((j) => j.status === "Assigned").length}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-purple-200">
                                    <p className="text-purple-600 font-medium">In Progress</p>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {visibleJobCards.filter((j) => j.status === "In Progress").length}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-purple-200">
                                    <p className="text-purple-600 font-medium">Parts Pending</p>
                                    <p className="text-2xl font-bold text-purple-800">
                                        {visibleJobCards.filter((j) => j.status === "Parts Pending").length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Service Advisor: Send Invoice to Customer */}
            {isServiceAdvisor && selectedJob && selectedJob.invoiceNumber && !selectedJob.invoiceSentToCustomer && (
                <div className="mb-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 shadow-sm border border-yellow-100">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-yellow-800">Send Invoice to Customer</p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Invoice {selectedJob.invoiceNumber} is ready. Send to customer at vehicle receiving time.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSendInvoiceToCustomer}
                            className="px-4 py-2 rounded-lg font-semibold text-sm transition bg-yellow-600 text-white shadow-md hover:bg-yellow-700"
                        >
                            Send Invoice to Customer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default JobCardActions;
