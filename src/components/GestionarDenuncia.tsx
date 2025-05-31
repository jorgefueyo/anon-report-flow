
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Denuncia } from "@/types/denuncia";
import { useDenuncias } from "@/hooks/useDenuncias";
import { CheckCircle, Clock, AlertCircle, User } from "lucide-react";

interface GestionarDenunciaProps {
  denuncia: Denuncia;
  onDenunciaActualizada: (denuncia: Denuncia) => void;
}

const GestionarDenuncia = ({ denuncia, onDenunciaActualizada }: GestionarDenunciaProps) => {
  const [nuevoEstado, setNuevoEstado] = useState(denuncia.estado);
  const [observaciones, setObservaciones] = useState(denuncia.observaciones_internas || '');
  const { actualizarEstadoDenuncia, loading } = useDenuncias();

  const handleActualizarEstado = async () => {
    if (nuevoEstado === denuncia.estado && observaciones === (denuncia.observaciones_internas || '')) {
      return; // No hay cambios
    }

    // Mapear estado de la UI al estado de la base de datos
    let estadoParaDB = nuevoEstado;
    if (nuevoEstado === 'en_tramite') {
      estadoParaDB = 'en_proceso';
    }

    const exito = await actualizarEstadoDenuncia(denuncia.id, estadoParaDB, observaciones);
    if (exito) {
      // Actualizar la denuncia local
      const denunciaActualizada = {
        ...denuncia,
        estado: estadoParaDB,
        observaciones_internas: observaciones,
        updated_at: new Date().toISOString()
      };
      onDenunciaActualizada(denunciaActualizada);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'asignada':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'en_proceso':
      case 'en_tramite':
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
      case 'en_tramite':
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
        return 'EN TRÁMITE';
      case 'en_tramite':
        return 'EN TRÁMITE';
      case 'finalizada':
        return 'FINALIZADA';
      default:
        return estado.toUpperCase();
    }
  };

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
              <SelectItem value="en_proceso">En trámite</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="observaciones">Observaciones internas</Label>
          <Textarea
            id="observaciones"
            placeholder="Añade observaciones sobre la gestión de esta denuncia..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="min-h-24"
          />
        </div>

        <Button 
          onClick={handleActualizarEstado}
          disabled={loading || (nuevoEstado === denuncia.estado && observaciones === (denuncia.observaciones_internas || ''))}
          className="w-full"
        >
          {loading ? 'Actualizando...' : 'Actualizar Denuncia'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GestionarDenuncia;
