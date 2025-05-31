
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
  }, [denunciaId]);

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'asignada':
        return 'bg-blue-100 text-blue-800';
      case 'en_tramite':
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
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{item.operacion}</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(item.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
                {item.estado_anterior && item.estado_nuevo && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getEstadoBadgeColor(item.estado_anterior)}>
                      {item.estado_anterior.toUpperCase()}
                    </Badge>
                    <span>→</span>
                    <Badge className={getEstadoBadgeColor(item.estado_nuevo)}>
                      {item.estado_nuevo.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {item.acciones_realizadas && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Acciones:</strong> {item.acciones_realizadas}
                  </p>
                )}
                {item.observaciones && (
                  <p className="text-sm text-gray-600">
                    <strong>Observaciones:</strong> {item.observaciones}
                  </p>
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
