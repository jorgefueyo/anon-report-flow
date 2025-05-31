
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  direccion: string | null;
  codigo_postal: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais: string | null;
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
          .select('id, nombre, cif, direccion, codigo_postal, ciudad, provincia, pais, email, telefono, configurada')
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

  const updateEmpresa = (updatedData: Partial<Empresa>) => {
    if (empresa) {
      setEmpresa({ ...empresa, ...updatedData });
    }
  };

  return { empresa, loading, updateEmpresa };
};
