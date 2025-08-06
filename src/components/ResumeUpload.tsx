import React, { useState, useRef } from 'react';
import type { Resume, UploadProgress } from '../types';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  uploadProgress?: UploadProgress;
  isLoading?: boolean;
  uploadedResume?: Resume;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUpload,
  uploadProgress,
  isLoading = false,
  uploadedResume
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    onUpload(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
        Upload Resume
      </h2>

      {!uploadedResume ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-green-400 bg-green-50 scale-[1.02]'
              : isLoading
              ? 'border-gray-300 bg-gray-50'
              : 'border-green-300 bg-green-50/30 hover:border-green-400 hover:bg-green-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />

          <div className="space-y-6">
            {/* Upload Icon */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                dragActive
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-600'
              }`}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            </div>

            {/* Upload Text */}
            <div>
              <h3 className={`text-xl font-semibold mb-2 transition-colors ${
                dragActive ? 'text-green-700' : 'text-gray-700'
              }`}>
                Upload The Document
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {dragActive 
                  ? 'Drop your file here to upload'
                  : 'Drag and drop your resume here, or click to browse'
                }
              </p>
              <p className="text-xs text-gray-400">
                Supports PDF, DOC, DOCX, and TXT files up to 10MB
              </p>
            </div>

            {/* Browse Button */}
            {!dragActive && (
              <button
                type="button"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-green-300 rounded-xl text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choose File
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadedResume.fileName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedResume.fileSize)} • Uploaded successfully
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Replace
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {uploadProgress.fileName}
            </span>
            <span className="text-sm text-gray-500">
              {uploadProgress.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                uploadProgress.status
              )}`}
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {uploadProgress.status}...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {uploadedResume && (
        <div className="flex justify-end mt-6">
          <button
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating Questions...' : 'Generate Interview Questions'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
