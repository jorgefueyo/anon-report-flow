
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";
import { FileText, ArrowLeft } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import BackofficeHeader from "@/components/BackofficeHeader";
import DenunciaCard from "@/components/DenunciaCard";
import { useDenuncias } from "@/hooks/useDenuncias";

const BackofficeDenuncias = () => {
  const [admin, setAdmin] = useState<any>(null);
  const { denuncias, loading } = useDenuncias();
  const navigate = useNavigate();

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
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

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
                    <DenunciaCard key={denuncia.id} denuncia={denuncia} />
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
