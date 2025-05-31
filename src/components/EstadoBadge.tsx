
import { Badge } from "@/components/ui/badge";

interface EstadoBadgeProps {
  estado: 'pendiente' | 'en_proceso' | 'finalizada';
}

const EstadoBadge = ({ estado }: EstadoBadgeProps) => {
  switch (estado) {
    case 'pendiente':
      return <Badge variant="secondary">Pendiente</Badge>;
    case 'en_proceso':
      return <Badge className="bg-orange-100 text-orange-800">En Proceso</Badge>;
    case 'finalizada':
      return <Badge variant="outline">Finalizada</Badge>;
    default:
      return <Badge variant="secondary">{estado}</Badge>;
  }
};

export default EstadoBadge;
