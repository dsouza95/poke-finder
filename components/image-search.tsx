"use client";

import { CVImage, InferenceEngine } from "inferencejs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import FilePicker from "./file-picker";

export default function ImageSearch() {
  const [detector, setDetector] = useState<[InferenceEngine, string] | null>(
    null,
  );
  const [featureExtractorReady, setFeatureExtractorReady] =
    useState<boolean>(false);
  const router = useRouter();
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });

      const engine = new InferenceEngine();
      engine
        .startWorker("pokemon_card", 1, "rf_nbVhhBXmhvSSIMRD3uwoyx7ygxC2")
        .then((workerId) => {
          setDetector([engine, workerId]);
        });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = async (event: MessageEvent) => {
      switch (event.data.status) {
        case "initiate":
          setFeatureExtractorReady(false);
          break;
        case "ready":
          setFeatureExtractorReady(true);
          break;
        case "complete": {
          console.log("complete", event.data.output);
          const response = await fetch("/cards/image-search", {
            method: "POST",
            body: JSON.stringify({ embeddings: event.data.output }),
          });
          const match = await response.json();
          if (match.id) router.push(`/cards/${match.id}`);
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
  }, [router]);

  const extractFeatures = useCallback(
    (file: File) => {
      const imageElement = document.createElement("img");

      const reader = new FileReader();
      reader.onload = (event) => {
        imageElement.onload = async () => {
          const image = new CVImage(imageElement);
          const [engine, workerId] = detector!;
          const { bbox } = (await engine.infer(workerId, image))[0] as any;

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = bbox.width;
          canvas.height = bbox.height;

          context!.drawImage(
            imageElement,
            bbox.x - bbox.width / 2,
            bbox.y - bbox.height / 2,
            bbox.width,
            bbox.height,
            0,
            0,
            bbox.width,
            bbox.height,
          );

          worker.current!.postMessage({ uri: canvas.toDataURL() });
        };
        imageElement.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [detector],
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="mb-2 text-center text-5xl font-bold">Poké-finder.js</h1>
      <h2 className="mb-4 text-center text-xl">
        Upload an image of a Pokémon card to find prices and other details.
      </h2>

      <FilePicker
        disabled={!featureExtractorReady || !detector}
        onChange={(file) => extractFeatures(file)}
      />
    </main>
  );
}
