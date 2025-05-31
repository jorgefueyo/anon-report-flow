
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users,
  Paperclip
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import FileUpload from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { Denuncia, SeguimientoDenuncia, DenunciaArchivo } from "@/types/denuncia";
import { useAdministradores } from "@/hooks/useAdministradores";
import { useDenuncias } from "@/hooks/useDenuncias";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface Administrador {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
}

const BackofficeGestionDenuncia = () => {
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [seguimientos, setSeguimientos] = useState<SeguimientoDenuncia[]>([]);
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [archivos, setArchivos] = useState<DenunciaArchivo[]>([]);
  const [nuevosArchivos, setNuevosArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<'pendiente' | 'en_proceso' | 'finalizada'>('pendiente');
  const [administradorAsignado, setAdministradorAsignado] = useState<string>("unassigned");
  const [observaciones, setObservaciones] = useState("");
  const [accionesRealizadas, setAccionesRealizadas] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { obtenerAdministradores } = useAdministradores();
  const { obtenerArchivosDenuncia } = useDenuncias();

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
        cargarDatos(id);
      }
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate, id]);

  const cargarDatos = async (denunciaId: string) => {
    try {
      setLoading(true);
      console.log('Cargando datos para denuncia:', denunciaId);

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
      setAdministradorAsignado(denunciaData.asignado_a || "unassigned");

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

      // Cargar administradores
      const adminsList = await obtenerAdministradores();
      setAdministradores(adminsList);

      // Cargar archivos existentes
      const archivosExistentes = await obtenerArchivosDenuncia(denunciaId);
      setArchivos(archivosExistentes);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subirNuevosArchivos = async (denunciaId: string, archivos: File[]) => {
    for (const archivo of archivos) {
      try {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const nombreArchivo = `${timestamp}-${archivo.name}`;
        const rutaArchivo = `${denunciaId}/${nombreArchivo}`;

        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('denuncia-attachments')
          .upload(rutaArchivo, archivo);

        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          continue;
        }

        // Guardar metadata del archivo en la base de datos
        const { error: metadataError } = await supabase
          .from('denuncia_archivos')
          .insert({
            denuncia_id: denunciaId,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaArchivo,
            tipo_archivo: archivo.type,
            tamano_archivo: archivo.size,
          });

        if (metadataError) {
          console.error('Error guardando metadata del archivo:', metadataError);
        }
      } catch (error) {
        console.error('Error procesando archivo:', archivo.name, error);
      }
    }
  };

  const actualizarDenuncia = async () => {
    if (!denuncia || !admin) return;

    try {
      setGuardando(true);
      console.log('Actualizando denuncia...');

      const estadoAnterior = denuncia.estado;
      const asignadoAnterior = denuncia.asignado_a;
      const nuevoAsignadoId = administradorAsignado === "unassigned" ? null : administradorAsignado;
      const cambioEstado = estadoAnterior !== nuevoEstado;
      const cambioAsignacion = asignadoAnterior !== nuevoAsignadoId;

      // Actualizar denuncia
      const { error: updateError } = await supabase
        .from('denuncias')
        .update({
          estado: nuevoEstado,
          asignado_a: nuevoAsignadoId,
          observaciones_internas: observaciones.trim() || denuncia.observaciones_internas,
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

      // Subir nuevos archivos si existen
      if (nuevosArchivos.length > 0) {
        await subirNuevosArchivos(denuncia.id, nuevosArchivos);
        setNuevosArchivos([]);
      }

      // Crear registro de seguimiento si hay cambios
      if (cambioEstado || cambioAsignacion || accionesRealizadas.trim()) {
        let operacion = 'Actualización';
        if (cambioEstado && cambioAsignacion) {
          operacion = 'Cambio de estado y asignación';
        } else if (cambioEstado) {
          operacion = 'Cambio de estado';
        } else if (cambioAsignacion) {
          operacion = 'Cambio de asignación';
        }

        console.log('Creando seguimiento con datos:', {
          denuncia_id: denuncia.id,
          usuario_id: admin.id,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado,
          operacion: operacion,
          acciones_realizadas: accionesRealizadas.trim() || null,
          observaciones: observaciones.trim() || null,
        });

        const { error: seguimientoError } = await supabase
          .from('seguimiento_denuncias')
          .insert({
            denuncia_id: denuncia.id,
            usuario_id: admin.id,
            estado_anterior: estadoAnterior,
            estado_nuevo: nuevoEstado,
            operacion: operacion,
            acciones_realizadas: accionesRealizadas.trim() || null,
            observaciones: observaciones.trim() || null,
          });

        if (seguimientoError) {
          console.error('Error creando seguimiento:', seguimientoError);
        } else {
          console.log('Seguimiento creado exitosamente');
        }
      }

      toast({
        title: "Éxito",
        description: "Denuncia actualizada correctamente",
      });

      // Recargar datos
      await cargarDatos(denuncia.id);
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

  const getNombreAdministrador = (adminId: string) => {
    const admin = administradores.find(a => a.id === adminId);
    return admin ? admin.nombre : 'Sin asignar';
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
                {/* Información de la denuncia - SIN DATOS SENSIBLES */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Información de la Denuncia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-semibold">Código de seguimiento:</Label>
                      <p className="text-sm text-gray-600">
                        {denuncia.codigo_seguimiento}
                      </p>
                    </div>

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

                    <div>
                      <Label className="font-semibold">Estado:</Label>
                      <div className="mt-1">
                        <EstadoBadge estado={denuncia.estado} />
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold">Asignado a:</Label>
                      <p className="text-sm text-gray-600">
                        {denuncia.asignado_a ? getNombreAdministrador(denuncia.asignado_a) : 'Sin asignar'}
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

              {/* Archivos existentes */}
              {archivos.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Paperclip className="w-5 h-5 mr-2" />
                      Archivos Adjuntos ({archivos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {archivos.map((archivo) => (
                        <div key={archivo.id} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{archivo.nombre_archivo}</p>
                              <p className="text-xs text-gray-500">
                                {archivo.tamano_archivo ? `${(archivo.tamano_archivo / 1024).toFixed(1)} KB` : 'Tamaño desconocido'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gestión de la denuncia */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Gestión de la Denuncia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estado">Estado de la denuncia</Label>
                      <Select value={nuevoEstado} onValueChange={(value) => setNuevoEstado(value as 'pendiente' | 'en_proceso' | 'finalizada')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="finalizada">Finalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="asignado">Asignado a</Label>
                      <Select value={administradorAsignado} onValueChange={setAdministradorAsignado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar administrador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Sin asignar</SelectItem>
                          {administradores.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.nombre} ({admin.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

                  <div>
                    <Label>Adjuntar nuevos archivos</Label>
                    <FileUpload 
                      files={nuevosArchivos}
                      onFilesChange={setNuevosArchivos}
                      maxFiles={5}
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
