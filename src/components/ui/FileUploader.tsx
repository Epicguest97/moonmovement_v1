import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  fileType?: 'image' | 'video' | 'any';
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = 'image/*',
  maxFiles = 1,
  maxSizeMB = 10, // Increased for videos
  className = '',
  fileType = 'image',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
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

  // Compress image to reduce file size (keep this for images)
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const validateAndProcessFiles = async (fileList: FileList | null): Promise<File[]> => {
    if (!fileList) return [];
    
    setIsCompressing(fileType === 'image');
    const validFiles: File[] = [];
    const files = Array.from(fileList);
    
    try {
      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const file = files[i];
        
        // Check file type
        if (fileType === 'image' && !file.type.startsWith('image/')) {
          console.warn(`File ${file.name} is not an image`);
          continue;
        }
        
        if (fileType === 'video' && !file.type.startsWith('video/')) {
          console.warn(`File ${file.name} is not a video`);
          continue;
        }
        
        let processedFile = file;
        
        // Only compress images, not videos
        if (fileType === 'image' && file.size > maxSizeMB * 1024 * 1024) {
          try {
            processedFile = await compressImage(file);
            console.log(`Compressed ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
          } catch (error) {
            console.error('Error compressing image:', error);
            continue;
          }
        }
        
        // Final size check
        if (processedFile.size <= maxSizeMB * 1024 * 1024) {
          validFiles.push(processedFile);
        } else {
          console.warn(`File ${file.name} is too large (${(processedFile.size / 1024 / 1024).toFixed(2)}MB). Max size is ${maxSizeMB}MB.`);
        }
      }
    } finally {
      setIsCompressing(false);
    }
    
    return validFiles;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const validFiles = await validateAndProcessFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = await validateAndProcessFiles(e.target.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
        isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-600 hover:border-gray-500 bg-transparent'
      } ${className}`}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={fileType === 'image' ? 'image/*' : fileType === 'video' ? 'video/*' : 'image/*,video/*'}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {isCompressing ? (
          <>
            <div className="mb-3 rounded-full bg-primary/20 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
            <p className="mb-2 text-gray-300 font-medium">
              Processing...
            </p>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-full bg-gray-700/50 p-4">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mb-2 text-gray-300 font-medium">
              {fileType === 'video' 
                ? "Drag & drop video here, or click to select..."
                : "Drag & drop images here, or click to select..."}
            </p>
            <p className="text-sm text-gray-500">
              {fileType === 'video' 
                ? `You can upload 1 video (up to ${maxSizeMB} MB)`
                : `You can upload ${maxFiles} images (up to ${maxSizeMB} MB each)`}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
