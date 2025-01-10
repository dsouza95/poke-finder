"use client";

import { ChangeEvent } from "react";

export default function FilePicker({
  disabled,
  onChange,
}: {
  readonly disabled: boolean;
  readonly onChange: (file: File) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={handleChange}
      />
    </div>
  );
}
