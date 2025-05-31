
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_Q86Nkjfp_nt5QNk4hx9h2cayJYKYtPxs5");

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
}

const getEmailTemplate = (data: NotificationEmailRequest) => {
  const { type, denunciaCode, estadoAnterior, estadoNuevo, asignadoA, empresaNombre } = data;
  
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
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Puede consultar el estado de su denuncia en cualquier momento utilizando el código de seguimiento.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Atentamente,<br>
                <strong>${empresaNombre || 'Sistema de Denuncias'}</strong>
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
                <strong>${empresaNombre || 'Sistema de Denuncias'}</strong>
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
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Por favor, acceda al sistema para revisar los detalles y proceder con la gestión correspondiente.
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Atentamente,<br>
                <strong>${empresaNombre || 'Sistema de Denuncias'}</strong>
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

    const emailTemplate = getEmailTemplate(requestData);

    console.log("Sending email to:", recipientEmail);
    const emailResponse = await resend.emails.send({
      from: "Sistema de Denuncias <onboarding@resend.dev>",
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
