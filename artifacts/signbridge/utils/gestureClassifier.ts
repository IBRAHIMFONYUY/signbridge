/**
 * Real gesture classifier using MediaPipe Hands 21-landmark output.
 *
 * Landmark indices (MediaPipe standard):
 *  0: WRIST
 *  1-4:  THUMB  (CMC → TIP)
 *  5-8:  INDEX  (MCP → TIP)
 *  9-12: MIDDLE (MCP → TIP)
 * 13-16: RING   (MCP → TIP)
 * 17-20: PINKY  (MCP → TIP)
 */

export interface Landmark {
  x: number; // 0–1, normalized to image width
  y: number; // 0–1, normalized to image height (↓ is +)
  z: number; // depth relative to wrist
}

export interface GestureResult {
  gesture: string;
  confidence: number;
  fingerStates: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

/** True when a finger's tip is above its PIP joint (finger is extended). */
function isExtended(lm: Landmark[], tipIdx: number, pipIdx: number): boolean {
  return lm[tipIdx].y < lm[pipIdx].y;
}

/**
 * Thumb: compare TIP x vs IP x.
 * Works for both hands since we just check distance from wrist.
 */
function isThumbExtended(lm: Landmark[]): boolean {
  const tipX = lm[4].x;
  const mcpX = lm[2].x;
  return Math.abs(tipX - mcpX) > 0.06;
}

/** Curl score 0–1 for a finger (0 = fully open, 1 = fully curled). */
function fingerCurl(lm: Landmark[], tipIdx: number, mcpIdx: number): number {
  const dy = lm[tipIdx].y - lm[mcpIdx].y; // positive = tip below mcp = curled
  return Math.max(0, Math.min(1, dy * 5 + 0.5));
}

/** Single-frame classification. */
export function classifyGesture(lm: Landmark[]): GestureResult {
  if (!lm || lm.length < 21) {
    return { gesture: "", confidence: 0, fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false } };
  }

  const thumb  = isThumbExtended(lm);
  const index  = isExtended(lm, 8, 6);
  const middle = isExtended(lm, 12, 10);
  const ring   = isExtended(lm, 16, 14);
  const pinky  = isExtended(lm, 20, 18);
  const fingerStates = { thumb, index, middle, ring, pinky };

  // ── Rules ordered by specificity ──────────────────────────────────
  // All 5 extended → open hand / HELLO
  if (thumb && index && middle && ring && pinky)
    return { gesture: "HELLO", confidence: 0.93, fingerStates };

  // Fist (all closed) → YES / letter A
  if (!thumb && !index && !middle && !ring && !pinky)
    return { gesture: "YES", confidence: 0.90, fingerStates };

  // Index only → POINT / letter D
  if (!thumb && index && !middle && !ring && !pinky)
    return { gesture: "HELP", confidence: 0.87, fingerStates };

  // Index + Middle → PEACE / letter V / 2
  if (!thumb && index && middle && !ring && !pinky)
    return { gesture: "PEACE", confidence: 0.91, fingerStates };

  // Thumb only (thumbs-up) → GOOD
  if (thumb && !index && !middle && !ring && !pinky)
    return { gesture: "GOOD", confidence: 0.88, fingerStates };

  // Thumb + Index + Pinky → ILY / LOVE
  if (thumb && index && !middle && !ring && pinky)
    return { gesture: "LOVE", confidence: 0.92, fingerStates };

  // Thumb + Pinky → CALL ME
  if (thumb && !index && !middle && !ring && pinky)
    return { gesture: "CALL", confidence: 0.85, fingerStates };

  // Pinky only → I / letter I
  if (!thumb && !index && !middle && !ring && pinky)
    return { gesture: "I", confidence: 0.83, fingerStates };

  // Index + Middle + Ring → 3
  if (!thumb && index && middle && ring && !pinky)
    return { gesture: "THREE", confidence: 0.84, fingerStates };

  // Index + Middle + Ring + Pinky → B / 4
  if (!thumb && index && middle && ring && pinky)
    return { gesture: "FOUR", confidence: 0.86, fingerStates };

  // Thumb + Index + Middle → 3 (alternate)
  if (thumb && index && middle && !ring && !pinky)
    return { gesture: "THREE", confidence: 0.82, fingerStates };

  // No confident match
  return { gesture: "", confidence: 0, fingerStates };
}

/* ── Temporal smoother ─────────────────────────────────────────────── */

const BUFFER_SIZE = 8;
const CONFIRM_VOTES = 5; // must appear ≥ this many times out of BUFFER_SIZE

export class GestureSmoother {
  private buffer: string[] = [];
  private confBuffer: number[] = [];

  push(gesture: string, confidence: number): { gesture: string; confidence: number; confirmed: boolean } {
    this.buffer.push(gesture);
    this.confBuffer.push(confidence);
    if (this.buffer.length > BUFFER_SIZE) {
      this.buffer.shift();
      this.confBuffer.shift();
    }

    // Majority vote
    const counts: Record<string, number> = {};
    for (const g of this.buffer) counts[g] = (counts[g] ?? 0) + 1;

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [topGesture, topCount] = sorted[0] ?? ["", 0];

    if (!topGesture || topCount < CONFIRM_VOTES) {
      return { gesture: gesture || "", confidence, confirmed: false };
    }

    const avgConf = this.confBuffer.reduce((a, b) => a + b, 0) / this.confBuffer.length;
    return { gesture: topGesture, confidence: avgConf, confirmed: true };
  }

  reset() {
    this.buffer = [];
    this.confBuffer = [];
  }
}
