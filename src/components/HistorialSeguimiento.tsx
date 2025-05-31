
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSeguimientoDenuncias } from "@/hooks/useSeguimientoDenuncias";
import { Clock, User } from "lucide-react";

interface HistorialSeguimientoProps {
  denunciaId: string;
}

const HistorialSeguimiento = ({ denunciaId }: HistorialSeguimientoProps) => {
  const { seguimientos, loading } = useSeguimientoDenuncias(denunciaId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Seguimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
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
        {seguimientos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay seguimientos registrados para esta denuncia.
          </p>
        ) : (
          <div className="space-y-4">
            {seguimientos.map((seguimiento) => (
              <div key={seguimiento.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{seguimiento.operacion}</Badge>
                    {seguimiento.estado_anterior && seguimiento.estado_nuevo && (
                      <span className="text-sm text-gray-600">
                        {seguimiento.estado_anterior} → {seguimiento.estado_nuevo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(seguimiento.fecha).toLocaleString('es-ES')}
                  </div>
                </div>
                
                {seguimiento.acciones_realizadas && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Acciones:</strong> {seguimiento.acciones_realizadas}
                  </p>
                )}
                
                {seguimiento.observaciones && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Observaciones:</strong> {seguimiento.observaciones}
                  </p>
                )}
                
                {seguimiento.usuario && (
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    {seguimiento.usuario.nombre} ({seguimiento.usuario.email})
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
