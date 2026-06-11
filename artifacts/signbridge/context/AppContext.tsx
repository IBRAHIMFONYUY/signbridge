import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Message {
  id: string;
  sender: "deaf" | "hearing";
  text: string;
  timestamp: Date;
  type: "sign" | "speech";
}

export interface AppSettings {
  largeText: boolean;
  highContrast: boolean;
  darkMode: boolean;
  speechRate: number;
  autoSpeak: boolean;
}

interface AppContextValue {
  messages: Message[];
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  currentGesture: string;
  setCurrentGesture: (g: string) => void;
  confidence: number;
  setConfidence: (c: number) => void;
  sentence: string;
  setSentence: (s: string) => void;
  isListening: boolean;
  setIsListening: (v: boolean) => void;
  isRecognizing: boolean;
  setIsRecognizing: (v: boolean) => void;
}

const defaultSettings: AppSettings = {
  largeText: false,
  highContrast: false,
  darkMode: true,
  speechRate: 1.0,
  autoSpeak: true,
};

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [currentGesture, setCurrentGesture] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [sentence, setSentence] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem("signbridge_settings").then((val) => {
      if (val) {
        try {
          setSettings(JSON.parse(val));
        } catch {}
      }
    });
    AsyncStorage.getItem("signbridge_messages").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as Message[];
          setMessages(
            parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
          );
        } catch {}
      }
    });
  }, []);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const full: Message = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const next = [...prev, full];
      AsyncStorage.setItem("signbridge_messages", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    AsyncStorage.removeItem("signbridge_messages");
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      AsyncStorage.setItem("signbridge_settings", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        settings,
        updateSettings,
        currentGesture,
        setCurrentGesture,
        confidence,
        setConfidence,
        sentence,
        setSentence,
        isListening,
        setIsListening,
        isRecognizing,
        setIsRecognizing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
