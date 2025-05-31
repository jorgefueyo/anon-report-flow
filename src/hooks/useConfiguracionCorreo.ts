
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
        // Usar consulta SQL directa ya que la tabla no está en los tipos aún
        const { data, error } = await supabase
          .rpc('exec_sql', { 
            sql: `SELECT * FROM configuracion_correo WHERE empresa_id = $1`,
            params: [empresaId]
          })
          .catch(async () => {
            // Fallback: usar supabase.from con any para evitar errores de tipo
            return await (supabase as any)
              .from('configuracion_correo')
              .select('*')
              .eq('empresa_id', empresaId)
              .single();
          });

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading configuracion correo:', error);
          return;
        }

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
      if (configuracion) {
        // Actualizar configuración existente usando any para evitar errores de tipo
        const { data, error } = await (supabase as any)
          .from('configuracion_correo')
          .update(updatedData)
          .eq('id', configuracion.id)
          .select()
          .single();

        if (error) throw error;
        setConfiguracion(data);
      } else {
        // Crear nueva configuración usando any para evitar errores de tipo
        const { data, error } = await (supabase as any)
          .from('configuracion_correo')
          .insert({
            empresa_id: empresaId,
            ...updatedData
          })
          .select()
          .single();

        if (error) throw error;
        setConfiguracion(data);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating configuracion correo:', error);
      return { success: false, error: 'Error al actualizar la configuración de correo' };
    }
  };

  return { configuracion, loading, updateConfiguracion };
};
