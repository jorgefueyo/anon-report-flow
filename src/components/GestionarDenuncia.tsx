
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Denuncia } from "@/types/denuncia";
import { useDenuncias } from "@/hooks/useDenuncias";
import { CheckCircle, Clock, AlertCircle, User, Loader2 } from "lucide-react";

interface GestionarDenunciaProps {
  denuncia: Denuncia;
  onDenunciaActualizada: (denuncia: Denuncia) => void;
}

const GestionarDenuncia = ({ denuncia, onDenunciaActualizada }: GestionarDenunciaProps) => {
  const [nuevoEstado, setNuevoEstado] = useState(denuncia.estado);
  const [observaciones, setObservaciones] = useState('');
  const { actualizarEstadoDenuncia, loading } = useDenuncias();

  const handleActualizarEstado = useCallback(async () => {
    if (!observaciones.trim() && nuevoEstado === denuncia.estado) {
      return; // No hacer nada si no hay cambios
    }

    console.log('Iniciando actualización:', { denunciaId: denuncia.id, nuevoEstado, observaciones });

    const exito = await actualizarEstadoDenuncia(denuncia.id, nuevoEstado, observaciones.trim());
    
    if (exito) {
      console.log('Actualización exitosa');
      // Actualizar la denuncia local
      const denunciaActualizada = {
        ...denuncia,
        estado: nuevoEstado,
        observaciones_internas: denuncia.observaciones_internas || '',
        updated_at: new Date().toISOString()
      };
      onDenunciaActualizada(denunciaActualizada);
      
      // Limpiar el campo de observaciones después de guardar
      setObservaciones('');
    }
  }, [denuncia, nuevoEstado, observaciones, actualizarEstadoDenuncia, onDenunciaActualizada]);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'asignada':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'en_proceso':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'finalizada':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
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

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'PENDIENTE';
      case 'asignada':
        return 'ASIGNADA';
      case 'en_proceso':
        return 'EN PROCESO';
      case 'finalizada':
        return 'FINALIZADA';
      default:
        return estado.toUpperCase();
    }
  };

  const isButtonDisabled = loading || (!observaciones.trim() && nuevoEstado === denuncia.estado);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getEstadoIcon(denuncia.estado)}
          Gestionar Denuncia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="estado-actual">Estado actual</Label>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getEstadoColor(denuncia.estado)}`}>
            {getEstadoLabel(denuncia.estado)}
          </div>
        </div>

        <div>
          <Label htmlFor="nuevo-estado">Cambiar estado</Label>
          <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="asignada">Asignada</SelectItem>
              <SelectItem value="en_proceso">En proceso</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="observaciones">Nuevas observaciones</Label>
          <Textarea
            id="observaciones"
            placeholder="Añade observaciones sobre esta gestión..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="min-h-24"
          />
          <p className="text-xs text-gray-500 mt-1">
            Estas observaciones se añadirán al historial de seguimiento
          </p>
        </div>

        {denuncia.observaciones_internas && (
          <div>
            <Label>Observaciones internas previas</Label>
            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 border">
              {denuncia.observaciones_internas}
            </div>
          </div>
        )}

        <Button 
          onClick={handleActualizarEstado}
          disabled={isButtonDisabled}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Actualizando...
            </>
          ) : (
            'Actualizar Denuncia'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GestionarDenuncia;
