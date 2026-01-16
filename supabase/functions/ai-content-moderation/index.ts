import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  content: string;
  contentType: 'announcement' | 'group' | 'message' | 'profile';
  contentId?: string;
}

interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  suggestedAction: 'approve' | 'review' | 'reject';
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType, contentId } = await req.json() as ModerationRequest;

    if (!content) {
      throw new Error('Content is required');
    }

    // Sanitize content to prevent prompt injection
    const sanitizedContent = content
      .replace(/[<>]/g, '')
      .slice(0, 2000);

    const systemPrompt = `You are a content moderation AI for an academic platform called StudyBuddy. 
Your task is to analyze content and determine if it's appropriate for a university student community.

Flag content that contains:
- Hate speech or discrimination
- Explicit sexual content
- Violence or threats
- Spam or advertising
- Personal information sharing (phone numbers, addresses)
- Academic dishonesty (selling exams, plagiarism services)
- Harassment or bullying

Respond in JSON format with:
{
  "isAppropriate": boolean,
  "confidence": number (0-1),
  "flags": string[] (list of issues found),
  "suggestedAction": "approve" | "review" | "reject",
  "reason": string (brief explanation)
}`;

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
          { role: "user", content: `Analyze this ${contentType} content:\n\n${sanitizedContent}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = await response.json();
    const result: ModerationResult = JSON.parse(data.choices[0].message.content);

    console.log(`Content moderation for ${contentType}${contentId ? ` (${contentId})` : ''}: ${result.suggestedAction}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in content moderation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
