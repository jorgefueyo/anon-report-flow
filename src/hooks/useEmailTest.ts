
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailTest = () => {
  const [testing, setTesting] = useState(false);

  const testEmailConfiguration = async (recipientEmail: string) => {
    setTesting(true);
    try {
      console.log('Testing email configuration with recipient:', recipientEmail);
      
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'nueva_denuncia',
          recipientEmail: recipientEmail,
          denunciaCode: 'TEST-001',
          empresaNombre: 'Test Company'
        }
      });

      if (error) {
        console.error('Error testing email:', error);
        throw error;
      }

      console.log('Email test successful:', data);
      return { success: true, message: 'Email de prueba enviado correctamente' };
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      return { 
        success: false, 
        message: error.message || 'Error al enviar el email de prueba' 
      };
    } finally {
      setTesting(false);
    }
  };

  return {
    testing,
    testEmailConfiguration
  };
};
