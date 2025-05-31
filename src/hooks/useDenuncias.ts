
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Denuncia } from "@/types/denuncia";

export const useDenuncias = () => {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDenuncias = async () => {
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, categoria, estado, created_at, hechos')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading denuncias:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las denuncias",
          variant: "destructive",
        });
        return;
      }

      setDenuncias(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDenuncias();
  }, []);

  return {
    denuncias,
    loading,
    loadDenuncias
  };
};
