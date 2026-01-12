import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyAssistantRequest {
  question: string;
  subject?: string;
  context?: string;
  mode?: 'explain' | 'quiz' | 'summarize' | 'tips';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { question, subject, context, mode = 'explain' } = await req.json() as StudyAssistantRequest;

    if (!question) {
      throw new Error('Question is required');
    }

    // Sanitize input
    const sanitizedQuestion = question.replace(/[<>]/g, '').slice(0, 2000);
    const sanitizedSubject = subject?.replace(/[<>]/g, '').slice(0, 100) || '';
    const sanitizedContext = context?.replace(/[<>]/g, '').slice(0, 1000) || '';

    const modeInstructions = {
      explain: 'Explain the concept clearly with examples suitable for a university student.',
      quiz: 'Create 3 quiz questions with answers to test understanding of the topic.',
      summarize: 'Provide a concise summary of the key points.',
      tips: 'Give practical study tips and learning strategies for this topic.',
    };

    const systemPrompt = `You are a helpful study assistant for Romanian university students using StudyBuddy3 platform.
Your role is to help students understand academic concepts, prepare for exams, and improve their learning.

Guidelines:
- Be clear and educational
- Use examples when helpful
- Encourage critical thinking
- Be supportive and positive
- You can respond in Romanian or English based on the question language

Mode: ${modeInstructions[mode]}
${sanitizedSubject ? `Subject area: ${sanitizedSubject}` : ''}
${sanitizedContext ? `Additional context: ${sanitizedContext}` : ''}`;

    const response = await fetch("https://ai.lovable.dev/api/chat/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sanitizedQuestion }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log(`Study assistant query from ${user.email}: mode=${mode}, subject=${sanitizedSubject || 'general'}`);

    return new Response(
      JSON.stringify({ 
        answer,
        mode,
        subject: sanitizedSubject || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in study assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
