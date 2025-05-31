
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
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
import { useConfiguracionCorreo } from "@/hooks/useConfiguracionCorreo";
import { 
  Building2, 
  FileText, 
  LogOut, 
  Users, 
  BarChart3,
  Mail,
  Save
} from "lucide-react";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface CorreoFormData {
  resend_api_key: string;
  dominio_remitente: string;
  nombre_remitente: string;
  email_remitente: string;
  activo: boolean;
}

const BackofficeConfiguracionCorreo = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { empresa, loading: empresaLoading } = useEmpresa();
  const { configuracion, loading: configLoading, updateConfiguracion } = useConfiguracionCorreo(empresa?.id);

  const form = useForm<CorreoFormData>({
    defaultValues: {
      resend_api_key: '',
      dominio_remitente: '',
      nombre_remitente: '',
      email_remitente: '',
      activo: false,
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
    if (configuracion) {
      form.reset({
        resend_api_key: configuracion.resend_api_key || '',
        dominio_remitente: configuracion.dominio_remitente || '',
        nombre_remitente: configuracion.nombre_remitente || '',
        email_remitente: configuracion.email_remitente || '',
        activo: configuracion.activo || false,
      });
    }
  }, [configuracion, form]);

  const onSubmit = async (data: CorreoFormData) => {
    setSaving(true);
    try {
      const result = await updateConfiguracion(data);
      
      if (result.success) {
        toast({
          title: "✅ Configuración guardada",
          description: "La configuración de correo se ha actualizado correctamente",
        });
      } else {
        throw new Error(result.error || 'Error al actualizar la configuración');
      }
    } catch (error) {
      console.error('Error saving configuracion correo:', error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración de correo",
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

  if (!admin || empresaLoading || configLoading) {
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
                  className="w-full"
                >
                  <Building2 className="w-4 h-4" />
                  Configurar Empresa
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/backoffice/configuracion-correo')}
                  className="w-full bg-blue-100"
                >
                  <Mail className="w-4 h-4" />
                  Configuración Correo
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
                Configuración de Correo
              </h1>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Resend</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="resend_api_key"
                        rules={{ required: "La API Key de Resend es obligatoria" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key de Resend *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              />
                            </FormControl>
                            <FormDescription>
                              Obtén tu API Key desde <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com/api-keys</a>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dominio_remitente"
                        rules={{ required: "El dominio remitente es obligatorio" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dominio Remitente *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="tuempresa.com" />
                            </FormControl>
                            <FormDescription>
                              Dominio verificado en Resend desde donde se enviarán los emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nombre_remitente"
                          rules={{ required: "El nombre del remitente es obligatorio" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Remitente *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Canal de Denuncias" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email_remitente"
                          rules={{ 
                            required: "El email del remitente es obligatorio",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Email inválido"
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email del Remitente *</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="denuncias@tuempresa.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="activo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Activar notificaciones por email
                              </FormLabel>
                              <FormDescription>
                                Cuando esté activado, se enviarán emails automáticos para denuncias nuevas, cambios de estado y asignaciones
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
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

export default BackofficeConfiguracionCorreo;
