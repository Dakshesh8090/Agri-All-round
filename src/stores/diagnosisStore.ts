import { create } from 'zustand';

export interface Diagnosis {
  id: string;
  userId: string;
  imagePath: string;
  diseaseDetected: string;
  solution: string;
  confidence: number;
  diagnosisDate: string;
}

interface DiagnosisState {
  diagnoses: Diagnosis[];
  isLoading: boolean;
  error: string | null;
  setDiagnoses: (diagnoses: Diagnosis[]) => void;
  addDiagnosis: (diagnosis: Diagnosis) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  diagnoses: [],
  isLoading: false,
  error: null,
  setDiagnoses: (diagnoses) => set({ diagnoses }),
  addDiagnosis: (diagnosis) =>
    set((state) => ({ diagnoses: [diagnosis, ...state.diagnoses] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));