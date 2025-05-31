
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, FileText, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'en_proceso' | 'finalizada';
  created_at: string;
  updated_at: string;
}

interface SeguimientoDenuncia {
  id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  operacion: string;
  acciones_realizadas: string | null;
  created_at: string;
}

const ConsultarDenuncia = () => {
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoDenuncia[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const buscarDenuncia = async () => {
    if (!codigoSeguimiento.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de seguimiento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, categoria, estado, created_at, updated_at')
        .eq('codigo_seguimiento', codigoSeguimiento.trim())
        .single();

      if (error || !data) {
        toast({
          title: "No encontrado",
          description: "No se encontró ninguna denuncia con ese código",
          variant: "destructive",
        });
        setDenuncia(null);
        setSeguimientos([]);
        return;
      }

      // Cast del estado para asegurar tipo correcto
      const denunciaTyped: Denuncia = {
        ...data,
        estado: data.estado as 'pendiente' | 'en_proceso' | 'finalizada'
      };

      setDenuncia(denunciaTyped);

      // Cargar el historial de seguimiento
      const { data: seguimientosData, error: seguimientosError } = await supabase
        .from('seguimiento_denuncias')
        .select('id, estado_anterior, estado_nuevo, operacion, acciones_realizadas, created_at')
        .eq('denuncia_id', data.id)
        .order('created_at', { ascending: false });

      if (seguimientosError) {
        console.error('Error cargando seguimientos:', seguimientosError);
        setSeguimientos([]);
      } else {
        setSeguimientos(seguimientosData || []);
      }

      toast({
        title: "Denuncia encontrada",
        description: "Se encontró la denuncia correspondiente",
      });
    } catch (error) {
      console.error('Error al buscar denuncia:', error);
      toast({
        title: "Error",
        description: "Error al buscar la denuncia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'en_proceso': { color: 'bg-blue-100 text-blue-800', text: 'En Proceso' },
      'finalizada': { color: 'bg-green-100 text-green-800', text: 'Finalizada' }
    };
    
    const estadoInfo = estados[estado as keyof typeof estados] || estados.pendiente;
    
    return (
      <Badge className={estadoInfo.color}>
        {estadoInfo.text}
      </Badge>
    );
  };

  const getEstadoTexto = (estado: string) => {
    const estados = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'finalizada': 'Finalizada'
    };
    return estados[estado as keyof typeof estados] || estado;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AppHeader />

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Consultar Estado de Denuncia
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Ingresa tu código de seguimiento para conocer el estado de tu denuncia
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="codigo">Código de Seguimiento</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="codigo"
                  value={codigoSeguimiento}
                  onChange={(e) => setCodigoSeguimiento(e.target.value)}
                  placeholder="Ej: DEN-ABC12345"
                  className="flex-1"
                />
                <Button onClick={buscarDenuncia} disabled={loading}>
                  {loading ? (
                    "Buscando..."
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {denuncia && (
              <div className="space-y-6">
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="w-5 h-5 mr-2" />
                      Información de la Denuncia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Código</Label>
                        <p className="font-semibold">{denuncia.codigo_seguimiento}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Estado</Label>
                        <div className="mt-1">
                          {getEstadoBadge(denuncia.estado)}
                        </div>
                      </div>
                    </div>
                    
                    {denuncia.categoria && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Categoría</Label>
                        <p>{denuncia.categoria}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                      <p>{new Date(denuncia.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última Actualización</Label>
                      <p>{new Date(denuncia.updated_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Historial de seguimiento */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="w-5 h-5 mr-2" />
                      Historial de Seguimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {seguimientos.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No hay registros de seguimiento disponibles
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {seguimientos.map((seguimiento) => (
                          <div key={seguimiento.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {seguimiento.operacion}
                                </Badge>
                                {seguimiento.estado_anterior && seguimiento.estado_nuevo && (
                                  <p className="text-sm text-gray-600">
                                    Estado: {getEstadoTexto(seguimiento.estado_anterior)} → {getEstadoTexto(seguimiento.estado_nuevo)}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(seguimiento.created_at).toLocaleString('es-ES')}
                              </span>
                            </div>
                            
                            {seguimiento.acciones_realizadas && (
                              <div>
                                <Label className="text-xs font-semibold">Acciones realizadas:</Label>
                                <p className="text-sm text-gray-700">{seguimiento.acciones_realizadas}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="text-center space-x-4">
              <Button variant="link" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Página Principal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultarDenuncia;
