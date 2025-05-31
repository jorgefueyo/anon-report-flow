
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  SidebarProvider,
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  FileText, 
  LogOut, 
  Users, 
  BarChart3,
  Upload,
  Save
} from "lucide-react";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
  configurada: boolean | null;
}

const BackofficeEmpresa = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      loadEmpresa();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const loadEmpresa = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('cif', '12345678A')
        .single();

      if (error) {
        console.error('Error loading empresa:', error);
        // Si no existe la empresa, crear una nueva
        const { data: newEmpresa, error: createError } = await supabase
          .from('empresas')
          .insert({
            nombre: 'Mi Empresa',
            cif: '12345678A',
            direccion: '',
            email: '',
            telefono: '',
            configurada: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating empresa:', createError);
        } else {
          setEmpresa(newEmpresa);
        }
      } else {
        setEmpresa(data);
      }
    } catch (error) {
      console.error('Error loading empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nombre: empresa.nombre,
          cif: empresa.cif,
          direccion: empresa.direccion,
          email: empresa.email,
          telefono: empresa.telefono,
          configurada: true
        })
        .eq('id', empresa.id);

      if (error) throw error;

      toast({
        title: "Datos guardados",
        description: "La configuración de la empresa se ha actualizado correctamente",
      });
      
      // Actualizar el estado local
      setEmpresa({...empresa, configurada: true});
    } catch (error) {
      console.error('Error saving empresa:', error);
      toast({
        title: "Error",
        description: "Error al guardar los datos de la empresa",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('backoffice_admin');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate('/backoffice/login');
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
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold">Backoffice</h2>
                <p className="text-sm text-gray-600">{admin.nombre}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/backoffice')}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/backoffice/denuncias')}
                  className="w-full"
                >
                  <FileText className="w-4 h-4" />
                  Denuncias
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/backoffice/empresa')}
                  className="w-full bg-blue-100"
                >
                  <Building2 className="w-4 h-4" />
                  Configurar Empresa
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/backoffice/admin')}
                  className="w-full"
                >
                  <Users className="w-4 h-4" />
                  Admin. Sistema
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {admin.nombre}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Configuración de Empresa
              </h1>
              
              {empresa && (
                <form onSubmit={handleSave} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos Básicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                          <Input
                            id="nombre"
                            value={empresa.nombre}
                            onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cif">CIF/NIF *</Label>
                          <Input
                            id="cif"
                            value={empresa.cif}
                            onChange={(e) => setEmpresa({...empresa, cif: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Textarea
                          id="direccion"
                          value={empresa.direccion || ''}
                          onChange={(e) => setEmpresa({...empresa, direccion: e.target.value})}
                          placeholder="Dirección completa de la empresa"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={empresa.email || ''}
                            onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
                            placeholder="contacto@empresa.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={empresa.telefono || ''}
                            onChange={(e) => setEmpresa({...empresa, telefono: e.target.value})}
                            placeholder="123 456 789"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Logo de la Empresa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Sube el logo de tu empresa (formato JPG o PNG, tamaño máximo 400x400px)
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">Arrastra y suelta tu logo aquí</p>
                          <Button type="button" variant="outline">
                            Seleccionar archivo
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          * El logo aparecerá en la página principal del canal de denuncias
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        "Guardando..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeEmpresa;
