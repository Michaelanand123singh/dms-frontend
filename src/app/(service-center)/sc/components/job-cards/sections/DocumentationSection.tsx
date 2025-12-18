import React from 'react';
import { Video, Image as ImageIcon } from 'lucide-react';
import { CreateJobCardForm } from "@/features/job-cards/types/job-card.types";

interface DocumentationSectionProps {
    form: CreateJobCardForm;
    updateField: <K extends keyof CreateJobCardForm>(field: K, value: CreateJobCardForm[K]) => void;
}

export const DocumentationSection: React.FC<DocumentationSectionProps> = ({
    form,
    updateField,
}) => {
    const handleFileUpload = (field: 'videoEvidence' | 'vinImage' | 'odoImage' | 'damageImages', files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        updateField(field, {
            files: [...form[field].files, ...newFiles],
            urls: form[field].urls,
        });
    };

    return (
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2A</span>
                Warranty/Insurance Case Details
            </h3>

            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Evidence Upload</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video Evidence */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Evidence</label>
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                accept="video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload('videoEvidence', e.target.files)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 p-2 rounded-lg"><Video className="text-amber-600" size={20} /></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">Upload Video</p>
                                        <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
                                    </div>
                                    {form.videoEvidence.files.length > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {form.videoEvidence.files.length} file(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* VIN Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">VIN Image</label>
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload('vinImage', e.target.files)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 p-2 rounded-lg"><ImageIcon className="text-amber-600" size={20} /></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">Upload VIN Image</p>
                                        <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                                    </div>
                                    {form.vinImage.files.length > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {form.vinImage.files.length} file(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* ODO Meter Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ODO Meter Image</label>
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload('odoImage', e.target.files)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 p-2 rounded-lg"><ImageIcon className="text-amber-600" size={20} /></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">Upload ODO Image</p>
                                        <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                                    </div>
                                    {form.odoImage.files.length > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {form.odoImage.files.length} file(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Damage Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Images of Damaged Parts</label>
                        <label className="block cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload('damageImages', e.target.files)}
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-amber-500 transition bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 p-2 rounded-lg"><ImageIcon className="text-amber-600" size={20} /></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">Upload Damage Images</p>
                                        <p className="text-xs text-gray-500">JPG, PNG, HEIC</p>
                                    </div>
                                    {form.damageImages.files.length > 0 && (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {form.damageImages.files.length} file(s)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-amber-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Case Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                        <textarea
                            value={form.issueDescription}
                            onChange={(e) => updateField('issueDescription', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            rows={3}
                            placeholder="Describe the issue in detail"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Observations</label>
                        <input
                            type="text"
                            value={form.numberOfObservations}
                            onChange={(e) => updateField('numberOfObservations', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Defect Part</label>
                        <input
                            type="text"
                            value={form.defectPart}
                            onChange={(e) => updateField('defectPart', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Symptom</label>
                        <textarea
                            value={form.symptom}
                            onChange={(e) => updateField('symptom', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            rows={3}
                            placeholder="Describe the symptoms observed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
