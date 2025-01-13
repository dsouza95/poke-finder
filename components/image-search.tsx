"use client";

import { CVImage, InferenceEngine } from "inferencejs";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SquareLoader from "react-spinners/SquareLoader";
import Dropzone from "./dropzone";

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageSearch() {
  const [detector, setDetector] = useState<[InferenceEngine, string] | null>(
    null,
  );
  const [featureExtractorReady, setFeatureExtractorReady] =
    useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const ready = useMemo(
    () => featureExtractorReady && detector,
    [featureExtractorReady, detector],
  );
  const router = useRouter();
  const { theme } = useTheme();
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!worker.current) {
      // Create the worker and detector if they do not yet exist.
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });

      const detectorEngine = new InferenceEngine();
      detectorEngine
        .startWorker("pokemon_card", 1, "rf_nbVhhBXmhvSSIMRD3uwoyx7ygxC2")
        .then((workerId) => {
          setDetector([detectorEngine, workerId]);
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
          setLoadingResults(true);
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

  const fileToImageElement = async (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageElement = document.createElement("img");
        imageElement.onload = () => resolve(imageElement);
        imageElement.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const canvasFromBBox = (imageElement: HTMLImageElement, bbox: BBox) => {
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

    return canvas;
  };

  const extractFeatures = useCallback(
    async (file: File) => {
      const imageElement = await fileToImageElement(file);

      // Before getting the features, we need to crop the image to the card
      const image = new CVImage(imageElement);
      const [engine, workerId] = detector!;

      // Dirty little hack since the inferencejs types are not correct
      const { bbox } = (await engine.infer(workerId, image))[0] as unknown as {
        bbox: BBox;
      };

      // Get the cropped card canvas
      const croppedCardCanvas = canvasFromBBox(imageElement, bbox);

      // Send the cropped card canvas to the worker for feature extraction
      worker.current!.postMessage({ uri: croppedCardCanvas.toDataURL() });
    },
    [detector],
  );

  const getLoadingComponent = (text: string) => {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <SquareLoader size={48} color={theme === "dark" ? "#fff" : "#000"} />
        <p className="mt-4 text-lg font-medium">{text}</p>
      </div>
    );
  };

  const getComponent = () => {
    if (!mounted) return null;
    if (!ready) return getLoadingComponent("Loading AI models...");
    if (loadingResults) return getLoadingComponent("Catching Pokémon...");

    return <Dropzone onDrop={(files) => extractFeatures(files[0])} />;
  };

  return getComponent();
}
