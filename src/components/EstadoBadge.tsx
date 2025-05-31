
import { Badge } from "@/components/ui/badge";

interface EstadoBadgeProps {
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
}

const EstadoBadge = ({ estado }: EstadoBadgeProps) => {
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

export default EstadoBadge;
