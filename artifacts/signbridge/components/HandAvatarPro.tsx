/**
 * HandAvatarPro — smooth lerp-animated hand avatar.
 *
 * Uses 21 pre-defined MediaPipe-style landmark positions for each gesture.
 * Animates with per-frame linear interpolation (lerp) toward the target pose,
 * giving fluid transitions that look like real hand movement.
 *
 * Works on both web and native using react-native-svg.
 */

import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polygon, Stop } from "react-native-svg";

interface Pt { x: number; y: number; }

/* ─── Landmark data ────────────────────────────────────────────────── */

const OPEN_HAND: Pt[] = [
  { x: 0.50, y: 0.88 }, { x: 0.36, y: 0.74 }, { x: 0.27, y: 0.61 },
  { x: 0.20, y: 0.50 }, { x: 0.14, y: 0.41 }, { x: 0.38, y: 0.60 },
  { x: 0.35, y: 0.43 }, { x: 0.33, y: 0.30 }, { x: 0.31, y: 0.19 },
  { x: 0.49, y: 0.57 }, { x: 0.48, y: 0.38 }, { x: 0.47, y: 0.25 },
  { x: 0.46, y: 0.13 }, { x: 0.59, y: 0.59 }, { x: 0.60, y: 0.41 },
  { x: 0.61, y: 0.28 }, { x: 0.62, y: 0.17 }, { x: 0.68, y: 0.64 },
  { x: 0.71, y: 0.49 }, { x: 0.73, y: 0.38 }, { x: 0.75, y: 0.30 },
];

const FIST: Pt[] = [
  { x: 0.50, y: 0.88 }, { x: 0.36, y: 0.74 }, { x: 0.30, y: 0.63 },
  { x: 0.26, y: 0.54 }, { x: 0.28, y: 0.45 }, { x: 0.40, y: 0.63 },
  { x: 0.42, y: 0.54 }, { x: 0.41, y: 0.47 }, { x: 0.40, y: 0.42 },
  { x: 0.50, y: 0.60 }, { x: 0.52, y: 0.51 }, { x: 0.51, y: 0.44 },
  { x: 0.50, y: 0.39 }, { x: 0.59, y: 0.62 }, { x: 0.61, y: 0.54 },
  { x: 0.60, y: 0.47 }, { x: 0.59, y: 0.42 }, { x: 0.67, y: 0.66 },
  { x: 0.69, y: 0.59 }, { x: 0.68, y: 0.53 }, { x: 0.67, y: 0.49 },
];

/** Mix: use OPEN for the given indices, FIST for the rest. */
function mixPose(openIdx: number[]): Pt[] {
  const set = new Set(openIdx);
  return OPEN_HAND.map((p, i) => (set.has(i) ? p : FIST[i]));
}

const GESTURE_POSES: Record<string, Pt[]> = {
  HELLO: OPEN_HAND,
  YES:   FIST,
  HELP:  mixPose([5, 6, 7, 8]),                                        // index only
  PEACE: mixPose([5, 6, 7, 8, 9, 10, 11, 12]),                         // index+middle
  GOOD:  mixPose([1, 2, 3, 4]),                                        // thumb only
  LOVE:  mixPose([1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20]),            // ILY
  CALL:  mixPose([1, 2, 3, 4, 17, 18, 19, 20]),                         // shaka
  I:     mixPose([17, 18, 19, 20]),                                     // pinky only
  THREE: mixPose([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),          // 3 fingers
  FOUR:  mixPose([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]), // 4 fingers
};

function getPose(gesture: string): Pt[] {
  return GESTURE_POSES[gesture] ?? OPEN_HAND;
}

/* ─── Lerp ────────────────────────────────────────────────────────── */

function lerpPts(a: Pt[], b: Pt[], t: number): Pt[] {
  return a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t }));
}

/* ─── SVG drawing constants ────────────────────────────────────────── */

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const WIDTHS: Record<string, number> = {
  "0-1": 22, "1-2": 18, "2-3": 15, "3-4": 13,
  "0-5": 20, "5-6": 18, "6-7": 15, "7-8": 12,
  "0-9": 22, "9-10": 19, "10-11": 16, "11-12": 13,
  "0-13": 20, "13-14": 17, "14-15": 14, "15-16": 12,
  "0-17": 18, "17-18": 15, "18-19": 12, "19-20": 10,
  "5-9": 8, "9-13": 8, "13-17": 8,
};

const SKIN    = "#f4c2a1";
const SKIN2   = "#e8a47a";
const SKIN3   = "#d4895e";
const NAIL    = "#e8c4d4";
const KNUCKLE = "#e0a882";

/* ─── Component ────────────────────────────────────────────────────── */

interface Props {
  gesture: string;
  size?: number;
  primaryColor?: string;
}

export function HandAvatarPro({ gesture, size = 160, primaryColor = "#60a5fa" }: Props) {
  const W = size;
  const H = size * 1.35;

  const poseRef = useRef<Pt[]>(OPEN_HAND.map((p) => ({ ...p })));
  const targetRef = useRef<Pt[]>(OPEN_HAND);
  const rafRef = useRef<number>(0);
  const [pts, setPts] = useState<Pt[]>(OPEN_HAND);

  useEffect(() => {
    targetRef.current = getPose(gesture);
  }, [gesture]);

  useEffect(() => {
    let running = true;
    function frame() {
      if (!running) return;
      const curr = poseRef.current;
      const tgt = targetRef.current;
      let moved = false;
      const next = curr.map((p, i) => {
        const nx = p.x + (tgt[i].x - p.x) * 0.12;
        const ny = p.y + (tgt[i].y - p.y) * 0.12;
        if (Math.abs(nx - p.x) > 0.0002 || Math.abs(ny - p.y) > 0.0002) moved = true;
        return { x: nx, y: ny };
      });
      poseRef.current = next;
      if (moved) setPts([...next]);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const scaled = pts.map((p) => ({ x: p.x * W, y: p.y * H }));

  // Palm polygon: wrist + lateral knuckles + back to wrist
  const palmPoints = [0, 17, 13, 9, 5, 1]
    .map((i) => `${scaled[i].x},${scaled[i].y}`)
    .join(" ");

  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="skinGrad" x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={SKIN} />
            <Stop offset="1" stopColor={SKIN2} />
          </LinearGradient>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={primaryColor} stopOpacity="0.15" />
            <Stop offset="1" stopColor={primaryColor} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>

        {/* Glow background */}
        <Circle cx={W * 0.45} cy={H * 0.5} r={W * 0.44} fill="url(#glowGrad)" />

        {/* Palm fill */}
        <Polygon points={palmPoints} fill="url(#skinGrad)" />

        {/* Finger segments (skin-colored thick strokes) */}
        {CONNECTIONS.map(([a, b], i) => {
          const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
          const w = WIDTHS[key] ?? 10;
          return (
            <Line
              key={i}
              x1={scaled[a].x} y1={scaled[a].y}
              x2={scaled[b].x} y2={scaled[b].y}
              stroke={a < 5 ? SKIN2 : SKIN}
              strokeWidth={w}
              strokeLinecap="round"
            />
          );
        })}

        {/* Knuckle joints */}
        {[5, 6, 9, 10, 13, 14, 17, 18, 1, 2].map((i) => (
          <Circle key={`j${i}`} cx={scaled[i].x} cy={scaled[i].y} r={5} fill={KNUCKLE} />
        ))}

        {/* Fingertip caps */}
        {[4, 8, 12, 16, 20].map((i) => (
          <React.Fragment key={`tip${i}`}>
            <Circle cx={scaled[i].x} cy={scaled[i].y} r={7} fill={SKIN2} />
            <Circle cx={scaled[i].x} cy={scaled[i].y} r={4} fill={NAIL} />
          </React.Fragment>
        ))}

        {/* Wrist circle */}
        <Circle cx={scaled[0].x} cy={scaled[0].y} r={10} fill={SKIN2} />
      </Svg>
    </View>
  );
}
