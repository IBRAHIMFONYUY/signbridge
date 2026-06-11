/**
 * Web-only real-time hand detection using MediaPipe Hands (CDN).
 * Renders <video> + <canvas> overlay directly as DOM elements.
 * Expo Web treats .web.tsx files as the platform-specific override.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { classifyGesture, GestureSmoother, type Landmark } from "@/utils/gestureClassifier";

/* ─── MediaPipe CDN loader ─────────────────────────────────────────── */
const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915";
let mpLoadPromise: Promise<void> | null = null;

function loadMediaPipe(): Promise<void> {
  if (mpLoadPromise) return mpLoadPromise;
  mpLoadPromise = new Promise((resolve, reject) => {
    if ((window as any).Hands) { resolve(); return; }
    const s = document.createElement("script");
    s.src = `${CDN}/hands.js`;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load MediaPipe CDN"));
    document.head.appendChild(s);
  });
  return mpLoadPromise;
}

/* ─── Drawing constants ────────────────────────────────────────────── */
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];
const TIP_IDX = new Set([4, 8, 12, 16, 20]);

function drawHand(
  ctx: CanvasRenderingContext2D,
  lm: Landmark[],
  W: number,
  H: number,
  primary: string,
  accent: string
) {
  ctx.clearRect(0, 0, W, H);

  // Connections
  ctx.strokeStyle = primary + "99";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath();
    // Flip X because video is mirrored
    ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H);
    ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H);
    ctx.stroke();
  }

  // Dots
  for (let i = 0; i < 21; i++) {
    const x = (1 - lm[i].x) * W;
    const y = lm[i].y * H;
    const isTip = TIP_IDX.has(i);
    const isWrist = i === 0;

    if (isTip) {
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = accent + "28";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, isWrist ? 6 : isTip ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = isTip ? accent : primary;
    ctx.fill();
  }
}

/* ─── Props ────────────────────────────────────────────────────────── */
export interface CameraDetectorProps {
  active: boolean;
  facing: "user" | "environment";
  width: number;
  height: number;
  primaryColor: string;
  accentColor: string;
  onLandmarks?: (lm: Landmark[] | null) => void;
  onGesture?: (gesture: string, confidence: number, confirmed: boolean) => void;
  onFps?: (fps: number) => void;
  onError?: (msg: string) => void;
  onReady?: () => void;
}

/* ─── Component ────────────────────────────────────────────────────── */
export function CameraDetector({
  active, facing, width, height,
  primaryColor, accentColor,
  onLandmarks, onGesture, onFps, onError, onReady,
}: CameraDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const running = useRef(false);
  const fpsRef = useRef({ count: 0, last: performance.now() });
  const smootherRef = useRef(new GestureSmoother());
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const setErr = useCallback((msg: string) => {
    setStatus("error");
    setErrorMsg(msg);
    onError?.(msg);
  }, [onError]);

  const processFrame = useCallback(async () => {
    if (!running.current || !handsRef.current || !videoRef.current) return;
    if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      try { await handsRef.current.send({ image: videoRef.current }); } catch { /* skip frame */ }
    }
    rafRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    if (!active) {
      running.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, width, height);
      smootherRef.current.reset();
      setStatus("idle");
      return;
    }

    running.current = true;
    setStatus("loading");
    let handsInstance: any = null;

    (async () => {
      /* 1 ─ Camera */
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: facing },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((res) => {
            videoRef.current!.onloadedmetadata = () => res();
          });
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        const isDenied = e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError";
        if (isDenied) {
          setErr("Camera access blocked.\n\nOpen this app in a new browser tab (not an iframe) and allow camera permissions.");
        } else {
          setErr("No camera found. Check that your camera is connected and not in use by another app.");
        }
        return;
      }

      /* 2 ─ MediaPipe Hands */
      try {
        await loadMediaPipe();
        const HandsClass = (window as any).Hands;
        if (!HandsClass) throw new Error("MediaPipe not loaded");

        handsInstance = new HandsClass({
          locateFile: (file: string) => `${CDN}/${file}`,
        });
        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.5,
        });

        handsInstance.onResults((results: any) => {
          /* FPS counter */
          fpsRef.current.count++;
          const now = performance.now();
          if (now - fpsRef.current.last >= 1000) {
            onFps?.(fpsRef.current.count);
            fpsRef.current = { count: 0, last: now };
          }

          const ctx = canvasRef.current?.getContext("2d");
          const lm: Landmark[] | undefined = results.multiHandLandmarks?.[0];

          if (lm && lm.length === 21) {
            onLandmarks?.(lm);
            if (ctx) drawHand(ctx, lm, width, height, primaryColor, accentColor);

            const frame = classifyGesture(lm);
            const smoothed = smootherRef.current.push(frame.gesture, frame.confidence);
            onGesture?.(smoothed.gesture, smoothed.confidence, smoothed.confirmed);
          } else {
            onLandmarks?.(null);
            if (ctx) ctx.clearRect(0, 0, width, height);
            smootherRef.current.reset();
            onGesture?.("", 0, false);
          }
        });

        await handsInstance.initialize();
        handsRef.current = handsInstance;
        setStatus("ready");
        onReady?.();
        processFrame();
      } catch (e) {
        setErr("Failed to load MediaPipe model. Check your internet connection and try again.");
      }
    })();

    return () => {
      running.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      handsInstance?.close();
      handsRef.current = null;
    };
  }, [active, facing]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#050e1f",
        flexShrink: 0,
      }}
    >
      {/* Live camera feed */}
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)", // mirror for selfie view
        }}
        muted
        playsInline
        autoPlay
      />

      {/* Landmark overlay canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Loading overlay */}
      {status === "loading" && (
        <div style={overlayStyle}>
          <div style={spinnerStyle(primaryColor)} />
          <p style={{ color: "#fff", fontFamily: "sans-serif", fontSize: 13, marginTop: 12, textAlign: "center" }}>
            Loading MediaPipe Hands model…
          </p>
        </div>
      )}

      {/* Error overlay */}
      {status === "error" && (
        <div style={{ ...overlayStyle, padding: "20px 24px" }}>
          <div style={{ fontSize: 28 }}>📷</div>
          <p style={{ color: "#f87171", fontFamily: "sans-serif", fontSize: 12, textAlign: "center", lineHeight: 1.5, whiteSpace: "pre-line", marginTop: 8 }}>
            {errorMsg}
          </p>
          <a
            href={window.location.href}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 10,
              padding: "8px 16px",
              borderRadius: 10,
              backgroundColor: primaryColor,
              color: "#fff",
              fontFamily: "sans-serif",
              fontSize: 12,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Open in new tab →
          </a>
        </div>
      )}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(5, 14, 31, 0.92)",
};

function spinnerStyle(color: string): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    border: `3px solid ${color}33`,
    borderTop: `3px solid ${color}`,
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  };
}

/* Inject keyframes once */
if (typeof document !== "undefined" && !document.getElementById("signbridge-spin")) {
  const style = document.createElement("style");
  style.id = "signbridge-spin";
  style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}
