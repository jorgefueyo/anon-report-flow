
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string;
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
  created_at: string;
  updated_at: string;
}

const ConsultarDenuncia = () => {
  const [codigo, setCodigo] = useState("");
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!codigo.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de seguimiento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, categoria, estado, created_at, updated_at')
        .eq('codigo_seguimiento', codigo.trim())
        .single();

      if (error || !data) {
        setDenuncia(null);
        toast({
          title: "No encontrado",
          description: "No se encontró ninguna denuncia con ese código",
          variant: "destructive",
        });
        return;
      }

      setDenuncia(data);
    } catch (error) {
      console.error('Error searching complaint:', error);
      toast({
        title: "Error",
        description: "Error al buscar la denuncia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-500',
          description: 'Tu denuncia ha sido recibida y está pendiente de revisión.'
        };
      case 'asignada':
        return {
          label: 'Asignada',
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-blue-500',
          description: 'Tu denuncia ha sido asignada a un responsable para su investigación.'
        };
      case 'en_tramite':
        return {
          label: 'En Trámite',
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-orange-500',
          description: 'Tu denuncia está siendo investigada activamente.'
        };
      case 'finalizada':
        return {
          label: 'Finalizada',
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-500',
          description: 'La investigación de tu denuncia ha sido completada.'
        };
      default:
        return {
          label: 'Desconocido',
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-gray-500',
          description: 'Estado desconocido.'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Consultar Estado de Denuncia</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <Search className="w-6 h-6" />
              <span>Consultar Estado</span>
            </CardTitle>
            <p className="text-center text-gray-600">
              Ingresa tu código de seguimiento para consultar el estado de tu denuncia
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código de Seguimiento</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ej: DEN-ABC12345"
                  className="mt-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  "Buscando..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Consultar Estado
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {searched && (
              <div className="mt-8 pt-8 border-t">
                {denuncia ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-600 mb-2">
                        Denuncia Encontrada
                      </h3>
                      <p className="text-sm text-gray-500">
                        Código: {denuncia.codigo_seguimiento}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Estado Actual:</span>
                        <Badge className={`${getEstadoInfo(denuncia.estado).color} text-white`}>
                          {getEstadoInfo(denuncia.estado).icon}
                          <span className="ml-1">{getEstadoInfo(denuncia.estado).label}</span>
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        {getEstadoInfo(denuncia.estado).description}
                      </div>

                      {denuncia.categoria && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Categoría:</span>
                          <span className="text-sm">{denuncia.categoria}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fecha de envío:</span>
                        <span className="text-sm">{formatDate(denuncia.created_at)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Última actualización:</span>
                        <span className="text-sm">{formatDate(denuncia.updated_at)}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Recibirás notificaciones por email cuando 
                        haya cambios en el estado de tu denuncia. Mantén este código seguro 
                        para futuras consultas.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      Denuncia No Encontrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No se encontró ninguna denuncia con el código proporcionado.
                    </p>
                    <p className="text-sm text-gray-500">
                      Verifica que el código esté escrito correctamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConsultarDenuncia;
