import { supabase } from '../lib/supabase';
import axios from 'axios';

export const authService = {
  login: async (email: string, password: string) => {
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return {
      user: {
        id: user.id,
        name: userData.name,
        email: user.email,
        role: userData.role,
      },
      token: session.access_token,
    };
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const { data: { user, session }, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) throw error;
    if (!user) throw new Error('User registration failed');

    // Create user profile in our users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return {
      user: {
        id: user.id,
        name: profile.name,
        email: user.email,
        role: profile.role,
      },
      token: session?.access_token,
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
};

export const cropService = {
  getCrops: async () => {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  addCrop: async (cropData: any) => {
    const { data, error } = await supabase
      .from('crops')
      .insert(cropData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCrop: async (id: string, cropData: any) => {
    const { data, error } = await supabase
      .from('crops')
      .update(cropData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteCrop: async (id: string) => {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

export const weatherService = {
  getCurrentWeather: async (location: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather?location=${encodeURIComponent(location)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return response.json();
  },

  getForecast: async (location: string) => {
    // For now, we'll generate mock forecast data since we haven't implemented the forecast endpoint
    const current = await this.getCurrentWeather(location);
    
    const daily = Array(5).fill(null).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        ...current,
        date: date.toISOString(),
      };
    });

    const hourly = Array(24).fill(null).map((_, i) => {
      const date = new Date();
      date.setHours(date.getHours() + i);
      return {
        ...current,
        date: date.toISOString(),
      };
    });

    return { daily, hourly };
  },
};

export const chatService = {
  sendMessage: async (message: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message,
          userId: user.id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  analyzeCropImage: async (imageFile: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('userId', user.id);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnosis`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    return response.json();
  },
};

export const diagnosisService = {
  getDiagnoses: async () => {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('diagnosis_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  saveDiagnosis: async (diagnosisData: any) => {
    const { data, error } = await supabase
      .from('diagnoses')
      .insert(diagnosisData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default supabase;