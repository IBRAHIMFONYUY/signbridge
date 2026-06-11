import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Circle, G, Line } from "react-native-svg";

/* ------------------------------------------------------------------ */
/* Landmark definitions (normalized 0-1 within the camera frame)       */
/* ------------------------------------------------------------------ */

type Point = { x: number; y: number };

const OPEN_HAND: Point[] = [
  { x: 0.50, y: 0.88 }, // 0 wrist
  { x: 0.36, y: 0.74 }, // 1 thumb cmc
  { x: 0.27, y: 0.61 }, // 2 thumb mcp
  { x: 0.20, y: 0.50 }, // 3 thumb ip
  { x: 0.14, y: 0.41 }, // 4 thumb tip
  { x: 0.38, y: 0.60 }, // 5 index mcp
  { x: 0.35, y: 0.43 }, // 6 index pip
  { x: 0.33, y: 0.30 }, // 7 index dip
  { x: 0.31, y: 0.19 }, // 8 index tip
  { x: 0.49, y: 0.57 }, // 9 middle mcp
  { x: 0.48, y: 0.38 }, // 10 middle pip
  { x: 0.47, y: 0.25 }, // 11 middle dip
  { x: 0.46, y: 0.13 }, // 12 middle tip
  { x: 0.59, y: 0.59 }, // 13 ring mcp
  { x: 0.60, y: 0.41 }, // 14 ring pip
  { x: 0.61, y: 0.28 }, // 15 ring dip
  { x: 0.62, y: 0.17 }, // 16 ring tip
  { x: 0.68, y: 0.64 }, // 17 pinky mcp
  { x: 0.71, y: 0.49 }, // 18 pinky pip
  { x: 0.73, y: 0.38 }, // 19 pinky dip
  { x: 0.75, y: 0.30 }, // 20 pinky tip
];

const FIST: Point[] = [
  { x: 0.50, y: 0.88 },
  { x: 0.36, y: 0.74 },
  { x: 0.30, y: 0.63 },
  { x: 0.26, y: 0.54 },
  { x: 0.28, y: 0.45 },
  { x: 0.40, y: 0.63 },
  { x: 0.42, y: 0.54 },
  { x: 0.41, y: 0.47 },
  { x: 0.40, y: 0.42 },
  { x: 0.50, y: 0.60 },
  { x: 0.52, y: 0.51 },
  { x: 0.51, y: 0.44 },
  { x: 0.50, y: 0.39 },
  { x: 0.59, y: 0.62 },
  { x: 0.61, y: 0.54 },
  { x: 0.60, y: 0.47 },
  { x: 0.59, y: 0.42 },
  { x: 0.67, y: 0.66 },
  { x: 0.69, y: 0.59 },
  { x: 0.68, y: 0.53 },
  { x: 0.67, y: 0.49 },
];

const POINT_UP: Point[] = [
  { x: 0.50, y: 0.88 },
  { x: 0.36, y: 0.74 },
  { x: 0.29, y: 0.65 },
  { x: 0.25, y: 0.57 },
  { x: 0.27, y: 0.49 },
  { x: 0.40, y: 0.63 },
  { x: 0.37, y: 0.44 },
  { x: 0.35, y: 0.30 },
  { x: 0.33, y: 0.19 },
  { x: 0.50, y: 0.60 },
  { x: 0.52, y: 0.52 },
  { x: 0.51, y: 0.45 },
  { x: 0.50, y: 0.40 },
  { x: 0.60, y: 0.62 },
  { x: 0.62, y: 0.54 },
  { x: 0.61, y: 0.47 },
  { x: 0.60, y: 0.42 },
  { x: 0.68, y: 0.66 },
  { x: 0.70, y: 0.59 },
  { x: 0.69, y: 0.53 },
  { x: 0.68, y: 0.49 },
];

const TWO_FINGERS: Point[] = [
  { x: 0.50, y: 0.88 },
  { x: 0.36, y: 0.74 },
  { x: 0.29, y: 0.65 },
  { x: 0.25, y: 0.57 },
  { x: 0.27, y: 0.49 },
  { x: 0.38, y: 0.62 },
  { x: 0.35, y: 0.43 },
  { x: 0.33, y: 0.30 },
  { x: 0.31, y: 0.19 },
  { x: 0.49, y: 0.58 },
  { x: 0.48, y: 0.39 },
  { x: 0.47, y: 0.26 },
  { x: 0.46, y: 0.15 },
  { x: 0.59, y: 0.62 },
  { x: 0.61, y: 0.54 },
  { x: 0.60, y: 0.47 },
  { x: 0.59, y: 0.42 },
  { x: 0.68, y: 0.66 },
  { x: 0.70, y: 0.59 },
  { x: 0.69, y: 0.53 },
  { x: 0.68, y: 0.49 },
];

const GESTURE_POSES: Record<string, Point[]> = {
  HELLO: OPEN_HAND,
  HELP: POINT_UP,
  THANK: { ...OPEN_HAND, 8: { x: 0.40, y: 0.55 } } as unknown as Point[],
  YES: FIST,
  NO: TWO_FINGERS,
  PLEASE: OPEN_HAND,
  SORRY: FIST,
  GOOD: OPEN_HAND,
  BAD: FIST,
  LOVE: POINT_UP,
  HOW: OPEN_HAND,
  ARE: TWO_FINGERS,
  YOU: POINT_UP,
};

function getPose(word: string): Point[] {
  return GESTURE_POSES[word] ?? OPEN_HAND;
}

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const TIP_INDICES = [4, 8, 12, 16, 20];

/* ------------------------------------------------------------------ */

interface Props {
  word: string;
  width: number;
  height: number;
  active: boolean;
  primaryColor: string;
  accentColor: string;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function HandLandmarkOverlay({ word, width, height, active, primaryColor, accentColor }: Props) {
  const progressRef = useRef(new Animated.Value(0));
  const jitterAnims = useRef(
    Array.from({ length: 21 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
    }))
  ).current;

  const currentPoseRef = useRef<Point[]>(OPEN_HAND);
  const targetPoseRef = useRef<Point[]>(OPEN_HAND);
  const progressVal = useRef(0);

  useEffect(() => {
    if (!active) return;
    const jitterLoops = jitterAnims.map((anim, i) => {
      const delay = i * 30;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim.x, { toValue: (Math.random() - 0.5) * 3, duration: 400 + i * 20, useNativeDriver: false }),
          Animated.timing(anim.x, { toValue: (Math.random() - 0.5) * 2, duration: 400 + i * 20, useNativeDriver: false }),
        ])
      );
      const loopY = Animated.loop(
        Animated.sequence([
          Animated.delay(delay + 200),
          Animated.timing(anim.y, { toValue: (Math.random() - 0.5) * 3, duration: 500 + i * 15, useNativeDriver: false }),
          Animated.timing(anim.y, { toValue: (Math.random() - 0.5) * 2, duration: 500 + i * 15, useNativeDriver: false }),
        ])
      );
      loop.start();
      loopY.start();
      return { loop, loopY };
    });
    return () => jitterLoops.forEach(({ loop, loopY }) => { loop.stop(); loopY.stop(); });
  }, [active]);

  useEffect(() => {
    if (!active || !word) return;
    targetPoseRef.current = getPose(word);
    Animated.timing(progressRef.current, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start(() => {
      currentPoseRef.current = targetPoseRef.current;
      progressRef.current.setValue(0);
    });
  }, [word, active]);

  if (!active) return null;

  const from = currentPoseRef.current;
  const to = targetPoseRef.current;
  const t = 0.5;

  const pts = from.map((f, i) => ({
    x: lerp(f.x, to[i].x, t) * width,
    y: lerp(f.y, to[i].y, t) * height,
  }));

  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      {/* Connections */}
      {CONNECTIONS.map(([a, b], i) => (
        <Line
          key={i}
          x1={pts[a].x}
          y1={pts[a].y}
          x2={pts[b].x}
          y2={pts[b].y}
          stroke={primaryColor}
          strokeWidth={1.8}
          strokeOpacity={0.65}
        />
      ))}
      {/* Landmark dots */}
      {pts.map((pt, i) => {
        const isTip = TIP_INDICES.includes(i);
        const isWrist = i === 0;
        return (
          <G key={i}>
            {isTip && (
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={10}
                fill={accentColor}
                fillOpacity={0.15}
              />
            )}
            <Circle
              cx={pt.x}
              cy={pt.y}
              r={isWrist ? 5 : isTip ? 4.5 : 3}
              fill={isTip ? accentColor : primaryColor}
              fillOpacity={0.9}
            />
          </G>
        );
      })}
    </Svg>
  );
}
