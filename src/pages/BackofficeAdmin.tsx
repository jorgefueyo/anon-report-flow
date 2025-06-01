import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  Eye,
  EyeOff,
  Plus,
  CheckCircle,
  Ban
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import { supabase } from "@/integrations/supabase/client";

interface Admin {
  id: string;
  email: string;
  nombre: string;
  empresa_id: string;
  activo: boolean;
}

const BackofficeAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [administradores, setAdministradores] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCrear, setLoadingCrear] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({ email: '', nombre: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminId = sessionStorage.getItem('adminId');
    if (!adminId) {
      navigate('/backoffice/login');
      return;
    }

    // Get admin data from session
    const adminData = localStorage.getItem('backoffice_admin');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    cargarAdministradores();
  }, [navigate]);

  const cargarAdministradores = async () => {
    try {
      setLoading(true);
      console.log('Cargando administradores...');

      const { data, error } = await supabase
        .from('administradores')
        .select('id, email, nombre, empresa_id, activo')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error cargando administradores:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los administradores",
          variant: "destructive",
        });
        return;
      }

      console.log('Administradores cargados:', data);
      setAdministradores((data || []) as Admin[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar administradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearAdministrador = async (datos: { email: string; nombre: string; password: string }) => {
    setLoadingCrear(true);
    try {
      // Get the current admin's empresa_id
      const adminId = sessionStorage.getItem('adminId');
      if (!adminId) {
        throw new Error('No hay sesión de administrador activa');
      }

      // Get current admin's company
      const { data: currentAdmin, error: adminError } = await supabase
        .from('administradores')
        .select('empresa_id')
        .eq('id', adminId)
        .single();

      if (adminError || !currentAdmin) {
        throw new Error('No se pudo obtener la información del administrador actual');
      }

      const hashedPassword = btoa(datos.password);

      const { data, error } = await supabase
        .from('administradores')
        .insert({
          email: datos.email.toLowerCase(),
          nombre: datos.nombre,
          password_hash: hashedPassword,
          empresa_id: currentAdmin.empresa_id, // Add the required empresa_id
          activo: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando administrador:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Administrador creado",
        description: `${datos.nombre} ha sido añadido como administrador`,
      });

      setMostrarFormulario(false);
      setNuevoAdmin({ email: '', nombre: '', password: '' });
      cargarAdministradores();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el administrador",
        variant: "destructive",
      });
    } finally {
      setLoadingCrear(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('administradores')
        .update({ activo: !currentStatus })
        .eq('id', adminId);

      if (error) {
        console.error('Error toggling admin status:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Estado actualizado",
        description: `Administrador ${currentStatus ? 'desactivado' : 'activado'} correctamente`,
      });

      cargarAdministradores();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el estado del administrador",
        variant: "destructive",
      });
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
        <BackofficeSidebar admin={admin} activeItem="administradores" />
        
        <SidebarInset>
          <BackofficeHeader admin={admin} />

          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Administradores
                </h1>
                <Button onClick={cargarAdministradores} disabled={loading}>
                  {loading ? "Cargando..." : "Actualizar"}
                </Button>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    Administradores ({administradores.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
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
                        {administradores.map((adminItem) => (
                          <TableRow key={adminItem.id}>
                            <TableCell className="font-medium">
                              {adminItem.nombre}
                            </TableCell>
                            <TableCell>{adminItem.email}</TableCell>
                            <TableCell>
                              {adminItem.activo ? (
                                <div className="flex items-center text-green-500">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Activo
                                </div>
                              ) : (
                                <div className="flex items-center text-red-500">
                                  <Ban className="w-4 h-4 mr-1" />
                                  Inactivo
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAdminStatus(adminItem.id, adminItem.activo)}
                              >
                                {adminItem.activo ? "Desactivar" : "Activar"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Añadir Administrador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {mostrarFormulario ? "Cancelar" : "Añadir Nuevo"}
                  </Button>

                  {mostrarFormulario && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await crearAdministrador(nuevoAdmin);
                      }}
                      className="space-y-4 mt-4"
                    >
                      <div>
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={nuevoAdmin.email}
                          onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input
                          id="nombre"
                          type="text"
                          value={nuevoAdmin.nombre}
                          onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={nuevoAdmin.password}
                            onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, password: e.target.value })}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" disabled={loadingCrear}>
                        {loadingCrear ? "Creando..." : "Crear Administrador"}
                      </Button>
                    </form>
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

export default BackofficeAdmin;
