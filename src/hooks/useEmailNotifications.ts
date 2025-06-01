
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
      console.log('Enviando notificación por email:', data);
      
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

  const sendNotificationToAdmins = async (
    tipo: 'nueva_denuncia' | 'estado_cambio',
    denunciaCode: string,
    estadoAnterior?: string,
    estadoNuevo?: string,
    empresaNombre?: string
  ) => {
    try {
      console.log('Enviando notificaciones a administradores:', { tipo, denunciaCode });
      
      // Obtener todos los administradores activos
      const { data: admins, error } = await supabase
        .from('administradores')
        .select('email, nombre')
        .eq('activo', true);

      if (error || !admins || admins.length === 0) {
        console.log('No se encontraron administradores activos');
        return;
      }

      // Enviar notificación a cada administrador
      const notificationPromises = admins.map(admin => {
        if (tipo === 'nueva_denuncia') {
          return sendNewDenunciaNotification(admin.email, denunciaCode, empresaNombre);
        } else {
          return sendEstadoCambioNotification(
            admin.email, 
            denunciaCode, 
            estadoAnterior!, 
            estadoNuevo!, 
            empresaNombre
          );
        }
      });

      await Promise.allSettled(notificationPromises);
      console.log('Notificaciones enviadas a administradores');
    } catch (error) {
      console.error('Error enviando notificaciones a administradores:', error);
    }
  };

  return {
    sendNewDenunciaNotification,
    sendEstadoCambioNotification,
    sendAsignacionNotification,
    sendNotificationToAdmins
  };
};
