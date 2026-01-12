import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizeRequest {
  imageUrl: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, maxWidth = 1200, maxHeight = 1200, quality = 80, format = 'webp' } = await req.json() as OptimizeRequest;

    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }

    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const originalBuffer = await imageResponse.arrayBuffer();
    const originalSize = originalBuffer.byteLength;

    // For now, return metadata about the image
    // Full optimization would require image processing libraries
    const metadata = {
      originalUrl: imageUrl,
      originalSize,
      originalSizeKB: Math.round(originalSize / 1024),
      requestedMaxWidth: maxWidth,
      requestedMaxHeight: maxHeight,
      requestedQuality: quality,
      requestedFormat: format,
      contentType: imageResponse.headers.get('content-type'),
      message: 'Image metadata retrieved. Full optimization requires additional image processing setup.',
    };

    console.log(`Image analyzed: ${metadata.originalSizeKB}KB`);

    return new Response(
      JSON.stringify(metadata),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error optimizing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
