
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SeguimientoDenuncia {
  id: string;
  denuncia_id: string;
  usuario_id: string | null;
  fecha: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  operacion: string;
  acciones_realizadas: string | null;
  observaciones: string | null;
  created_at: string;
  usuario?: {
    nombre: string;
    email: string;
  };
}

export const useSeguimientoDenuncias = (denunciaId?: string) => {
  const [seguimientos, setSeguimientos] = useState<SeguimientoDenuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSeguimientos = async (id?: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seguimiento_denuncias')
        .select(`
          *,
          usuario:usuarios_backoffice(nombre, email)
        `)
        .eq('denuncia_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading seguimientos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los seguimientos",
          variant: "destructive",
        });
        return;
      }

      setSeguimientos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarSeguimiento = async (
    denunciaId: string,
    operacion: string,
    accionesRealizadas: string,
    observaciones?: string,
    estadoAnterior?: string,
    estadoNuevo?: string
  ) => {
    try {
      const { error } = await supabase
        .from('seguimiento_denuncias')
        .insert({
          denuncia_id: denunciaId,
          operacion,
          acciones_realizadas: accionesRealizadas,
          observaciones: observaciones || null,
          estado_anterior: estadoAnterior || null,
          estado_nuevo: estadoNuevo || 'pendiente'
        });

      if (error) {
        console.error('Error adding seguimiento:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar el seguimiento",
          variant: "destructive",
        });
        return false;
      }

      // Recargar seguimientos
      await loadSeguimientos(denunciaId);
      
      toast({
        title: "Seguimiento agregado",
        description: "El seguimiento se ha registrado correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (denunciaId) {
      loadSeguimientos(denunciaId);
    }
  }, [denunciaId]);

  return {
    seguimientos,
    loading,
    loadSeguimientos,
    agregarSeguimiento
  };
};
