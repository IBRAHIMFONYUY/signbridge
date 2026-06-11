import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface SpeechRecognitionState {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

type SpeechRecognitionAPI = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: { transcript: string; confidence: number };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
};

function getRecognitionCtor(): (new () => SpeechRecognitionAPI) | null {
  if (Platform.OS !== "web") return null;
  const w = window as Record<string, unknown>;
  return (w.SpeechRecognition as new () => SpeechRecognitionAPI) ||
    (w.webkitSpeechRecognition as new () => SpeechRecognitionAPI) ||
    null;
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recogRef = useRef<SpeechRecognitionAPI | null>(null);
  const Ctor = getRecognitionCtor();
  const isSupported = !!Ctor;

  const stop = useCallback(() => {
    recogRef.current?.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    setError(null);
    setInterimTranscript("");

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }
      if (finalText) {
        setTranscript((prev) => (prev + " " + finalText).trim());
      }
      setInterimTranscript(interimText);
    };

    rec.onerror = (event: { error: string }) => {
      if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        setError("Microphone permission denied.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recogRef.current = rec;
    rec.start();
  }, [Ctor]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, [stop]);

  useEffect(() => {
    return () => {
      recogRef.current?.abort();
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    start,
    stop,
    reset,
  };
}
