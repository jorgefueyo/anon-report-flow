
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useEmpresa } from "@/hooks/useEmpresa";
import { useDenuncias } from "@/hooks/useDenuncias";
import { Denuncia } from "@/types/denuncia";
import {
  Building2,
  FileText,
  LogOut,
  Users,
  BarChart3,
  Mail,
  ArrowLeft
} from "lucide-react";
import HistorialSeguimiento from "@/components/HistorialSeguimiento";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

const BackofficeGestionDenuncia = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { empresa, loading: empresaLoading } = useEmpresa();
  const { buscarDenuncia } = useDenuncias();

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
    const cargarDenuncia = async () => {
      if (!id) {
        setError('ID de denuncia no proporcionado');
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando denuncia con código:', id);
        const denunciaEncontrada = await buscarDenuncia(id);
        if (denunciaEncontrada) {
          console.log('Denuncia encontrada:', denunciaEncontrada);
          setDenuncia(denunciaEncontrada);
          setError(null);
        } else {
          setError('Denuncia no encontrada');
        }
      } catch (error: any) {
        console.error('Error cargando denuncia:', error);
        setError(error.message || 'Error al cargar la denuncia');
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      cargarDenuncia();
    }
  }, [id, buscarDenuncia, admin]);

  const handleLogout = () => {
    localStorage.removeItem('backoffice_admin');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate('/backoffice/login');
  };

  if (!admin || empresaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const DenunciaCard = ({ denuncia }: { denuncia: Denuncia }) => (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>
            Denuncia #{denuncia.codigo_seguimiento}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Estado</Label>
            <Input type="text" value={denuncia.estado} disabled />
          </div>
          <div>
            <Label>Relación con la empresa</Label>
            <Input type="text" value={denuncia.relacion_empresa || 'No especificado'} disabled />
          </div>
          <div>
            <Label>Categoría</Label>
            <Input type="text" value={denuncia.categoria || 'No especificada'} disabled />
          </div>
          <div>
            <Label>Hechos</Label>
            <Textarea value={denuncia.hechos} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
                  className="w-full bg-blue-100"
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
                  className="w-full"
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
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestionar Denuncia
                </h1>
                <Button variant="outline" onClick={() => navigate('/backoffice/denuncias')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </div>

              {loading && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {denuncia && !loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <DenunciaCard denuncia={denuncia} />

                  <div className="lg:col-span-1">
                    <HistorialSeguimiento denunciaId={denuncia.id} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeGestionDenuncia;
