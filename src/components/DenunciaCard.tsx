
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import EstadoBadge from "./EstadoBadge";
import { Denuncia } from "@/types/denuncia";

interface DenunciaCardProps {
  denuncia: Denuncia;
}

const DenunciaCard = ({ denuncia }: DenunciaCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {denuncia.codigo_seguimiento}
          </CardTitle>
          <EstadoBadge estado={denuncia.estado} />
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
  );
};

export default DenunciaCard;
