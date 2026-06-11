/**
 * Manages a queue of gestures for the sign-language avatar to animate through.
 * Each gesture is shown for `durationMs` ms before advancing.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface SignQueueState {
  currentGesture: string;
  currentIndex: number;
  total: number;
  isSigning: boolean;
}

export function useSignQueue(durationMs = 1100) {
  const [state, setState] = useState<SignQueueState>({
    currentGesture: "",
    currentIndex: 0,
    total: 0,
    isSigning: false,
  });

  const queueRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    queueRef.current = [];
    idxRef.current = 0;
    setState({ currentGesture: "", currentIndex: 0, total: 0, isSigning: false });
  }, []);

  const advance = useCallback(() => {
    const queue = queueRef.current;
    const idx = idxRef.current;
    if (idx >= queue.length) {
      setState({ currentGesture: "", currentIndex: 0, total: queue.length, isSigning: false });
      onCompleteRef.current?.();
      return;
    }
    setState({ currentGesture: queue[idx], currentIndex: idx, total: queue.length, isSigning: true });
    idxRef.current = idx + 1;
    timerRef.current = setTimeout(advance, durationMs);
  }, [durationMs]);

  const play = useCallback(
    (gestures: string[], onComplete?: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      queueRef.current = gestures;
      idxRef.current = 0;
      onCompleteRef.current = onComplete ?? null;
      if (!gestures.length) {
        setState({ currentGesture: "", currentIndex: 0, total: 0, isSigning: false });
        return;
      }
      advance();
    },
    [advance]
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { ...state, play, clear };
}
