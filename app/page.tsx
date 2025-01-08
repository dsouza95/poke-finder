"use client";

import * as tf from "@tensorflow/tfjs";
import Frame from "canvas-to-buffer";
import { CVImage, InferenceEngine } from "inferencejs";
import { useEffect, useMemo, useRef, useState } from "react";

let snapshot: CVImage | null = null;
let checkingMatch = false;

type Prediction = {
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: string;
  color: string;
};

function App() {
  const inferEngine = useMemo(() => {
    return new InferenceEngine();
  }, []);
  const [modelWorkerId, setModelWorkerId] = useState("");
  const [modelLoading, setModelLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker("pokemon_card", 1, "rf_nbVhhBXmhvSSIMRD3uwoyx7ygxC2")
        .then((id) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading]);

  useEffect(() => {
    if (modelWorkerId) {
      startWebcam();
    }
  }, [modelWorkerId]);

  const findMatch = async (imageBuffer: Buffer, mimeType: string) => {
    const formData = new FormData();
    formData.append(
      "image",
      new Blob([imageBuffer], { type: mimeType }),
      "image.webp",
    );

    const response = await fetch("/cards/image-search", {
      method: "POST",
      body: formData,
    });
    const match = await response.json();
    console.log("match", match);
  };

  const startWebcam = () => {
    const constraints = {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "environment",
      },
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = function () {
        if (!videoRef.current) return;

        videoRef.current.play();
      };

      videoRef.current.onplay = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!videoRef.current || !canvasRef.current || !ctx) return;

        const height = videoRef.current.videoHeight;
        const width = videoRef.current.videoWidth;

        videoRef.current.width = width;
        videoRef.current.height = height;

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        ctx.scale(1, 1);

        detectFrame();
      };
    });
  };

  const detectFrame = async () => {
    if (!modelWorkerId) setTimeout(detectFrame, 100 / 3);
    if (!videoRef.current || !canvasRef.current || !modelWorkerId) return;

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img).then(async (predictions: unknown) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      for (const prediction of predictions as Prediction[]) {
        if (!checkingMatch && prediction.confidence > 0.9) {
          snapshot = new CVImage(videoRef.current!);
          checkingMatch = true;
          await tf.browser.toPixels(snapshot.tensor(), canvasRef2.current!);

          const frame = new Frame(canvasRef2.current!);
          const buffer = frame.toBuffer();
          const mimeType = frame.getMimeType();

          await findMatch(buffer!, mimeType!);
          checkingMatch = false;
        }

        // draw detections
        ctx.strokeStyle = prediction.color;

        const x = prediction.bbox.x - prediction.bbox.width / 2;
        const y = prediction.bbox.y - prediction.bbox.height / 2;
        const width = prediction.bbox.width;
        const height = prediction.bbox.height;

        ctx.rect(x, y, width, height);
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fill();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        const text = ctx.measureText(
          prediction.class +
            " " +
            Math.round(prediction.confidence * 100) +
            "%",
        );
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(x - 2, y - 30, text.width + 4, 30);
        ctx.font = "15px monospace";
        ctx.fillStyle = "black";
        ctx.fillText(
          prediction.class +
            " " +
            Math.round(prediction.confidence * 100) +
            "%",
          x,
          y - 10,
        );
      }

      setTimeout(detectFrame, 100 / 3);
    });
  };
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div style={{ position: "relative" }}>
        <video
          id="video"
          width="640"
          height="480"
          ref={videoRef}
          style={{ position: "relative" }}
        />
        <canvas
          id="canvas"
          width="640"
          height="480"
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
      <canvas
        id="canvas2"
        width="640"
        height="480"
        ref={canvasRef2}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}

export default App;
