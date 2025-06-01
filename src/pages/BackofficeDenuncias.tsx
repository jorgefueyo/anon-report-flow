import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronUp,
  ChevronDown
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import EstadoBadge from "@/components/EstadoBadge";
import DenunciasFilters from "@/components/DenunciasFilters";
import { supabase } from "@/integrations/supabase/client";
import { secureDecryptData } from "@/utils/secureEncryption";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

interface DenunciaResumen {
  id: string;
  codigo_seguimiento: string;
  email_encriptado: string;
  estado: string;
  categoria: string | null;
  created_at: string;
  hechos: string;
}

type SortField = 'estado' | 'categoria' | 'created_at';
type SortDirection = 'asc' | 'desc';

const BackofficeDenuncias = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [denuncias, setDenuncias] = useState<DenunciaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Use sessionStorage instead of localStorage for consistency with security context
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

    cargarDenuncias();
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

  const denunciasFiltradas = useMemo(() => {
    let filtered = denuncias.filter((denuncia) => {
      // Filtro de búsqueda
      const cumpleBusqueda = searchTerm === "" || 
        denuncia.codigo_seguimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        denuncia.hechos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (denuncia.categoria && denuncia.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de estado
      const cumpleEstado = filtroEstado === "todos" || denuncia.estado === filtroEstado;

      // Filtro de fechas
      let cumpleFecha = true;
      if (fechaDesde) {
        const fechaDenuncia = new Date(denuncia.created_at);
        const fechaMin = new Date(fechaDesde);
        cumpleFecha = cumpleFecha && fechaDenuncia >= fechaMin;
      }
      if (fechaHasta) {
        const fechaDenuncia = new Date(denuncia.created_at);
        const fechaMax = new Date(fechaHasta);
        fechaMax.setHours(23, 59, 59, 999);
        cumpleFecha = cumpleFecha && fechaDenuncia <= fechaMax;
      }

      return cumpleBusqueda && cumpleEstado && cumpleFecha;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'categoria':
          aValue = a.categoria || '';
          bValue = b.categoria || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [denuncias, searchTerm, filtroEstado, fechaDesde, fechaHasta, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const getEmailDesencriptado = (emailEncriptado: string) => {
    try {
      return secureDecryptData(emailEncriptado);
    } catch {
      return "Email no disponible";
    }
  };

  // Función para mapear estados a los usados en EstadoBadge
  const mapearEstadoParaBadge = (estado: string): 'pendiente' | 'en_proceso' | 'finalizada' => {
    switch (estado) {
      case 'asignada':
        return 'en_proceso';
      case 'en_proceso':
        return 'en_proceso';
      case 'finalizada':
        return 'finalizada';
      default:
        return 'pendiente';
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
              <DenunciasFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filtroEstado={filtroEstado}
                setFiltroEstado={setFiltroEstado}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
              />

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {denunciasFiltradas.length}
                    </div>
                    <p className="text-sm text-gray-500">Denuncias totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {denunciasFiltradas.filter(d => d.estado === 'pendiente').length}
                    </div>
                    <p className="text-sm text-gray-500">Pendientes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {denunciasFiltradas.filter(d => d.estado === 'en_proceso' || d.estado === 'asignada').length}
                    </div>
                    <p className="text-sm text-gray-500">En proceso</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {denunciasFiltradas.filter(d => d.estado === 'finalizada').length}
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
                      No se encontraron denuncias con los filtros aplicados
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('categoria')}
                          >
                            <div className="flex items-center">
                              Categoría
                              {getSortIcon('categoria')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('estado')}
                          >
                            <div className="flex items-center">
                              Estado
                              {getSortIcon('estado')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('created_at')}
                          >
                            <div className="flex items-center">
                              Fecha
                              {getSortIcon('created_at')}
                            </div>
                          </TableHead>
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
                              <EstadoBadge estado={mapearEstadoParaBadge(denuncia.estado)} />
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
