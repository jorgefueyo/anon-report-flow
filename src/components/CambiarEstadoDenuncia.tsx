
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSeguimientoDenuncias } from "@/hooks/useSeguimientoDenuncias";

interface CambiarEstadoDenunciaProps {
  denunciaId: string;
  estadoActual: string;
  onEstadoCambiado: () => void;
}

const CambiarEstadoDenuncia = ({ denunciaId, estadoActual, onEstadoCambiado }: CambiarEstadoDenunciaProps) => {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { agregarSeguimiento } = useSeguimientoDenuncias();

  const estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'asignada', label: 'Asignada' },
    { value: 'en_tramite', label: 'En Trámite' },
    { value: 'finalizada', label: 'Finalizada' }
  ];

  const handleCambiarEstado = async () => {
    if (!nuevoEstado || nuevoEstado === estadoActual) {
      toast({
        title: "Error",
        description: "Debe seleccionar un estado diferente al actual",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Actualizar el estado de la denuncia
      const { error } = await supabase
        .from('denuncias')
        .update({ estado: nuevoEstado as any })
        .eq('id', denunciaId);

      if (error) {
        console.error('Error updating denuncia estado:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la denuncia",
          variant: "destructive",
        });
        return;
      }

      // Agregar seguimiento manual si hay observaciones adicionales
      if (observaciones.trim()) {
        await agregarSeguimiento(
          denunciaId,
          'Actualización manual',
          `Estado cambiado de ${estadoActual} a ${nuevoEstado}`,
          observaciones,
          estadoActual,
          nuevoEstado
        );
      }

      toast({
        title: "Estado actualizado",
        description: `El estado se ha cambiado a ${estados.find(e => e.value === nuevoEstado)?.label}`,
      });

      // Limpiar formulario
      setNuevoEstado('');
      setObservaciones('');
      
      // Notificar al componente padre
      onEstadoCambiado();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Estado de la Denuncia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="estadoActual">Estado Actual</Label>
          <div className="mt-1 p-2 bg-gray-100 rounded">
            {estados.find(e => e.value === estadoActual)?.label || estadoActual}
          </div>
        </div>

        <div>
          <Label htmlFor="nuevoEstado">Nuevo Estado</Label>
          <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccione un nuevo estado" />
            </SelectTrigger>
            <SelectContent>
              {estados
                .filter(estado => estado.value !== estadoActual)
                .map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Agregue observaciones sobre el cambio de estado..."
            className="mt-1"
          />
        </div>

        <Button 
          onClick={handleCambiarEstado} 
          disabled={loading || !nuevoEstado}
          className="w-full"
        >
          {loading ? "Actualizando..." : "Cambiar Estado"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CambiarEstadoDenuncia;
