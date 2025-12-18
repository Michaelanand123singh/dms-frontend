import * as React from 'react';
import { FileText, Wrench, Car, User, Calendar, Eye, Edit, Clock } from 'lucide-react';
import { JobCard, JobCardStatus, Priority } from '@/shared/types';
import { UserInfo } from '@/shared/types/auth.types';
import { JobCardPartsRequest } from '@/shared/types/jobcard-inventory.types';

interface JobCardListProps {
    currentJobs: JobCard[];
    activeTab?: string;
    partsRequestsData: Record<string, JobCardPartsRequest>;
    getStatusColor: (status: JobCardStatus) => string;
    getPriorityColor: (priority: Priority) => string;
    onJobClick: (job: JobCard) => void;
    isServiceAdvisor?: boolean;
    isServiceManager?: boolean;
    isTechnician?: boolean;
    userInfo?: UserInfo | null;
    onView?: (jobId: string) => void;
    onCreateQuotation?: (job: JobCard) => void;
    onEditDraft?: (job: JobCard) => void;
    onEdit?: (jobId: string) => void;
    onAssignEngineer?: (jobId: string) => void;
    onUpdateStatus?: (jobId: string, initialStatus: JobCardStatus) => void;
    getNextStatus?: (status: JobCardStatus) => JobCardStatus[];
    hasQuotation?: (jobId: string) => boolean;
}

const JobCardList: React.FC<JobCardListProps> = ({
    currentJobs,
    activeTab,
    partsRequestsData,
    getStatusColor,
    getPriorityColor,
    onJobClick,
    isServiceAdvisor,
    isServiceManager,
    isTechnician,
    userInfo,
    onView,
    onCreateQuotation,
    onEditDraft,
    onEdit,
    onAssignEngineer,
    onUpdateStatus,
    getNextStatus,
    hasQuotation,
}) => {
    if (currentJobs.length === 0) {
        return (
            <div className="p-6 text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No {activeTab?.replace("_", " ") || "available"} jobs found</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {currentJobs.map((job) => {
                const jobCardId = job.id || job.jobCardNumber;
                const request = partsRequestsData[jobCardId] || partsRequestsData[job.id] || partsRequestsData[job.jobCardNumber || ""];
                const hasRequest = request && !request.inventoryManagerAssigned;

                return (
                    <div
                        key={job.id}
                        className="bg-white rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 hover:shadow-lg transition flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                        onClick={() => !isServiceManager && !isServiceAdvisor && onJobClick(job)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                                    {job.jobCardNumber || job.id}
                                </span>
                                <span
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                        job.status
                                    )}`}
                                >
                                    {job.status}
                                </span>
                                <span
                                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getPriorityColor(
                                        job.priority
                                    )}`}
                                    title={job.priority}
                                ></span>
                                {hasRequest && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium border border-orange-200">
                                        Parts Request Pending
                                    </span>
                                )}
                                {request?.inventoryManagerAssigned && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">
                                        ✓ Parts Assigned
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 gap-3 md:gap-4 mb-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-sm md:text-base truncate">{job.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Car size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-sm md:text-base truncate">{job.vehicle}</span>
                                    <span className="text-gray-500 text-xs md:text-sm hidden sm:inline">• {job.registration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Wrench size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-sm md:text-base truncate">{job.serviceType}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-sm md:text-base truncate">{job.createdAt}</span>
                                </div>
                            </div>

                            <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2 break-words">{job.description}</p>

                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 md:gap-4 text-xs md:text-sm">
                                {job.assignedEngineer && (
                                    <span className="text-gray-500 truncate">
                                        Engineer: <span className="font-medium text-gray-700">{job.assignedEngineer}</span>
                                    </span>
                                )}
                                <span className="text-gray-500">
                                    Estimated: <span className="font-medium text-gray-700">{job.estimatedCost}</span>
                                </span>
                                <span className="text-gray-500">
                                    Time: <span className="font-medium text-gray-700">{job.estimatedTime}</span>
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            <div className="flex gap-2">
                                {onView && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onView(job.id);
                                        }}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition inline-flex items-center gap-1 justify-center"
                                    >
                                        <Eye size={14} />
                                        View
                                    </button>
                                )}
                                {isServiceAdvisor && job.status === "Awaiting Quotation Approval" && job.isTemporary && !hasQuotation?.(job.id) && onCreateQuotation && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateQuotation(job);
                                        }}
                                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-700 transition inline-flex items-center gap-1 justify-center"
                                    >
                                        <FileText size={14} />
                                        Create Quotation
                                    </button>
                                )}
                                {isServiceAdvisor && job.draftIntake && job.sourceAppointmentId && onEditDraft && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditDraft(job);
                                        }}
                                        className="flex-1 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-yellow-100 transition inline-flex items-center gap-1 justify-center"
                                    >
                                        <Edit size={14} />
                                        Edit Draft
                                    </button>
                                )}
                                {isServiceManager && onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(job.id);
                                        }}
                                        className="flex-1 border border-blue-400 text-blue-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-100 transition inline-flex items-center gap-1 justify-center"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {isServiceManager && job.status === "Created" && onAssignEngineer && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAssignEngineer(job.id);
                                    }}
                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                                >
                                    Assign Engineer
                                </button>
                            )}

                            {isServiceManager && getNextStatus && getNextStatus(job.status).length > 0 && onUpdateStatus && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(job.id, job.status);
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                                >
                                    Update Status
                                </button>
                            )}

                            {isTechnician && job.assignedEngineer === userInfo?.name && getNextStatus && getNextStatus(job.status).length > 0 && onUpdateStatus && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(job.id, job.status);
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition w-full"
                                >
                                    Update Status
                                </button>
                            )}

                            {isTechnician && !job.assignedEngineer && (
                                <p className="text-xs text-blue-600 font-medium text-center bg-blue-50 py-1 rounded">Click to request parts</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default JobCardList;
