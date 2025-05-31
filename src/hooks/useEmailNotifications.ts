
import { supabase } from '@/integrations/supabase/client';

interface EmailNotificationData {
  type: 'estado_cambio' | 'nueva_denuncia' | 'asignacion';
  recipientEmail: string;
  recipientName?: string;
  denunciaCode: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  asignadoA?: string;
  empresaNombre?: string;
}

export const useEmailNotifications = () => {
  const sendNotification = async (data: EmailNotificationData) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-notification-email', {
        body: data
      });

      if (error) {
        console.error('Error sending email notification:', error);
        throw error;
      }

      console.log('Email notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  };

  const sendNewDenunciaNotification = async (
    recipientEmail: string, 
    denunciaCode: string, 
    empresaNombre?: string
  ) => {
    return sendNotification({
      type: 'nueva_denuncia',
      recipientEmail,
      denunciaCode,
      empresaNombre
    });
  };

  const sendEstadoCambioNotification = async (
    recipientEmail: string, 
    denunciaCode: string, 
    estadoAnterior: string, 
    estadoNuevo: string,
    empresaNombre?: string
  ) => {
    return sendNotification({
      type: 'estado_cambio',
      recipientEmail,
      denunciaCode,
      estadoAnterior,
      estadoNuevo,
      empresaNombre
    });
  };

  const sendAsignacionNotification = async (
    recipientEmail: string, 
    recipientName: string,
    denunciaCode: string,
    empresaNombre?: string
  ) => {
    return sendNotification({
      type: 'asignacion',
      recipientEmail,
      recipientName,
      denunciaCode,
      empresaNombre
    });
  };

  return {
    sendNewDenunciaNotification,
    sendEstadoCambioNotification,
    sendAsignacionNotification
  };
};
