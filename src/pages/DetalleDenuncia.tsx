
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { ArrowLeft, FileText } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import CambiarEstadoDenuncia from "@/components/CambiarEstadoDenuncia";
import HistorialSeguimiento from "@/components/HistorialSeguimiento";

interface DenunciaDetalle {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
  created_at: string;
  hechos: string;
  fecha_hechos: string | null;
  lugar_hechos: string | null;
  testigos: string | null;
  personas_implicadas: string | null;
  observaciones_internas: string | null;
  email_encriptado: string;
  nombre_encriptado: string | null;
  telefono_encriptado: string | null;
  domicilio_encriptado: string | null;
  relacion_empresa: string | null;
}

const DetalleDenuncia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<any>(null);
  const [denuncia, setDenuncia] = useState<DenunciaDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar admin
    const adminData = localStorage.getItem('backoffice_admin');
    if (!adminData) {
      navigate('/backoffice/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      loadDenuncia();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate, id]);

  const loadDenuncia = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading denuncia:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la denuncia",
          variant: "destructive",
        });
        return;
      }

      setDenuncia(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BackofficeSidebar admin={admin} activeItem="denuncias" />

        <SidebarInset>
          <BackofficeHeader admin={admin} />

          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Detalle de Denuncia
                </h1>
                <Button variant="outline" onClick={() => navigate('/backoffice/denuncias')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Denuncias
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : !denuncia ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Denuncia no encontrada
                    </h3>
                    <p className="text-gray-600">
                      La denuncia solicitada no existe o no tienes permisos para verla.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información principal */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{denuncia.codigo_seguimiento}</CardTitle>
                        <EstadoBadge estado={denuncia.estado} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                        <p className="text-gray-900">{new Date(denuncia.created_at).toLocaleString('es-ES')}</p>
                      </div>
                      
                      {denuncia.categoria && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Categoría</label>
                          <p className="text-gray-900">{denuncia.categoria}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Descripción de los Hechos</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{denuncia.hechos}</p>
                      </div>
                      
                      {denuncia.fecha_hechos && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Fecha de los Hechos</label>
                          <p className="text-gray-900">{new Date(denuncia.fecha_hechos).toLocaleDateString('es-ES')}</p>
                        </div>
                      )}
                      
                      {denuncia.lugar_hechos && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Lugar de los Hechos</label>
                          <p className="text-gray-900">{denuncia.lugar_hechos}</p>
                        </div>
                      )}
                      
                      {denuncia.testigos && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Testigos</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{denuncia.testigos}</p>
                        </div>
                      )}
                      
                      {denuncia.personas_implicadas && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Personas Implicadas</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{denuncia.personas_implicadas}</p>
                        </div>
                      )}
                      
                      {denuncia.observaciones_internas && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Observaciones Internas</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{denuncia.observaciones_internas}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Gestión del estado */}
                  <div className="space-y-6">
                    <CambiarEstadoDenuncia 
                      denunciaId={denuncia.id}
                      estadoActual={denuncia.estado}
                      onEstadoChanged={loadDenuncia}
                    />
                    
                    <HistorialSeguimiento denunciaId={denuncia.id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DetalleDenuncia;
