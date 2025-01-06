"use client";

import { InferenceEngine, CVImage } from "inferencejs";
import { useEffect, useRef, useState, useMemo } from "react";

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

  useEffect(() => {
    if (!modelLoading) {
      setModelLoading(true);
      inferEngine
        .startWorker(
          "pokemon-cards-63wlp",
          5,
          "rf_nbVhhBXmhvSSIMRD3uwoyx7ygxC2",
        )
        .then((id) => setModelWorkerId(id));
    }
  }, [inferEngine, modelLoading]);

  useEffect(() => {
    console.log("Model Worker ID: " + modelWorkerId);
    if (modelWorkerId) {
      startWebcam();
    }
  }, [modelWorkerId]);

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

  const detectFrame = () => {
    if (!modelWorkerId) setTimeout(detectFrame, 100 / 3);
    if (!videoRef.current || !canvasRef.current || !modelWorkerId) return;

    const img = new CVImage(videoRef.current);
    inferEngine.infer(modelWorkerId, img).then((predictions: unknown) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      for (const prediction of predictions as Prediction[]) {
        console.log(prediction);

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
    <div>
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
    </div>
  );
}

export default App;
