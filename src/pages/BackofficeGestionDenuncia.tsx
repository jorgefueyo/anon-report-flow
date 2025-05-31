
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  ArrowLeft,
  Save,
  FileText,
  User,
  Calendar,
  MapPin
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import HistorialSeguimiento from "@/components/HistorialSeguimiento";
import { supabase } from "@/integrations/supabase/client";
import { decryptData } from "@/utils/encryption";
import { Denuncia } from "@/types/denuncia";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

type EstadoDenuncia = 'pendiente' | 'en_proceso' | 'finalizada';

const BackofficeGestionDenuncia = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoDenuncia>('pendiente');
  const [observaciones, setObservaciones] = useState("");
  const [observacionesInternas, setObservacionesInternas] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
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

      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', denunciaId)
        .single();

      if (error) {
        console.error('Error cargando denuncia:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la denuncia",
          variant: "destructive",
        });
        navigate('/backoffice/denuncias');
        return;
      }

      console.log('Denuncia cargada:', data);
      setDenuncia(data);
      setNuevoEstado(data.estado as EstadoDenuncia);
      setObservacionesInternas(data.observaciones_internas || "");
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
      console.log('Actualizando denuncia:', {
        id: denuncia.id,
        estado_anterior: denuncia.estado,
        estado_nuevo: nuevoEstado,
        observaciones_internas: observacionesInternas
      });

      const { error: updateError } = await supabase
        .from('denuncias')
        .update({
          estado: nuevoEstado,
          asignado_a: admin.id,
          observaciones_internas: observacionesInternas,
          updated_at: new Date().toISOString()
        })
        .eq('id', denuncia.id);

      if (updateError) {
        console.error('Error actualizando denuncia:', updateError);
        throw updateError;
      }

      // Solo crear seguimiento si el estado cambió
      if (denuncia.estado !== nuevoEstado) {
        const { error: seguimientoError } = await supabase
          .from('seguimiento_denuncias')
          .insert({
            denuncia_id: denuncia.id,
            usuario_id: admin.id,
            estado_anterior: denuncia.estado,
            estado_nuevo: nuevoEstado,
            operacion: 'Cambio de estado',
            acciones_realizadas: observaciones || `Estado cambiado de ${denuncia.estado} a ${nuevoEstado}`,
            observaciones: observaciones || null
          });

        if (seguimientoError) {
          console.error('Error creando seguimiento:', seguimientoError);
        }
      }

      toast({
        title: "Denuncia actualizada",
        description: "Los cambios se han guardado correctamente",
      });

      // Recargar la denuncia para mostrar los cambios
      await cargarDenuncia(denuncia.id);
      setObservaciones("");

    } catch (error) {
      console.error('Error actualizando denuncia:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la denuncia",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  const getDecryptedValue = (encryptedValue: string | null) => {
    if (!encryptedValue) return "No disponible";
    try {
      return decryptData(encryptedValue);
    } catch {
      return "Error al desencriptar";
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
            <div className="flex-1 p-6 flex items-center justify-center">
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
            <div className="flex-1 p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Denuncia no encontrada
                </h1>
                <Button onClick={() => navigate('/backoffice/denuncias')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Denuncias
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
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestión de Denuncia
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Código: {denuncia.codigo_seguimiento}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/backoffice/denuncias')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Denuncias
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la Denuncia */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Información de la Denuncia
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Estado Actual</Label>
                        <div className="mt-1">
                          <EstadoBadge estado={denuncia.estado as EstadoDenuncia} />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Categoría</Label>
                        <p className="mt-1">{denuncia.categoria || 'Sin categoría'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                        <p className="mt-1">{new Date(denuncia.created_at).toLocaleDateString('es-ES')}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Última Actualización</Label>
                        <p className="mt-1">{new Date(denuncia.updated_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Datos del Denunciante
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="mt-1">{getDecryptedValue(denuncia.email_encriptado)}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                        <p className="mt-1">{getDecryptedValue(denuncia.nombre_encriptado)}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                        <p className="mt-1">{getDecryptedValue(denuncia.telefono_encriptado)}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Domicilio</Label>
                        <p className="mt-1">{getDecryptedValue(denuncia.domicilio_encriptado)}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Relación con la Empresa</Label>
                        <p className="mt-1">{denuncia.relacion_empresa || 'No especificada'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detalles del Incidente */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Detalles del Incidente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Descripción de los Hechos</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm">{denuncia.hechos}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Fecha de los Hechos</Label>
                        <p className="mt-1">
                          {denuncia.fecha_hechos 
                            ? new Date(denuncia.fecha_hechos).toLocaleDateString('es-ES')
                            : 'No especificada'
                          }
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Lugar de los Hechos</Label>
                        <p className="mt-1">{denuncia.lugar_hechos || 'No especificado'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Testigos</Label>
                        <p className="mt-1">{denuncia.testigos || 'No especificados'}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Personas Implicadas</Label>
                        <p className="mt-1">{denuncia.personas_implicadas || 'No especificadas'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gestión del Estado */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gestión del Estado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="estado">Nuevo Estado</Label>
                        <select
                          id="estado"
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value as EstadoDenuncia)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="finalizada">Finalizada</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="observaciones">Observaciones del Cambio</Label>
                        <Textarea
                          id="observaciones"
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Describe las acciones realizadas o motivo del cambio..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="observaciones-internas">Observaciones Internas</Label>
                        <Textarea
                          id="observaciones-internas"
                          value={observacionesInternas}
                          onChange={(e) => setObservacionesInternas(e.target.value)}
                          placeholder="Notas internas sobre la denuncia..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <Button 
                        onClick={actualizarDenuncia} 
                        disabled={guardando}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {guardando ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Historial de Seguimiento */}
              <div className="mt-8">
                <HistorialSeguimiento denunciaId={denuncia.id} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeGestionDenuncia;
