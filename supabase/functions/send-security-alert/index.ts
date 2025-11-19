import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  person_name: string;
  person_rut: string;
  plant_name: string;
  risk_level: string;
  risk_description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { person_name, person_rut, plant_name, risk_level, risk_description }: AlertPayload = await req.json();

    console.log('Security alert triggered:', { person_name, person_rut, plant_name, risk_level });

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
          console.error(`Failed to send to ${contact.phone_number}:`, errorText);
          return { contact: contact.name, success: false, error: errorText };
        }

        console.log(`Alert sent successfully to ${contact.name} (${contact.phone_number})`);
        return { contact: contact.name, success: true };
      } catch (error) {
        console.error(`Error sending to ${contact.phone_number}:`, error);
        return { contact: contact.name, success: false, error: String(error) };
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
      JSON.stringify({ error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
