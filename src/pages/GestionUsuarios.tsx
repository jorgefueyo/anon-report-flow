
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/useSupabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  UserPlus, 
  Edit, 
  UserCheck,
  UserX,
  Mail,
  Shield
} from "lucide-react";

type UserRole = 'admin' | 'supervisor' | 'viewer';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
  auth_user_id: string | null;
}

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [empresaId, setEmpresaId] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    rol: 'viewer' as UserRole,
    password: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtener empresa del usuario actual
    const { data: userData } = await supabase
      .from('usuarios_backoffice')
      .select('empresa_id, rol')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData || userData.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden gestionar usuarios",
        variant: "destructive",
      });
      navigate('/backoffice');
      return;
    }

    setEmpresaId(userData.empresa_id);

    // Cargar usuarios de la empresa
    const { data: usuariosData } = await supabase
      .from('usuarios_backoffice')
      .select('*')
      .eq('empresa_id', userData.empresa_id)
      .order('created_at', { ascending: false });

    setUsuarios(usuariosData || []);
    setLoading(false);
  };

  const createUser = async () => {
    if (!formData.email || !formData.nombre || !formData.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { 
        nombre: formData.nombre,
        force_password_reset: true 
      }
    });

    if (authError) {
      toast({
        title: "Error al crear usuario",
        description: authError.message,
        variant: "destructive",
      });
      return;
    }

    // Crear registro en usuarios_backoffice
    const { error: userError } = await supabase
      .from('usuarios_backoffice')
      .insert({
        auth_user_id: authData.user.id,
        empresa_id: empresaId,
        email: formData.email,
        nombre: formData.nombre,
        rol: formData.rol,
        activo: true
      });

    if (userError) {
      toast({
        title: "Error al crear usuario del backoffice",
        description: userError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Usuario creado",
      description: "El usuario ha sido creado exitosamente",
    });

    setFormData({
      email: '',
      nombre: '',
      rol: 'viewer',
      password: ''
    });
    setShowCreateForm(false);
    loadUsuarios();
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('usuarios_backoffice')
      .update({ rol: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rol actualizado",
      description: "El rol del usuario ha sido actualizado",
    });

    loadUsuarios();
  };

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    const { error } = await supabase
      .from('usuarios_backoffice')
      .update({ activo: newStatus })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estado actualizado",
      description: `El usuario ha sido ${newStatus ? 'activado' : 'desactivado'}`,
    });

    loadUsuarios();
  };

  const getRoleBadge = (rol: string) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
      supervisor: { color: 'bg-blue-100 text-blue-800', label: 'Supervisor' },
      viewer: { color: 'bg-gray-100 text-gray-800', label: 'Visualizador' }
    };
    
    const badge = badges[rol as keyof typeof badges] || badges.viewer;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Shield className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
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
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600">
                  Administra los usuarios del sistema y sus permisos
                </p>
              </div>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Nombre del usuario"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña Temporal</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Contraseña temporal"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        El usuario deberá cambiar esta contraseña en su primer login
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="rol">Rol</Label>
                      <Select value={formData.rol} onValueChange={(value: UserRole) => setFormData({...formData, rol: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createUser}>
                        Crear Usuario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios ({usuarios.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        {usuario.nombre}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {usuario.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(usuario.rol)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.activo ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(usuario.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select 
                            value={usuario.rol} 
                            onValueChange={(value: UserRole) => updateUserRole(usuario.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant={usuario.activo ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleUserStatus(usuario.id, !usuario.activo)}
                          >
                            {usuario.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {usuarios.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay usuarios registrados
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;
