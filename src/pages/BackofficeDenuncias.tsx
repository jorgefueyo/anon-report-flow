
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Search,
  Eye
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import { supabase } from "@/integrations/supabase/client";
import { decryptData } from "@/utils/encryption";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface DenunciaResumen {
  id: string;
  codigo_seguimiento: string;
  email_encriptado: string;
  estado: string; // Cambiado de union type a string
  categoria: string | null;
  created_at: string;
  hechos: string;
}

const BackofficeDenuncias = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncias, setDenuncias] = useState<DenunciaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
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
      cargarDenuncias();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const cargarDenuncias = async () => {
    try {
      setLoading(true);
      console.log('Cargando denuncias...');

      const { data, error } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, email_encriptado, estado, categoria, created_at, hechos')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando denuncias:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las denuncias",
          variant: "destructive",
        });
        return;
      }

      console.log('Denuncias cargadas:', data);
      // Cast para asegurar compatibilidad de tipos
      setDenuncias((data || []) as DenunciaResumen[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar denuncias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const denunciasFiltradas = denuncias.filter((denuncia) => {
    const cumpleBusqueda = searchTerm === "" || 
      denuncia.codigo_seguimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      denuncia.hechos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (denuncia.categoria && denuncia.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

    const cumpleEstado = filtroEstado === "todos" || denuncia.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  const getEmailDesencriptado = (emailEncriptado: string) => {
    try {
      return decryptData(emailEncriptado);
    } catch {
      return "Email no disponible";
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
        <BackofficeSidebar admin={admin} activeItem="denuncias" />
        
        <SidebarInset>
          <BackofficeHeader admin={admin} />

          <div className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Denuncias
                </h1>
                <Button onClick={cargarDenuncias} disabled={loading}>
                  {loading ? "Cargando..." : "Actualizar"}
                </Button>
              </div>

              {/* Filtros */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Código, categoría o descripción..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-48">
                      <label className="text-sm font-medium mb-1 block">Estado</label>
                      <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="finalizada">Finalizada</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {denuncias.length}
                    </div>
                    <p className="text-sm text-gray-500">Total denuncias</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {denuncias.filter(d => d.estado === 'pendiente').length}
                    </div>
                    <p className="text-sm text-gray-500">Pendientes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {denuncias.filter(d => d.estado === 'en_proceso').length}
                    </div>
                    <p className="text-sm text-gray-500">En proceso</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {denuncias.filter(d => d.estado === 'finalizada').length}
                    </div>
                    <p className="text-sm text-gray-500">Finalizadas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de denuncias */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Denuncias ({denunciasFiltradas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : denunciasFiltradas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron denuncias
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {denunciasFiltradas.map((denuncia) => (
                          <TableRow key={denuncia.id}>
                            <TableCell className="font-medium">
                              {denuncia.codigo_seguimiento}
                            </TableCell>
                            <TableCell>
                              {getEmailDesencriptado(denuncia.email_encriptado)}
                            </TableCell>
                            <TableCell>
                              {denuncia.categoria || 'Sin categoría'}
                            </TableCell>
                            <TableCell>
                              <EstadoBadge estado={denuncia.estado as 'pendiente' | 'en_proceso' | 'finalizada'} />
                            </TableCell>
                            <TableCell>
                              {new Date(denuncia.created_at).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/backoffice/denuncias/${denuncia.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Gestionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

export default BackofficeDenuncias;
