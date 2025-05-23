import { create } from 'zustand';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  icon: string;
  date: string;
  isFavorable: boolean;
}

interface WeatherForecast {
  daily: WeatherData[];
  hourly: WeatherData[];
}

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: WeatherForecast | null;
  isLoading: boolean;
  error: string | null;
  setCurrentWeather: (weather: WeatherData) => void;
  setForecast: (forecast: WeatherForecast) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: null,
  forecast: null,
  isLoading: false,
  error: null,
  setCurrentWeather: (weather) => set({ currentWeather: weather }),
  setForecast: (forecast) => set({ forecast }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));