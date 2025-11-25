import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeName, employeeGender = "male" } = await req.json();

    if (!employeeName) {
      throw new Error("Employee name is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate professional ID photo using Lovable AI
    const genderTerm = employeeGender === "female" ? "mujer" : "hombre";
    const prompt = `Foto tipo carnet profesional de ${genderTerm} chileno/a trabajador/a industrial, fondo neutro gris claro, iluminación profesional, rostro centrado mirando al frente, expresión neutra profesional, imagen realista de alta calidad, estilo fotografía de identificación corporativa`;

    console.log("Generating photo with prompt:", prompt);

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Data = imageUrl.split(",")[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0)
    );

    // Generate unique filename
    const fileName = `${employeeName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
    const filePath = `photos/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("employee-photos")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("employee-photos").getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        success: true,
        photo_url: publicUrl,
        file_path: filePath,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
