"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const Dropzone = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
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
          className: "dropzone",
        })}
      >
        <input {...getInputProps()} capture="environment" />

        <p className="px-12 py-24 text-center sm:hidden">
          Click here to take a photo of your Pokémon card.
        </p>

        <p className="hidden px-36 py-12 text-center sm:flex">
          Drag and drop or click here to select an image of your Pokémon card.
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
