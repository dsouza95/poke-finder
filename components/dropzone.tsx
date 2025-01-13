"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const Dropzone = ({
  disabled,
  onDrop,
}: {
  disabled: boolean;
  onDrop: (files: File[]) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDropRejected = () => {
    toast.error("Image file type not supported!");
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".tiff",
        ".tif",
        ".webp",
      ],
    },
    disabled: disabled,
    maxFiles: 1,
    multiple: false,
    onDrop: () => setIsDragging(false),
    onDropAccepted: onDrop,
    onDropRejected,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      className={`rounded-md border-2 border-dashed ${
        isDragging ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <div
        {...getRootProps({
          className: `dropzone ${disabled ? "opacity-50 bg-gray-200" : ""}`,
        })}
      >
        <input {...getInputProps()} />
        <p className="px-12 py-24 text-center sm:px-36 sm:py-12">
          Drag and drop or click to select an image.
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
