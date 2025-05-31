
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  ArrowLeft,
  Save,
  FileText,
  Calendar,
  User,
  MapPin,
  Users
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import { supabase } from "@/integrations/supabase/client";
import { decryptData } from "@/utils/encryption";
import { Denuncia, SeguimientoDenuncia } from "@/types/denuncia";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

const BackofficeGestionDenuncia = () => {
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoDenuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<'pendiente' | 'en_proceso' | 'finalizada'>('pendiente');
  const [observaciones, setObservaciones] = useState("");
  const [accionesRealizadas, setAccionesRealizadas] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si hay admin logueado
    const adminData = localStorage.getItem('backoffice_admin');
    if (!adminData) {
      navigate('/backoffice/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      if (id) {
        cargarDenuncia(id);
      }
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate, id]);

  const cargarDenuncia = async (denunciaId: string) => {
    try {
      setLoading(true);
      console.log('Cargando denuncia:', denunciaId);

      // Cargar denuncia
      const { data: denunciaData, error: denunciaError } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', denunciaId)
        .single();

      if (denunciaError) {
        console.error('Error cargando denuncia:', denunciaError);
        toast({
          title: "Error",
          description: "No se pudo cargar la denuncia",
          variant: "destructive",
        });
        navigate('/backoffice/denuncias');
        return;
      }

      setDenuncia(denunciaData);
      setNuevoEstado(denunciaData.estado);

      // Cargar seguimientos
      const { data: seguimientosData, error: seguimientosError } = await supabase
        .from('seguimiento_denuncias')
        .select('*')
        .eq('denuncia_id', denunciaId)
        .order('created_at', { ascending: false });

      if (seguimientosError) {
        console.error('Error cargando seguimientos:', seguimientosError);
      } else {
        setSeguimientos(seguimientosData || []);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar la denuncia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const actualizarDenuncia = async () => {
    if (!denuncia || !admin) return;

    try {
      setGuardando(true);
      console.log('Actualizando denuncia...');

      const estadoAnterior = denuncia.estado;
      const cambioEstado = estadoAnterior !== nuevoEstado;

      // Actualizar denuncia
      const { error: updateError } = await supabase
        .from('denuncias')
        .update({
          estado: nuevoEstado,
          asignado_a: admin.id,
          observaciones_internas: observaciones || denuncia.observaciones_internas,
        })
        .eq('id', denuncia.id);

      if (updateError) {
        console.error('Error actualizando denuncia:', updateError);
        toast({
          title: "Error",
          description: "No se pudo actualizar la denuncia",
          variant: "destructive",
        });
        return;
      }

      // Crear registro de seguimiento si hay cambios
      if (cambioEstado || accionesRealizadas.trim()) {
        const { error: seguimientoError } = await supabase
          .from('seguimiento_denuncias')
          .insert({
            denuncia_id: denuncia.id,
            usuario_id: admin.id,
            estado_anterior: estadoAnterior,
            estado_nuevo: nuevoEstado,
            operacion: cambioEstado ? 'Cambio de estado' : 'Actualización',
            acciones_realizadas: accionesRealizadas.trim() || null,
            observaciones: observaciones.trim() || null,
          });

        if (seguimientoError) {
          console.error('Error creando seguimiento:', seguimientoError);
        }
      }

      toast({
        title: "Éxito",
        description: "Denuncia actualizada correctamente",
      });

      // Recargar datos
      await cargarDenuncia(denuncia.id);
      setAccionesRealizadas("");
      setObservaciones("");

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  const getDataDesencriptada = (dataEncriptada: string | null) => {
    if (!dataEncriptada) return "No disponible";
    try {
      return decryptData(dataEncriptada);
    } catch {
      return "Dato no disponible";
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <BackofficeSidebar admin={admin} activeItem="denuncias" />
          <SidebarInset>
            <BackofficeHeader admin={admin} />
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!denuncia) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <BackofficeSidebar admin={admin} activeItem="denuncias" />
          <SidebarInset>
            <BackofficeHeader admin={admin} />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Denuncia no encontrada</h2>
                <Button onClick={() => navigate('/backoffice/denuncias')}>
                  Volver a denuncias
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
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
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/backoffice/denuncias')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Denuncia: {denuncia.codigo_seguimiento}
                </h1>
                <EstadoBadge estado={denuncia.estado} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Información de la denuncia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Información de la Denuncia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-semibold">Email del denunciante:</Label>
                      <p className="text-sm text-gray-600">
                        {getDataDesencriptada(denuncia.email_encriptado)}
                      </p>
                    </div>
                    
                    {denuncia.nombre_encriptado && (
                      <div>
                        <Label className="font-semibold">Nombre:</Label>
                        <p className="text-sm text-gray-600">
                          {getDataDesencriptada(denuncia.nombre_encriptado)}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="font-semibold">Categoría:</Label>
                      <p className="text-sm text-gray-600">
                        {denuncia.categoria || 'Sin categoría'}
                      </p>
                    </div>

                    <div>
                      <Label className="font-semibold">Relación con la empresa:</Label>
                      <p className="text-sm text-gray-600">
                        {denuncia.relacion_empresa || 'No especificada'}
                      </p>
                    </div>

                    <div>
                      <Label className="font-semibold">Fecha de creación:</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(denuncia.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalles de los hechos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Detalles de los Hechos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {denuncia.fecha_hechos && (
                      <div>
                        <Label className="font-semibold">Fecha de los hechos:</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(denuncia.fecha_hechos).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}

                    {denuncia.lugar_hechos && (
                      <div>
                        <Label className="font-semibold">Lugar de los hechos:</Label>
                        <p className="text-sm text-gray-600">{denuncia.lugar_hechos}</p>
                      </div>
                    )}

                    {denuncia.personas_implicadas && (
                      <div>
                        <Label className="font-semibold">Personas implicadas:</Label>
                        <p className="text-sm text-gray-600">{denuncia.personas_implicadas}</p>
                      </div>
                    )}

                    {denuncia.testigos && (
                      <div>
                        <Label className="font-semibold">Testigos:</Label>
                        <p className="text-sm text-gray-600">{denuncia.testigos}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Descripción de los hechos */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Descripción de los Hechos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{denuncia.hechos}</p>
                </CardContent>
              </Card>

              {/* Gestión de la denuncia */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Gestión de la Denuncia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="estado">Estado de la denuncia</Label>
                    <select
                      id="estado"
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value as 'pendiente' | 'en_proceso' | 'finalizada')}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="acciones">Acciones realizadas</Label>
                    <Textarea
                      id="acciones"
                      value={accionesRealizadas}
                      onChange={(e) => setAccionesRealizadas(e.target.value)}
                      placeholder="Describe las acciones llevadas a cabo..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones internas</Label>
                    <Textarea
                      id="observaciones"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas internas sobre el caso..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={actualizarDenuncia} disabled={guardando}>
                    <Save className="w-4 h-4 mr-2" />
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </CardContent>
              </Card>

              {/* Historial de seguimiento */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Seguimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  {seguimientos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay registros de seguimiento
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {seguimientos.map((seguimiento) => (
                        <div key={seguimiento.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {seguimiento.operacion}
                              </Badge>
                              {seguimiento.estado_anterior && seguimiento.estado_nuevo && (
                                <p className="text-sm text-gray-600">
                                  Estado: {seguimiento.estado_anterior} → {seguimiento.estado_nuevo}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(seguimiento.created_at).toLocaleString('es-ES')}
                            </span>
                          </div>
                          
                          {seguimiento.acciones_realizadas && (
                            <div className="mb-2">
                              <Label className="text-xs font-semibold">Acciones realizadas:</Label>
                              <p className="text-sm text-gray-700">{seguimiento.acciones_realizadas}</p>
                            </div>
                          )}
                          
                          {seguimiento.observaciones && (
                            <div>
                              <Label className="text-xs font-semibold">Observaciones:</Label>
                              <p className="text-sm text-gray-700">{seguimiento.observaciones}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeGestionDenuncia;
