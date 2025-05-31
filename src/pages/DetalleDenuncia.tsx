
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import CambiarEstadoDenuncia from "@/components/CambiarEstadoDenuncia";
import HistorialSeguimiento from "@/components/HistorialSeguimiento";

interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
  created_at: string;
  updated_at: string;
  hechos: string;
  fecha_hechos: string | null;
  lugar_hechos: string | null;
  testigos: string | null;
  personas_implicadas: string | null;
  relacion_empresa: string | null;
  observaciones_internas: string | null;
}

const DetalleDenuncia = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDenuncia = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "No se pudo cargar la denuncia",
          variant: "destructive",
        });
        navigate('/backoffice/denuncias');
        return;
      }

      setDenuncia(data);
    } catch (error) {
      console.error('Error loading denuncia:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDenuncia();
  }, [id]);

  const getEstadoBadge = (estado: string) => {
    const estados = {
      'pendiente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'asignada': { color: 'bg-blue-100 text-blue-800', text: 'Asignada' },
      'en_tramite': { color: 'bg-orange-100 text-orange-800', text: 'En Trámite' },
      'finalizada': { color: 'bg-green-100 text-green-800', text: 'Finalizada' }
    };
    
    const estadoInfo = estados[estado as keyof typeof estados] || estados.pendiente;
    
    return (
      <Badge className={estadoInfo.color}>
        {estadoInfo.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Denuncia no encontrada</h2>
          <Button onClick={() => navigate('/backoffice/denuncias')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Denuncias
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/backoffice/denuncias')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalle de Denuncia
            </h1>
          </div>
          {getEstadoBadge(denuncia.estado)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de la denuncia */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código</label>
                    <p className="font-semibold">{denuncia.codigo_seguimiento}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Categoría</label>
                    <p>{denuncia.categoria || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                    <p>{new Date(denuncia.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Relación con Empresa</label>
                    <p>{denuncia.relacion_empresa || 'No especificada'}</p>
                  </div>
                </div>
                
                {denuncia.fecha_hechos && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de los Hechos</label>
                    <p>{new Date(denuncia.fecha_hechos).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
                
                {denuncia.lugar_hechos && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Lugar de los Hechos</label>
                    <p>{denuncia.lugar_hechos}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción de los Hechos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{denuncia.hechos}</p>
              </CardContent>
            </Card>

            {denuncia.testigos && (
              <Card>
                <CardHeader>
                  <CardTitle>Testigos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{denuncia.testigos}</p>
                </CardContent>
              </Card>
            )}

            {denuncia.personas_implicadas && (
              <Card>
                <CardHeader>
                  <CardTitle>Personas Implicadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{denuncia.personas_implicadas}</p>
                </CardContent>
              </Card>
            )}

            {denuncia.observaciones_internas && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones Internas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{denuncia.observaciones_internas}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel de seguimiento */}
          <div className="space-y-6">
            <CambiarEstadoDenuncia 
              denunciaId={denuncia.id}
              estadoActual={denuncia.estado}
              onEstadoCambiado={loadDenuncia}
            />
            
            <HistorialSeguimiento denunciaId={denuncia.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleDenuncia;
