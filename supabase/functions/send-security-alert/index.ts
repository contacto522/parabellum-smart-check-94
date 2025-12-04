import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
interface AlertPayload {
  person_name: string;
  person_rut: string;
  plant_name: string;
  risk_level: string;
  risk_description: string;
}

// Validation functions
function validatePersonName(name: string): boolean {
  return typeof name === 'string' && name.length >= 1 && name.length <= 200;
}

function validateRut(rut: string): boolean {
  // Chilean RUT format: 7-8 digits followed by - and a check digit (0-9 or K)
  const rutRegex = /^\d{7,8}-[\dkK]$/;
  return typeof rut === 'string' && rutRegex.test(rut);
}

function validatePlantName(name: string): boolean {
  return typeof name === 'string' && name.length >= 1 && name.length <= 100;
}

function validateRiskLevel(level: string): boolean {
  const validLevels = ['bajo', 'medio', 'alto', 'Bajo', 'Medio', 'Alto', 'BAJO', 'MEDIO', 'ALTO'];
  return typeof level === 'string' && validLevels.includes(level);
}

function validateRiskDescription(description: string): boolean {
  return typeof description === 'string' && description.length <= 1000;
}

function sanitizeForWhatsApp(text: string): string {
  // Remove potentially dangerous characters while preserving readability
  return text
    .replace(/[<>]/g, '') // Remove HTML-like tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

function validateAlertPayload(payload: unknown): { valid: boolean; error?: string; data?: AlertPayload } {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload: expected an object' };
  }

  const p = payload as Record<string, unknown>;

  if (!validatePersonName(p.person_name as string)) {
    return { valid: false, error: 'Invalid person_name: must be 1-200 characters' };
  }

  if (!validateRut(p.person_rut as string)) {
    return { valid: false, error: 'Invalid person_rut: must be valid Chilean RUT format (e.g., 12345678-9)' };
  }

  if (!validatePlantName(p.plant_name as string)) {
    return { valid: false, error: 'Invalid plant_name: must be 1-100 characters' };
  }

  if (!validateRiskLevel(p.risk_level as string)) {
    return { valid: false, error: 'Invalid risk_level: must be bajo, medio, or alto' };
  }

  if (!validateRiskDescription(p.risk_description as string)) {
    return { valid: false, error: 'Invalid risk_description: must be 1000 characters or less' };
  }

  return {
    valid: true,
    data: {
      person_name: sanitizeForWhatsApp(p.person_name as string),
      person_rut: (p.person_rut as string).trim(),
      plant_name: sanitizeForWhatsApp(p.plant_name as string),
      risk_level: (p.risk_level as string).toLowerCase(),
      risk_description: sanitizeForWhatsApp(p.risk_description as string),
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawPayload = await req.json();
    const validation = validateAlertPayload(rawPayload);

    if (!validation.valid || !validation.data) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { person_name, person_rut, plant_name, risk_level, risk_description } = validation.data;

    // Log without sensitive data (mask RUT)
    const maskedRut = person_rut.slice(0, 4) + '****' + person_rut.slice(-2);
    console.log('Security alert triggered:', { plant_name, risk_level, maskedRut });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active alert contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('alert_contacts')
      .select('*')
      .eq('is_active', true);

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      throw contactsError;
    }

    if (!contacts || contacts.length === 0) {
      console.log('No active contacts found');
      return new Response(
        JSON.stringify({ message: 'No active contacts to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${contacts.length} active contacts to notify`);

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Format the alert message
    const alertMessage = `🚨 *ALERTA DE SEGURIDAD*

⚠️ *Nivel de Riesgo:* ${risk_level.toUpperCase()}

👤 *Persona:* ${person_name}
📋 *RUT:* ${person_rut}
🏭 *Planta:* ${plant_name}

📝 *Descripción:*
${risk_description}

⏰ ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`;

    // Send WhatsApp messages to all active contacts
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const sendPromises = contacts.map(async (contact) => {
      try {
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioWhatsAppNumber}`,
            To: `whatsapp:${contact.phone_number}`,
            Body: alertMessage,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send to contact:`, errorText);
          return { contact: contact.name, success: false, error: 'Failed to send' };
        }

        console.log(`Alert sent successfully to ${contact.name}`);
        return { contact: contact.name, success: true };
      } catch (error) {
        console.error(`Error sending to contact:`, error);
        return { contact: contact.name, success: false, error: 'Send error' };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Alerts sent: ${successCount}/${contacts.length}`);

    return new Response(
      JSON.stringify({
        message: `Alerts sent to ${successCount}/${contacts.length} contacts`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in send-security-alert function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
