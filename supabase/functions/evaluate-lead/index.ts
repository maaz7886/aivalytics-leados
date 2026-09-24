import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { leadId, evaluationType } = await req.json();

    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Missing leadId' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1. Fetch Lead Context securely
    const { data: lead, error: leadError } = await supabaseClient
      .from('leads')
      .select('*, call_notes_history, lead_activities(*)')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Mock Jev API call (replace with actual Jev API using Deno.env.get('JEV_API_KEY'))
    const apiKey = Deno.env.get('JEV_API_KEY');
    if (!apiKey) {
      console.warn("JEV_API_KEY is not set. Using fallback AI simulation.");
    }

    // Simulate structured decision layer from Jev
    const mockJevResponse = {
      qualification: 'Qualified',
      temperature: 'Hot',
      priority: 'P1',
      health_score: 85,
      intent_score: 72,
      next_best_action: 'call_now',
      progression_probability: 88,
      reasoning: 'Lead has high experience matching program requirements and recently interacted with content.',
      confidence: 0.92
    };

    // 3. Save Evaluation to Database (Immutable record)
    const { error: insertError } = await supabaseClient
      .from('ai_evaluations')
      .insert({
        id: crypto.randomUUID(),
        lead_id: lead.id,
        evaluation_type: evaluationType || 'full_profile',
        result: JSON.stringify(mockJevResponse),
        score: mockJevResponse.health_score,
        confidence: mockJevResponse.confidence,
        reasoning: mockJevResponse.reasoning,
        model_version: 'jev-decision-v2'
      });

    if (insertError) {
      console.error("Failed to save AI evaluation:", insertError);
    }

    // 4. Update Lead Record with latest state
    await supabaseClient
      .from('leads')
      .update({
        temperature: mockJevResponse.temperature,
        priority: mockJevResponse.priority,
        lead_health_score: mockJevResponse.health_score,
        intent_score: mockJevResponse.intent_score,
        next_best_action: mockJevResponse.next_best_action,
        conversion_probability: mockJevResponse.progression_probability
      })
      .eq('id', lead.id);

    return new Response(
      JSON.stringify({ success: true, decision: mockJevResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
