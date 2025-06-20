
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: 'estado_cambio' | 'nueva_denuncia' | 'asignacion';
  recipientEmail: string;
  recipientName?: string;
  denunciaCode: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  asignadoA?: string;
  empresaNombre?: string;
  configCorreo?: any;
}

const getEmailTemplate = async (data: NotificationEmailRequest, configCorreo?: any, seguimientoData?: any[]) => {
  const { type, denunciaCode, estadoAnterior, estadoNuevo, empresaNombre } = data;
  const nombreRemitente = configCorreo?.nombre_remitente || 'Sistema de Denuncias';
  const empresaNombreFinal = empresaNombre || 'Sistema de Denuncias';
  
  // Generar tabla de seguimiento si hay datos
  let tablaHtml = '';
  if (seguimientoData && seguimientoData.length > 0) {
    tablaHtml = `
      <div style="margin: 20px 0;">
        <h3 style="color: #333; margin-bottom: 15px;">Historial de Seguimiento:</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Fecha</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Estado</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Acciones</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${seguimientoData.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(item.fecha).toLocaleDateString('es-ES')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.estado_nuevo.toUpperCase()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.acciones_realizadas || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.observaciones || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  switch (type) {
    case 'estado_cambio':
      return {
        subject: `Estado de denuncia ${denunciaCode} actualizado`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Estado de Denuncia Actualizado</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Estimado/a usuario/a,
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Le informamos que el estado de su denuncia <strong>${denunciaCode}</strong> ha sido actualizado.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Estado anterior:</p>
                <p style="margin: 5px 0 15px 0; font-size: 16px; color: #333; font-weight: bold;">${estadoAnterior?.toUpperCase()}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">Nuevo estado:</p>
                <p style="margin: 5px 0 0 0; font-size: 16px; color: #28a745; font-weight: bold;">${estadoNuevo?.toUpperCase()}</p>
              </div>
              ${tablaHtml}
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Puede consultar el estado de su denuncia en cualquier momento utilizando el código de seguimiento.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Atentamente,<br>
                <strong>${empresaNombreFinal}</strong>
              </p>
            </div>
          </div>
        `
      };
      
    case 'nueva_denuncia':
      return {
        subject: `Denuncia recibida - Código ${denunciaCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Denuncia Recibida</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Estimado/a denunciante,
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hemos recibido su denuncia correctamente. Su código de seguimiento es:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #28a745; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 24px; color: #28a745; font-weight: bold; letter-spacing: 2px;">${denunciaCode}</p>
              </div>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                <strong>Guarde este código</strong>, ya que lo necesitará para consultar el estado de su denuncia.
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Su denuncia será revisada por nuestro equipo y le notificaremos cualquier cambio en el estado.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Atentamente,<br>
                <strong>${empresaNombreFinal}</strong>
              </p>
            </div>
          </div>
        `
      };
      
    case 'asignacion':
      return {
        subject: `Denuncia ${denunciaCode} asignada`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #007bff 0%, #6610f2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Denuncia Asignada</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Estimado/a ${data.recipientName || 'colaborador/a'},
              </p>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Se le ha asignado una nueva denuncia para su gestión:
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Código de denuncia:</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #007bff; font-weight: bold;">${denunciaCode}</p>
              </div>
              ${tablaHtml}
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Por favor, acceda al sistema para revisar los detalles y proceder con la gestión correspondiente.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Atentamente,<br>
                <strong>${empresaNombreFinal}</strong>
              </p>
            </div>
          </div>
        `
      };
      
    default:
      return {
        subject: `Notificación del sistema - ${denunciaCode}`,
        html: `<p>Notificación del sistema para la denuncia ${denunciaCode}</p>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Email function called with method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: NotificationEmailRequest = await req.json();
    console.log("Request data:", requestData);

    const { recipientEmail, type, denunciaCode } = requestData;

    if (!recipientEmail || !type || !denunciaCode) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Obtener configuración de correo desde Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: configCorreo } = await supabaseClient
      .from('configuracion_correo')
      .select('*')
      .eq('activo', true)
      .single();

    if (!configCorreo || !configCorreo.resend_api_key) {
      console.log("No email configuration found or Resend API key missing");
      return new Response(
        JSON.stringify({ error: "Configuración de correo no encontrada" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Obtener datos de seguimiento si es necesario
    let seguimientoData = null;
    if (type === 'estado_cambio' || type === 'asignacion') {
      const { data: seguimiento } = await supabaseClient
        .from('seguimiento_denuncias')
        .select('*')
        .eq('denuncia_id', (await supabaseClient
          .from('denuncias')
          .select('id')
          .eq('codigo_seguimiento', denunciaCode)
          .single()).data?.id)
        .order('fecha', { ascending: false })
        .limit(10);
      
      seguimientoData = seguimiento;
    }

    const resend = new Resend(configCorreo.resend_api_key);
    const emailTemplate = await getEmailTemplate(requestData, configCorreo, seguimientoData);

    console.log("Sending email to:", recipientEmail);
    const emailResponse = await resend.emails.send({
      from: `${configCorreo.nombre_remitente || 'Sistema de Denuncias'} <${configCorreo.email_remitente || 'onboarding@resend.dev'}>`,
      to: [recipientEmail],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
