/* eslint-disable @typescript-eslint/no-explicit-any */
import {SetStateAction, useEffect, useRef} from "react";
import WebCam, {WebcamHandle} from "./WebCam";
import {X} from "lucide-react";

import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

export function AR({
  image,
  onClose,
}: {
  image: string | File | undefined;
  onClose: React.Dispatch<SetStateAction<boolean>>;
}) {
  const webcamRef = useRef<WebcamHandle | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let poseLandmarker: PoseLandmarker | null = null;
    let animationFrameId = 0;
    let isMounted = true;

    const shirtImg = new Image();
    shirtImg.src = image!.toString();

    const setup = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      const predict = async () => {
        if (!isMounted || !poseLandmarker) return;

        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!video || !canvas || !ctx || video.readyState < 2) {
          animationFrameId = requestAnimationFrame(predict);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        poseLandmarker.detectForVideo(
          video,
          performance.now(),
          (result: {landmarks: any}) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const landmark of result.landmarks) {
              const ls = landmark[11];
              const rs = landmark[12];
              const lh = landmark[23];
              const rh = landmark[24];

              if (!ls || !rs || !lh || !rh) continue;

              const toPixel = (p: any) => ({
                x: p.x * canvas.width,
                y: p.y * canvas.height,
              });

              const leftS = toPixel(ls);
              const rightS = toPixel(rs);
              const leftH = toPixel(lh);
              const rightH = toPixel(rh);

              const chestY = (leftS.y + rightS.y) / 2;
              const hipY = (leftH.y + rightH.y) / 2;

              const centerX = (leftS.x + rightS.x) / 2;
              const centerY = (chestY + hipY) / 2;

              const shoulderWidth = Math.hypot(
                rightS.x - leftS.x,
                rightS.y - leftS.y,
              );

              const torsoHeight =
                (Math.hypot(leftH.y - leftS.y, leftH.x - leftS.x) +
                  Math.hypot(rightH.y - rightS.y, rightH.x - rightS.x)) /
                2;

              const width = shoulderWidth * 3.8;
const height = torsoHeight * 2.8;
              let angle = Math.atan2(rightS.y - leftS.y, rightS.x - leftS.x);
              if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
                angle += Math.PI;
              }

              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.rotate(angle);
              ctx.drawImage(
                shirtImg,
                -width / 2,
                -height * 0.50,
                width,
                height,
              );
              ctx.restore();
            }
          },
        );

        animationFrameId = requestAnimationFrame(predict);
      };

      predict();
    };

    setup();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      poseLandmarker?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={() => onClose((prev) => !prev)}
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <X className="size-5" />
      </button>

      <WebCam ref={webcamRef} />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
      />
    </div>
  );
}
