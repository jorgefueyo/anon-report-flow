
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, UserPlus, Edit, Trash2 } from "lucide-react";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    nombre: "",
    rol: "viewer",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtener datos del usuario actual
    const { data: userData } = await supabase
      .from('usuarios_backoffice')
      .select('*')
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

    setCurrentUser(userData);

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
    if (!newUser.email || !newUser.nombre || !newUser.password) {
      toast({
        title: "Campos requeridos",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: { force_password_reset: true }
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

      if (!authData.user) {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario",
          variant: "destructive",
        });
        return;
      }

      // Crear registro en usuarios_backoffice
      const { error: userError } = await supabase
        .from('usuarios_backoffice')
        .insert({
          auth_user_id: authData.user.id,
          empresa_id: currentUser.empresa_id,
          email: newUser.email,
          nombre: newUser.nombre,
          rol: newUser.rol,
          activo: true
        });

      if (userError) {
        toast({
          title: "Error al crear usuario",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuario creado",
        description: `Se ha creado el usuario ${newUser.email}`,
      });

      setShowCreateDialog(false);
      setNewUser({ email: "", nombre: "", rol: "viewer", password: "" });
      loadUsers();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el usuario",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, activo: boolean) => {
    const { error } = await supabase
      .from('usuarios_backoffice')
      .update({ activo })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estado actualizado",
      description: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
    });

    loadUsers();
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('usuarios_backoffice')
      .update({ rol: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rol actualizado",
      description: "El rol del usuario ha sido actualizado correctamente",
    });

    loadUsers();
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                  Administra los usuarios de tu empresa
                </p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombre">Nombre completo</Label>
                      <Input
                        id="nombre"
                        value={newUser.nombre}
                        onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                        placeholder="Nombre del usuario"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña temporal</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rol">Rol</Label>
                      <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
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
                    <Button onClick={createUser} className="w-full">
                      Crear Usuario
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios ({usuarios.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={usuario.rol}
                          onValueChange={(value) => updateUserRole(usuario.id, value)}
                          disabled={usuario.id === currentUser.id}
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
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={usuario.activo}
                          onCheckedChange={(checked) => toggleUserStatus(usuario.id, checked)}
                          disabled={usuario.id === currentUser.id}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(usuario.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={usuario.id === currentUser.id}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;
