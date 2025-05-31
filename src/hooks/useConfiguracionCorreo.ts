
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConfiguracionCorreo {
  id: string;
  empresa_id: string;
  resend_api_key: string | null;
  dominio_remitente: string | null;
  nombre_remitente: string | null;
  email_remitente: string | null;
  activo: boolean;
}

export const useConfiguracionCorreo = (empresaId?: string) => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionCorreo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    const loadConfiguracion = async () => {
      try {
        console.log('Loading configuracion correo for empresa_id:', empresaId);
        const { data, error } = await supabase
          .from('configuracion_correo')
          .select('*')
          .eq('empresa_id', empresaId)
          .maybeSingle();

        if (error) {
          console.error('Error loading configuracion correo:', error);
          return;
        }

        console.log('Configuracion correo loaded:', data);
        setConfiguracion(data);
      } catch (error) {
        console.error('Error loading configuracion correo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguracion();
  }, [empresaId]);

  const updateConfiguracion = async (updatedData: Partial<ConfiguracionCorreo>) => {
    if (!empresaId) return { success: false, error: 'No hay empresa seleccionada' };

    try {
      console.log('Updating configuracion correo:', updatedData);
      
      if (configuracion) {
        // Actualizar configuración existente
        console.log('Updating existing configuration with id:', configuracion.id);
        const { data, error } = await supabase
          .from('configuracion_correo')
          .update(updatedData)
          .eq('id', configuracion.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating configuracion:', error);
          throw error;
        }
        console.log('Configuration updated successfully:', data);
        setConfiguracion(data);
      } else {
        // Crear nueva configuración
        console.log('Creating new configuration for empresa_id:', empresaId);
        const { data, error } = await supabase
          .from('configuracion_correo')
          .insert({
            empresa_id: empresaId,
            ...updatedData
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating configuracion:', error);
          throw error;
        }
        console.log('Configuration created successfully:', data);
        setConfiguracion(data);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating configuracion correo:', error);
      return { 
        success: false, 
        error: error.message || 'Error al actualizar la configuración de correo' 
      };
    }
  };

  return { configuracion, loading, updateConfiguracion };
};
