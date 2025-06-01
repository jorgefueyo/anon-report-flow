
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HistorialItem {
  id: string;
  fecha: string;
  operacion: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  acciones_realizadas: string | null;
  observaciones: string | null;
}

interface HistorialSeguimientoProps {
  denunciaId: string;
}

const HistorialSeguimiento = ({ denunciaId }: HistorialSeguimientoProps) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const { data, error } = await supabase
          .from('seguimiento_denuncias')
          .select('*')
          .eq('denuncia_id', denunciaId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error cargando historial:', error);
          return;
        }

        setHistorial(data || []);
      } catch (error) {
        console.error('Error cargando historial:', error);
      } finally {
        setLoading(false);
      }
    };

    if (denunciaId) {
      cargarHistorial();
    }

    // Suscribirse a cambios en tiempo real para actualizar el historial
    const channel = supabase
      .channel('historial-seguimiento')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'seguimiento_denuncias',
          filter: `denuncia_id=eq.${denunciaId}`
        },
        () => {
          console.log('Nuevo registro en historial, recargando...');
          cargarHistorial();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [denunciaId]);

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'asignada':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-orange-100 text-orange-800';
      case 'finalizada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Seguimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando historial...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Seguimiento</CardTitle>
      </CardHeader>
      <CardContent>
        {historial.length === 0 ? (
          <p className="text-gray-500">No hay historial disponible.</p>
        ) : (
          <div className="space-y-4">
            {historial.map((item) => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">{item.operacion}</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(item.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
                
                {item.estado_anterior && item.estado_nuevo && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge className={getEstadoBadgeColor(item.estado_anterior)}>
                      {item.estado_anterior.toUpperCase()}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge className={getEstadoBadgeColor(item.estado_nuevo)}>
                      {item.estado_nuevo.toUpperCase()}
                    </Badge>
                  </div>
                )}
                
                {item.acciones_realizadas && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Acciones realizadas:</span>
                    <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded border-l-2 border-blue-200">
                      {item.acciones_realizadas}
                    </p>
                  </div>
                )}
                
                {item.observaciones && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Observaciones:</span>
                    <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded border-l-2 border-green-200">
                      {item.observaciones}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistorialSeguimiento;
