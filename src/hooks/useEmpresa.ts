
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nombre: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
}

export const useEmpresa = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmpresa = async () => {
      try {
        // Por ahora cargamos la empresa demo, en un futuro se podría hacer dinámico
        const { data } = await supabase
          .from('empresas')
          .select('id, nombre, logo_url, color_primario, color_secundario')
          .eq('cif', '12345678A')
          .single();

        if (data) {
          setEmpresa(data);
        }
      } catch (error) {
        console.error('Error loading empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpresa();
  }, []);

  return { empresa, loading };
};
