
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import UserManagementActions from "@/components/UserManagementActions";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
}

const BackofficeAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'visor'
  });
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
      loadUsuarios();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('administradores')
        .select('id, email, nombre, activo')
        .order('created_at', { ascending: false });

      if (data) {
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('administradores')
        .insert({
          email: newUser.email,
          nombre: newUser.nombre,
          password_hash: newUser.password, // En un entorno real, esto debería estar hasheado
          activo: true
        });

      if (error) throw error;

      toast({
        title: "Usuario creado",
        description: `Usuario ${newUser.nombre} creado correctamente`,
      });

      setNewUser({ email: '', nombre: '', password: '', rol: 'visor' });
      setShowForm(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  if (!admin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BackofficeSidebar admin={admin} activeItem="admin" />

        <SidebarInset>
          <BackofficeHeader admin={admin} />

          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Administradores del Sistema
                </h1>
                <Button onClick={() => setShowForm(!showForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

              {showForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Crear Nuevo Usuario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre Completo *</Label>
                          <Input
                            id="nombre"
                            value={newUser.nombre}
                            onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Contraseña *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="rol">Rol *</Label>
                          <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gestor">Gestor - Puede modificar denuncias</SelectItem>
                              <SelectItem value="visor">Visor - Solo puede visualizar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button type="submit">Crear Usuario</Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">
                            {usuario.nombre}
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            {usuario.activo ? (
                              <Badge className="bg-green-100 text-green-800">
                                Activo
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Inactivo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <UserManagementActions
                              userId={usuario.id}
                              userEmail={usuario.email}
                              userName={usuario.nombre}
                              onUserUpdated={loadUsuarios}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeAdmin;
