
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/useSupabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Clock, 
  UserCheck, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";

const GestionDenuncias = () => {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedDenuncia, setSelectedDenuncia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtener empresa del usuario
    const { data: userData } = await supabase
      .from('usuarios_backoffice')
      .select('empresa_id, rol')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) return;

    // Cargar denuncias
    const { data: denunciasData } = await supabase
      .from('denuncias')
      .select(`
        *,
        usuarios_backoffice!denuncias_asignado_a_fkey (
          nombre
        )
      `)
      .eq('empresa_id', userData.empresa_id)
      .order('created_at', { ascending: false });

    // Cargar usuarios supervisores para asignación
    const { data: usuariosData } = await supabase
      .from('usuarios_backoffice')
      .select('id, nombre, rol')
      .eq('empresa_id', userData.empresa_id)
      .in('rol', ['admin', 'supervisor'])
      .eq('activo', true);

    setDenuncias(denunciasData || []);
    setUsuarios(usuariosData || []);
    setLoading(false);
  };

  const updateEstado = async (denunciaId: string, nuevoEstado: string, asignadoA?: string) => {
    const { error } = await supabase
      .from('denuncias')
      .update({ 
        estado: nuevoEstado,
        ...(asignadoA && { asignado_a: asignadoA })
      })
      .eq('id', denunciaId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
      return;
    }

    // Registrar en historial
    await supabase
      .from('historial_estados')
      .insert({
        denuncia_id: denunciaId,
        estado_nuevo: nuevoEstado,
        comentario: `Estado actualizado a ${nuevoEstado}`
      });

    toast({
      title: "Estado actualizado",
      description: `La denuncia ha sido marcada como ${nuevoEstado}`,
    });

    loadData();
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      asignada: { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      en_tramite: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      finalizada: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const badge = badges[estado as keyof typeof badges] || badges.pendiente;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {estado.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const denunciasFiltradas = filtroEstado === 'todas' 
    ? denuncias 
    : denuncias.filter(d => d.estado === filtroEstado);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando denuncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/backoffice')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Denuncias
                </h1>
                <p className="text-gray-600">
                  Administra y da seguimiento a las denuncias recibidas
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Label htmlFor="filtro">Filtrar por estado:</Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="asignada">Asignadas</SelectItem>
                    <SelectItem value="en_tramite">En Trámite</SelectItem>
                    <SelectItem value="finalizada">Finalizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabla de Denuncias */}
          <Card>
            <CardHeader>
              <CardTitle>Denuncias ({denunciasFiltradas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Asignado a</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {denunciasFiltradas.map((denuncia) => (
                    <TableRow key={denuncia.id}>
                      <TableCell className="font-medium">
                        {denuncia.codigo_seguimiento}
                      </TableCell>
                      <TableCell>
                        {new Date(denuncia.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{denuncia.categoria || 'Sin categoría'}</TableCell>
                      <TableCell>{getEstadoBadge(denuncia.estado)}</TableCell>
                      <TableCell>
                        {denuncia.usuarios_backoffice?.nombre || 'Sin asignar'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedDenuncia(denuncia)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Detalle de Denuncia - {denuncia.codigo_seguimiento}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedDenuncia && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Estado Actual</Label>
                                      <div className="mt-1">
                                        {getEstadoBadge(selectedDenuncia.estado)}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Categoría</Label>
                                      <p className="mt-1">{selectedDenuncia.categoria}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Descripción de los Hechos</Label>
                                    <p className="mt-1 p-3 bg-gray-50 rounded">
                                      {selectedDenuncia.hechos}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Fecha de los Hechos</Label>
                                      <p className="mt-1">{selectedDenuncia.fecha_hechos || 'No especificada'}</p>
                                    </div>
                                    <div>
                                      <Label>Lugar</Label>
                                      <p className="mt-1">{selectedDenuncia.lugar_hechos || 'No especificado'}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedDenuncia.testigos && (
                                    <div>
                                      <Label>Testigos</Label>
                                      <p className="mt-1 p-3 bg-gray-50 rounded">
                                        {selectedDenuncia.testigos}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-4">Gestionar Denuncia</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Cambiar Estado</Label>
                                        <Select 
                                          value={selectedDenuncia.estado}
                                          onValueChange={(valor) => updateEstado(selectedDenuncia.id, valor)}
                                        >
                                          <SelectTrigger className="mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="asignada">Asignada</SelectItem>
                                            <SelectItem value="en_tramite">En Trámite</SelectItem>
                                            <SelectItem value="finalizada">Finalizada</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Asignar a</Label>
                                        <Select 
                                          value={selectedDenuncia.asignado_a || ''}
                                          onValueChange={(valor) => updateEstado(selectedDenuncia.id, 'asignada', valor)}
                                        >
                                          <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Seleccionar usuario" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {usuarios.map((usuario) => (
                                              <SelectItem key={usuario.id} value={usuario.id}>
                                                {usuario.nombre} ({usuario.rol})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {denunciasFiltradas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay denuncias {filtroEstado !== 'todas' ? `en estado ${filtroEstado}` : ''}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GestionDenuncias;
