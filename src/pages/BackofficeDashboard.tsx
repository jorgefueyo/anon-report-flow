
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  FileText, 
  Building2
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import { supabase } from "@/integrations/supabase/client";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface DenunciaStats {
  total: number;
  pendientes: number;
  en_proceso: number;
  finalizadas: number;
}

const BackofficeDashboard = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<DenunciaStats>({
    total: 0,
    pendientes: 0,
    en_proceso: 0,
    finalizadas: 0
  });
  const [loading, setLoading] = useState(true);
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
      cargarEstadisticas();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      const { data: denuncias, error } = await supabase
        .from('denuncias')
        .select('estado');

      if (error) {
        console.error('Error cargando estadísticas:', error);
        return;
      }

      const total = denuncias?.length || 0;
      const pendientes = denuncias?.filter(d => d.estado === 'pendiente').length || 0;
      const en_proceso = denuncias?.filter(d => d.estado === 'en_proceso').length || 0;
      const finalizadas = denuncias?.filter(d => d.estado === 'finalizada').length || 0;

      setStats({ total, pendientes, en_proceso, finalizadas });
    } catch (error) {
      console.error('Error:', error);
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
        <BackofficeSidebar admin={admin} activeItem="dashboard" />
        
        <SidebarInset>
          <BackofficeHeader admin={admin} />

          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Dashboard Principal
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Denuncias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                    <p className="text-sm text-gray-500">Registradas en total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Denuncias Pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.pendientes}</div>
                    <p className="text-sm text-gray-500">En espera de revisión</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      En Proceso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.en_proceso}</div>
                    <p className="text-sm text-gray-500">Siendo investigadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Finalizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.finalizadas}</div>
                    <p className="text-sm text-gray-500">Casos resueltos</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Gestión de Denuncias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Revisa, asigna y gestiona todas las denuncias recibidas.
                    </p>
                    <Button onClick={() => navigate('/backoffice/denuncias')}>
                      Ver Denuncias
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Configuración de Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Configura los datos de tu empresa, logo y personalización.
                    </p>
                    <Button onClick={() => navigate('/backoffice/empresa')}>
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BackofficeDashboard;
