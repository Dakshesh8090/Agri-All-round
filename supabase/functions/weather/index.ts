import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

// const supabase = createClient(
//   Deno.env.get('SUPABASE_URL')!,
//   Deno.env.get('SUPABASE_ANON_KEY')!
// );


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const location = url.searchParams.get('location') || 'London';

    // Fetch weather data from OpenWeatherMap API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Transform weather data
    const transformedData = {
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      rainfall: weatherData.rain ? weatherData.rain['1h'] || 0 : 0,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      date: new Date().toISOString(),
      isFavorable: weatherData.main.temp >= 15 && weatherData.main.temp <= 30 && weatherData.main.humidity >= 40,
    };

    return new Response(
      JSON.stringify(transformedData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});