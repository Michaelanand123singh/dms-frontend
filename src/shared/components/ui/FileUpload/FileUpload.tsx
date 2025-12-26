import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

interface FileUploadProps {
    entityId: string;
    entityType: 'appointment' | 'job_card' | 'vehicle' | 'customer';
    category: string;
    label?: string;
    accept?: string;
    multiple?: boolean;
    onSuccess?: (file: any) => void;
    onError?: (error: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    entityId,
    entityType,
    category,
    label = 'Upload Files',
    accept = 'image/*,application/pdf',
    multiple = false,
    onSuccess,
    onError
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files: FileList) => {
        setIsUploading(true);

        // Process each file
        for (let i = 0; i < files.length; i++) {
            await uploadFile(files[i]);
        }

        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedEntityId', entityId);
        formData.append('relatedEntityType', entityType);
        formData.append('category', category);
        // Add uploadedBy if available in context (omitted for now)

        try {
            // Get token from storage
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FILES_UPLOAD}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            if (onSuccess) onSuccess(data);
        } catch (error) {
            console.error('Upload error:', error);
            if (onError) onError(error);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center text-primary">
                        <Loader className="w-10 h-10 animate-spin mb-2" />
                        <p className="text-sm font-medium">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 text-center mb-1">
                            {label}
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                            Drag & drop or click to browse
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
