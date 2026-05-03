import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openRouterKey: string;
  googleTranslateKey: string;
  huggingFaceKey: string;
  grokKey: string;
  setOpenRouterKey: (key: string) => void;
  setGoogleTranslateKey: (key: string) => void;
  setHuggingFaceKey: (key: string) => void;
  setGrokKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openRouterKey: '',
      googleTranslateKey: '',
      huggingFaceKey: '',
      grokKey: '',
      setOpenRouterKey: (key) => set({ openRouterKey: key }),
      setGoogleTranslateKey: (key) => set({ googleTranslateKey: key }),
      setHuggingFaceKey: (key) => set({ huggingFaceKey: key }),
      setGrokKey: (key) => set({ grokKey: key }),
    }),
    {
      name: 'fabo-ai-settings',
    }
  )
);
