import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = 'image/*',
  maxFiles = 4,
  maxSizeMB = 4,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];
    
    const validFiles: File[] = [];
    const files = Array.from(fileList);
    
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      // Check file size (convert maxSizeMB to bytes)
      if (file.size <= maxSizeMB * 1024 * 1024) {
        validFiles.push(file);
      }
    }
    
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
        isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-600 hover:border-gray-500 bg-transparent'
      } ${className}`}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-3 rounded-full bg-gray-700/50 p-4">
          <Upload className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mb-2 text-gray-300 font-medium">
          Drag & drop images here, or click to select images...
        </p>
        <p className="text-sm text-gray-500">
          You can upload {maxFiles} images (up to {maxSizeMB} MB each)
        </p>
      </div>
    </div>
  );
};

export default FileUploader;