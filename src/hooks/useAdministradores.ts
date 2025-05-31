
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Administrador {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
}

export const useAdministradores = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const obtenerAdministradores = async (): Promise<Administrador[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('id, email, nombre, activo')
        .eq('activo', true)
        .order('nombre');

      if (error) {
        console.error('Error obteniendo administradores:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los administradores",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    obtenerAdministradores,
  };
};
