import * as React from 'react';
import { Car, Wrench, FileText, Clock, User } from 'lucide-react';
import { JobCard, KanbanColumn, JobCardStatus, Priority } from '@/shared/types';

interface JobCardKanbanProps {
    kanbanColumns: KanbanColumn[];
    activeTab?: string; // Optional: if provided, filters columns (Technician view)
    getJobsByStatus: (status: JobCardStatus) => JobCard[];
    partsRequestsData: Record<string, any>;
    onJobClick: (job: JobCard) => void;
    getPriorityColor: (priority: Priority) => string;
}

const JobCardKanban: React.FC<JobCardKanbanProps> = ({
    kanbanColumns,
    activeTab,
    getJobsByStatus,
    partsRequestsData,
    onJobClick,
    getPriorityColor,
}) => {
    return (
        <div className="p-6">
            <div className="w-full overflow-x-auto pb-6">
                <div className="inline-flex gap-4 min-w-max">
                    {kanbanColumns
                        .filter((col) => {
                            if (!activeTab) return true; // Show all columns if no activeTab (Manager/Advisor view)
                            return activeTab === "assigned" ? col.status === "Assigned" :
                                activeTab === "in_progress" ? col.status === "In Progress" :
                                    activeTab === "completed" ? col.status === "Completed" : false;
                        })
                        .map((column) => {
                            const columnJobs = getJobsByStatus(column.status);
                            const columnColorMap: Record<string, { bg: string; border: string; text: string }> = {
                                created: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
                                assigned: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
                                in_progress: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
                                parts_pending: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
                                completed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
                            };
                            const columnColor = columnColorMap[column.id] || columnColorMap.created;

                            return (
                                <div
                                    key={column.id}
                                    className={`shrink-0 w-72 sm:w-80 ${columnColor.bg} rounded-lg border-2 ${columnColor.border} shadow-sm`}
                                >
                                    <div className={`sticky top-0 ${columnColor.bg} rounded-t-lg border-b-2 ${columnColor.border} px-4 py-3 z-10`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold ${columnColor.text} text-base`}>
                                                    {column.title}
                                                </h3>
                                            </div>
                                            <span className={`${columnColor.text} bg-white/80 px-2.5 py-1 rounded-full text-xs font-bold min-w-[24px] text-center`}>
                                                {columnJobs.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-3 py-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                                        {columnJobs.map((job) => {
                                            const jobCardId = job.id || job.jobCardNumber;
                                            const request = partsRequestsData[jobCardId] || partsRequestsData[job.id] || partsRequestsData[job.jobCardNumber || ""];
                                            const hasRequest = request && !request.inventoryManagerAssigned;

                                            return (
                                                <div
                                                    key={job.id}
                                                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                                                    onClick={() => onJobClick(job)}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">
                                                                {job.jobCardNumber || job.id}
                                                            </p>
                                                            <p className="text-xs text-gray-600 truncate">
                                                                {job.customerName}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${getPriorityColor(
                                                                job.priority
                                                            )} shadow-sm`}
                                                            title={job.priority}
                                                        ></span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
                                                        <Car size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate font-medium">{job.vehicle}</span>
                                                    </div>

                                                    <div className="mb-3">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                                            <Wrench size={10} />
                                                            {job.serviceType}
                                                        </span>
                                                    </div>

                                                    {hasRequest && (
                                                        <div className="mt-2">
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                                                Parts Request Pending
                                                            </span>
                                                        </div>
                                                    )}
                                                    {request?.inventoryManagerAssigned && (
                                                        <div className="mt-2">
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                                ✓ Parts Assigned
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Footer Info */}
                                                    <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 mt-3">
                                                        <span className="text-gray-600 flex items-center gap-1">
                                                            <Clock size={12} className="text-gray-400" />
                                                            <span className="font-medium">{job.estimatedTime}</span>
                                                        </span>
                                                        <span className="font-bold text-gray-900">
                                                            {job.estimatedCost}
                                                        </span>
                                                    </div>

                                                    {job.assignedEngineer && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs">
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <User size={12} className="text-gray-400" />
                                                                <span className="font-medium truncate">{job.assignedEngineer}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!job.assignedEngineer && activeTab && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <p className="text-xs text-blue-600 font-medium">Click to request parts</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {columnJobs.length === 0 && (
                                            <div className="text-center py-12 text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <FileText size={20} className="text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-medium">No jobs</p>
                                                    <p className="text-xs">Jobs will appear here</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default JobCardKanban;
