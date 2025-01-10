"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FilePicker from "./file-picker";

export default function ImageSearch() {
  // Keep track of the feature extraction result and the model loading status.
  const [result, setResult] = useState<unknown>(null);
  const [ready, setReady] = useState<boolean | null>(null);

  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = async (event: MessageEvent) => {
      switch (event.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "complete": {
          const response = await fetch("/cards/image-search", {
            method: "POST",
            body: JSON.stringify({ embeddings: event.data.output }),
          });
          const match = await response.json();
          console.log("match", match);
          setResult(event.data.output);
          break;
        }
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener("message", onMessageReceived);

    worker.current.postMessage({ status: "initiate" });

    // Define a cleanup function for when the component is unmounted.
    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  }, []);

  const extractFeatures = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (worker.current) {
        worker.current.postMessage({ file: event.target?.result });
      }
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="mb-2 text-center text-5xl font-bold">Transformers.js</h1>
      <h2 className="mb-4 text-center text-2xl">
        Next.js template (client-side)
      </h2>

      <FilePicker
        disabled={!ready}
        onChange={(file) => extractFeatures(file)}
      />

      {ready !== null && (
        <pre className="rounded bg-gray-100 p-2">
          {!ready || !result ? "Loading..." : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
