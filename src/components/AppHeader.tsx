
import { Building2, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEmpresa } from "@/hooks/useEmpresa";

interface AppHeaderProps {
  showButtons?: boolean;
}

const AppHeader = ({ showButtons = true }: AppHeaderProps) => {
  const { empresa, loading } = useEmpresa();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {empresa && !loading && empresa.logo_url ? (
            <img 
              src={empresa.logo_url} 
              alt={`Logo de ${empresa.nombre}`}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <Building2 className="w-8 h-8 text-blue-600" />
          )}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-gray-900">
              Canal de Denuncias
            </h1>
            {empresa && !loading && empresa.configurada && (
              <span className="text-xl font-medium text-gray-700">
                {empresa.nombre}
              </span>
            )}
          </div>
        </div>
        {showButtons && (
          <div className="flex items-center space-x-4">
            <Link to="/backoffice/cambiar-password">
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </Link>
            <Link to="/backoffice/login">
              <Button variant="outline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Acceso Backoffice
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
