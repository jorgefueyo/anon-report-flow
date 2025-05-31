
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/useSupabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserCheck,
  LogOut,
  Settings,
  FileText
} from "lucide-react";

const Backoffice = () => {
  const [user, setUser] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [stats, setStats] = useState({
    total_denuncias: 0,
    pendientes: 0,
    en_proceso: 0,
    finalizadas: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setUser(user);

    // Cargar datos del usuario
    const { data: userData, error } = await supabase
      .from('usuarios_backoffice')
      .select(`
        *,
        empresas (*)
      `)
      .eq('auth_user_id', user.id)
      .eq('activo', true)
      .single();

    if (error || !userData) {
      toast({
        title: "Error de acceso",
        description: "No tienes permisos para acceder al backoffice",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate('/login');
      return;
    }

    setUsuario(userData);
    setEmpresa(userData.empresas);
  };

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Obtener empresa del usuario
    const { data: userData } = await supabase
      .from('usuarios_backoffice')
      .select('empresa_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) return;

    // Cargar estadísticas de denuncias
    const { data: denuncias } = await supabase
      .from('denuncias')
      .select('estado')
      .eq('empresa_id', userData.empresa_id);

    if (denuncias) {
      const stats = {
        total_denuncias: denuncias.length,
        pendientes: denuncias.filter(d => d.estado === 'pendiente').length,
        en_proceso: denuncias.filter(d => d.estado === 'asignada' || d.estado === 'en_tramite').length,
        finalizadas: denuncias.filter(d => d.estado === 'finalizada').length
      };
      setStats(stats);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!usuario || !empresa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {empresa.nombre}
                </h1>
                <p className="text-sm text-gray-500">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {usuario.nombre} ({usuario.rol})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Denuncias
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_denuncias}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pendientes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendientes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        En Proceso
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.en_proceso}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Finalizadas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.finalizadas}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Gestión de Denuncias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Revisar, asignar y gestionar el estado de las denuncias recibidas.
                </p>
                <Button 
                  onClick={() => navigate('/backoffice/denuncias')}
                  className="w-full"
                >
                  Ver Denuncias
                </Button>
              </CardContent>
            </Card>

            {(usuario.rol === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Gestión de Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Administrar usuarios del backoffice y sus permisos.
                  </p>
                  <Button 
                    onClick={() => navigate('/backoffice/usuarios')}
                    variant="outline"
                    className="w-full"
                  >
                    Gestionar Usuarios
                  </Button>
                </CardContent>
              </Card>
            )}

            {(usuario.rol === 'admin') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuración
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Configurar datos de la empresa, branding y preferencias.
                  </p>
                  <Button 
                    onClick={() => navigate('/backoffice/empresa')}
                    variant="outline"
                    className="w-full"
                  >
                    Configurar Empresa
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Backoffice;
