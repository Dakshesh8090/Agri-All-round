import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!image || !userId) {
      throw new Error('Image and userId are required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('crop-images')
      .upload(`${userId}/${Date.now()}-${image.name}`, image);

    if (uploadError) throw uploadError;

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('crop-images')
      .getPublicUrl(uploadData.path);

    // Mock AI analysis (in production, this would call a real AI service)
    const mockDiagnoses = [
      {
        disease: 'Late Blight',
        confidence: 0.92,
        solution: 'Apply copper-based fungicide and ensure good air circulation between plants. Remove and destroy infected parts immediately.',
      },
      {
        disease: 'Powdery Mildew',
        confidence: 0.87,
        solution: 'Apply neem oil or potassium bicarbonate spray. Improve air circulation and avoid overhead watering.',
      },
      {
        disease: 'Bacterial Leaf Spot',
        confidence: 0.78,
        solution: 'Remove infected leaves, avoid overhead watering, and apply copper-based bactericide as a preventive measure.',
      },
    ];

    const diagnosis = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];

    // Save diagnosis to database
    const { data: savedDiagnosis, error: dbError } = await supabaseClient
      .from('diagnoses')
      .insert({
        user_id: userId,
        image_path: publicUrl,
        disease_detected: diagnosis.disease,
        solution: diagnosis.solution,
        confidence: diagnosis.confidence,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        id: savedDiagnosis.id,
        content: `I've analyzed your crop image and detected ${diagnosis.disease} with ${(diagnosis.confidence * 100).toFixed(1)}% confidence.`,
        imageUrl: publicUrl,
        diagnosisResult: diagnosis,
        timestamp: new Date().toISOString(),
      }),
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