
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
  configurada: boolean | null;
}

export const useEmpresa = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmpresa = async () => {
      try {
        const { data } = await supabase
          .from('empresas')
          .select('id, nombre, cif, direccion, email, telefono, configurada')
          .eq('cif', '00000000A')
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
