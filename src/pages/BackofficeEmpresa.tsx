
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useEmpresa } from "@/hooks/useEmpresa";
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

interface EmpresaFormData {
  nombre: string;
  cif: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  email: string;
  telefono: string;
}

const BackofficeEmpresa = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { empresa, loading, updateEmpresa } = useEmpresa();

  const form = useForm<EmpresaFormData>({
    defaultValues: {
      nombre: '',
      cif: '',
      direccion: '',
      codigo_postal: '',
      ciudad: '',
      provincia: '',
      pais: 'España',
      email: '',
      telefono: '',
    }
  });

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
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (empresa) {
      form.reset({
        nombre: empresa.nombre || '',
        cif: empresa.cif || '',
        direccion: empresa.direccion || '',
        codigo_postal: empresa.codigo_postal || '',
        ciudad: empresa.ciudad || '',
        provincia: empresa.provincia || '',
        pais: empresa.pais || 'España',
        email: empresa.email || '',
        telefono: empresa.telefono || '',
      });
    }
  }, [empresa, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setLogoFile(file);
    }
  };

  const onSubmit = async (data: EmpresaFormData) => {
    if (!empresa) return;

    setSaving(true);
    try {
      const success = await updateEmpresa(data);
      
      if (success) {
        toast({
          title: "Datos guardados",
          description: "La configuración de la empresa se ha actualizado correctamente",
        });
        
        // TODO: Implementar subida de logo cuando esté configurado Storage
        if (logoFile) {
          console.log('Logo file ready for upload:', logoFile.name);
          toast({
            title: "Logo preparado",
            description: "El logo se subirá cuando esté configurado el almacenamiento",
          });
        }
      } else {
        throw new Error('Error al actualizar los datos');
      }
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos Básicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nombre"
                          rules={{ required: "El nombre es obligatorio" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de la Empresa *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cif"
                          rules={{ required: "El CIF es obligatorio" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CIF/NIF *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="direccion"
                        rules={{ required: "La dirección es obligatoria" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Calle, número, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="codigo_postal"
                          rules={{ required: "El código postal es obligatorio" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="28001" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ciudad"
                          rules={{ required: "La ciudad es obligatoria" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Madrid" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="provincia"
                          rules={{ required: "La provincia es obligatoria" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provincia *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Madrid" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="pais"
                        rules={{ required: "El país es obligatorio" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="España" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email de Contacto</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="contacto@empresa.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono de Contacto</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+34 123 456 789" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                          Sube el logo de tu empresa (formato JPG o PNG, tamaño máximo 2MB)
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">
                            {logoFile ? `Archivo seleccionado: ${logoFile.name}` : 'Arrastra y suelta tu logo aquí'}
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Label htmlFor="logo-upload">
                            <Button type="button" variant="outline" className="cursor-pointer">
                              Seleccionar archivo
                            </Button>
                          </Label>
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
              </Form>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeEmpresa;
