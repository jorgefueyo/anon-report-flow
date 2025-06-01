
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackofficeHeaderProps {
  admin: any;
}

const BackofficeHeader = ({ admin }: BackofficeHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Use localStorage consistently
    localStorage.removeItem('backoffice_admin');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    
    navigate('/backoffice/login');
  };

  return (
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
  );
};

export default BackofficeHeader;
