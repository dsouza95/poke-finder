"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Camera() {
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (mediaStream) {
        const video = document.getElementById("video") as HTMLVideoElement;
        if (!video) return;

        video.srcObject = mediaStream;
        video.play();
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-5">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Please allow camera access and refresh the page to scan your card.
          </AlertDescription>
        </Alert>
      ) : (
        <video
          width="800"
          height="450"
          id="video"
          className="rounded-md shadow shadow-md shadow-indigo-500/40"
        ></video>
      )}
    </div>
  );
}
