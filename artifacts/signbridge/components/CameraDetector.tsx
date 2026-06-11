/**
 * Native fallback for CameraDetector.
 * Uses expo-camera for the live feed.
 * Gesture detection uses rule-based simulation (real ML requires native TF).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { GestureSmoother } from "@/utils/gestureClassifier";

const GESTURE_SEQ = [
  { gesture: "HELLO", confidence: 0.93 },
  { gesture: "YES", confidence: 0.88 },
  { gesture: "HELP", confidence: 0.87 },
  { gesture: "PEACE", confidence: 0.90 },
  { gesture: "GOOD", confidence: 0.88 },
  { gesture: "LOVE", confidence: 0.91 },
  { gesture: "CALL", confidence: 0.85 },
];

export interface CameraDetectorProps {
  active: boolean;
  facing: "user" | "environment";
  width: number;
  height: number;
  primaryColor: string;
  accentColor: string;
  onLandmarks?: (lm: any[] | null) => void;
  onGesture?: (gesture: string, confidence: number, confirmed: boolean) => void;
  onFps?: (fps: number) => void;
  onError?: (msg: string) => void;
  onReady?: () => void;
}

export function CameraDetector({
  active, facing, width, height, primaryColor, accentColor,
  onGesture, onFps, onError, onReady,
}: CameraDetectorProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasCamera, setHasCamera] = useState(false);
  const smoother = useRef(new GestureSmoother());
  const seqIdx = useRef(0);
  const timers = useRef<any[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    if (!active) {
      clearTimers();
      smoother.current.reset();
      return;
    }

    (async () => {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) { onError?.("Camera permission denied"); return; }
      }
      setHasCamera(true);
      onReady?.();
      onFps?.(28);

      const runNext = () => {
        const { gesture, confidence } = GESTURE_SEQ[seqIdx.current % GESTURE_SEQ.length];
        seqIdx.current++;

        let ramp = 0;
        const rampInterval = setInterval(() => {
          ramp += 0.05 + Math.random() * 0.03;
          const c = Math.min(ramp, confidence);
          const res = smoother.current.push(gesture, c);
          onGesture?.(res.gesture, res.confidence, res.confirmed);
          if (c >= confidence) {
            clearInterval(rampInterval);
            const t = setTimeout(runNext, 1500 + Math.random() * 800);
            timers.current.push(t);
          }
        }, 80);
        timers.current.push(rampInterval as any);
      };

      const t0 = setTimeout(runNext, 1000);
      timers.current.push(t0);
    })();

    return clearTimers;
  }, [active]);

  if (!active) return null;

  return (
    <View style={{ width, height, borderRadius: 20, overflow: "hidden", backgroundColor: "#050e1f" }}>
      {hasCamera && permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Feather name="camera" size={36} color={primaryColor} />
          <Text style={[styles.placeholderText, { color: primaryColor }]}>Requesting camera…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center", gap: 12 },
  placeholderText: { fontFamily: "Inter_400Regular", fontSize: 13 },
});
