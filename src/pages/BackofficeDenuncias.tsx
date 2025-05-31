
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  Building2, 
  FileText, 
  LogOut, 
  Users, 
  BarChart3,
  ArrowLeft,
  Eye
} from "lucide-react";

interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
  created_at: string;
  hechos: string;
}

const BackofficeDenuncias = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar admin
    const adminData = localStorage.getItem('backoffice_admin');
    if (!adminData) {
      navigate('/backoffice/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      loadDenuncias();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const loadDenuncias = async () => {
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, categoria, estado, created_at, hechos')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading denuncias:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las denuncias",
          variant: "destructive",
        });
        return;
      }

      setDenuncias(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('backoffice_admin');
    navigate('/backoffice/login');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'asignada':
        return <Badge className="bg-blue-100 text-blue-800">Asignada</Badge>;
      case 'en_tramite':
        return <Badge className="bg-orange-100 text-orange-800">En Trámite</Badge>;
      case 'finalizada':
        return <Badge variant="outline">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
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
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Denuncias
                </h1>
                <Button variant="outline" onClick={() => navigate('/backoffice')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : denuncias.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No hay denuncias
                    </h3>
                    <p className="text-gray-600">
                      Aún no se han recibido denuncias en el sistema.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {denuncias.map((denuncia) => (
                    <Card key={denuncia.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {denuncia.codigo_seguimiento}
                          </CardTitle>
                          {getEstadoBadge(denuncia.estado)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Fecha: {new Date(denuncia.created_at).toLocaleDateString()}</span>
                          {denuncia.categoria && (
                            <span>Categoría: {denuncia.categoria}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {denuncia.hechos.substring(0, 200)}
                          {denuncia.hechos.length > 200 && '...'}
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/backoffice/denuncias/${denuncia.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeDenuncias;
