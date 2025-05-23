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
    const { message, userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simple rule-based responses
    const responses = [
      {
        keywords: ['plant', 'sow', 'seed'],
        response: 'The best time to plant depends on your local climate and the specific crop. Make sure to check soil temperature and moisture levels before planting.',
      },
      {
        keywords: ['water', 'irrigation', 'moisture'],
        response: 'Water your crops early in the morning to reduce evaporation. Use mulch to retain moisture and prevent weed growth.',
      },
      {
        keywords: ['pest', 'insect', 'bug'],
        response: 'Consider using natural pest control methods like companion planting or introducing beneficial insects. Monitor your crops regularly for early detection.',
      },
      {
        keywords: ['fertilizer', 'nutrient', 'feed'],
        response: 'Choose organic fertilizers for sustainable farming. Apply them during the growing season, following recommended rates for your specific crops.',
      },
    ];

    // Find matching response
    let responseText = 'I apologize, but I need more specific information to provide accurate advice. Could you please provide more details about your farming question?';
    
    const lowercaseMessage = message.toLowerCase();
    for (const rule of responses) {
      if (rule.keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        responseText = rule.response;
        break;
      }
    }

    // Save query to database
    const { data: query, error } = await supabaseClient
      .from('queries')
      .insert({
        user_id: userId,
        query_text: message,
        query_type: 'text',
        response_text: responseText,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        id: query.id,
        content: responseText,
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