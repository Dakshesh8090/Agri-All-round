import { create } from 'zustand';

export interface Crop {
  id: string;
  userId: string;
  name: string;
  type: string;
  plantingDate: string;
  expectedHarvest: string;
  soilType: string;
  growthStage: string;
  createdAt: string;
}

interface CropState {
  crops: Crop[];
  isLoading: boolean;
  error: string | null;
  setCrops: (crops: Crop[]) => void;
  addCrop: (crop: Crop) => void;
  updateCrop: (id: string, updatedCrop: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCropStore = create<CropState>((set) => ({
  crops: [],
  isLoading: false,
  error: null,
  setCrops: (crops) => set({ crops }),
  addCrop: (crop) => set((state) => ({ crops: [...state.crops, crop] })),
  updateCrop: (id, updatedCrop) =>
    set((state) => ({
      crops: state.crops.map((crop) =>
        crop.id === id ? { ...crop, ...updatedCrop } : crop
      ),
    })),
  deleteCrop: (id) =>
    set((state) => ({
      crops: state.crops.filter((crop) => crop.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));